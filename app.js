import prismaSingleton from "./prismaClientSingleton/prismaSingleton.js";
import PrismaWithRetry from "./prismaDecorator/PrismaWithRetry.js";
import express from "express";
import cors from "cors";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ResponseDirector from "./responseBuilder/responseDirector.js";
import { readFile } from "fs/promises";
import swaggerUi from "swagger-ui-express";

const swaggerOutput = JSON.parse(
    await readFile(new URL("./swagger/swagger-output.json", import.meta.url))
);

const corsOption = {
    origin: "https://ohl-fe.vercel.app",
};

const app = express();
app.use(express.json());
app.use(cors(corsOption));
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
const PORT = process.env.NODE_DOCKER_PORT || 3000;

app.listen(PORT, () => {});

// Middlewares
const validateToken = (req, res, next) => {
    const token = req.get("Authorization");
    if (token) {
        try {
            if (
                token.substring(7, token.length) == process.env.MONOLITH_SECRET
            ) {
                next();
                return;
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            if (!payload.admin) {
                return res.send(
                    ResponseDirector.createErrorResponse("Unauthorized Access")
                );
            }
            req.payload = payload;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.send(
                    ResponseDirector.createErrorResponse("Unauthorized Access")
                );
            }
            return res.send(
                ResponseDirector.createErrorResponse("Bad Request")
            );
        }
        next();
    } else {
        res.send(ResponseDirector.createErrorResponse("Unauthorized Access"));
    }
};

const checkCode = (codes) => {
    const isUppercase = (c) => c === c.toUpperCase();
    const isLetter = (c) => (c.toUpperCase() != c.toLowerCase() ? true : false);
    if (codes.length != 3) {
        return false;
    }

    for (let i = 0; i < 3; i++) {
        if (!isLetter(codes[i]) || !isUppercase(codes[i])) {
            return false;
        }
    }
    return true;
};

const prisma = new PrismaWithRetry(prismaSingleton.prisma);

app.post("/login", async (req, res) => {
    if (req) {
        const { username, password } = req.body;
        let dbData;
        try {
            dbData = await prisma.findFirst("admin", {
                where: { username: username },
            });
        } catch (error) {
            res.send(
                ResponseDirector.createErrorResponse(
                    "Failed to get credentials!"
                )
            );
            return;
        }
        let finalResponse;
        let isPasswordValid = await bcrypt.compare(password, dbData.password);
        if (username == dbData.username && isPasswordValid) {
            const access_token = jwt.sign(
                { username: username, name: dbData.name, admin: true },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.cookie("access_token", access_token, { httpOnly: true });
            const data = {
                user: { username: dbData.username, name: dbData.name },
                token: access_token,
            };
            const response = ResponseDirector.createSuccessResponse(
                "Success",
                data
            );
            finalResponse = response;
        } else {
            finalResponse = ResponseDirector.createErrorResponse(
                "Invalid credentials!"
            );
        }
        res.send(finalResponse);
    }
});

app.get("/self", validateToken, async (req, res) => {
    let data;
    try {
        data = await prisma.findFirst("admin", {
            where: { username: req.payload.username },
        });
    } catch (error) {
        res.send(
            ResponseDirector.createErrorResponse("Failed to get credentials!")
        );
        return;
    }

    if (data) {
        res.send(
            ResponseDirector.createSuccessResponse("Success", {
                username: req.payload.username,
                name: req.payload.name,
            })
        );
    } else {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
    }
});

app.get("/barang", async (req, res) => {
    const { q, perusahaan } = req.query;
    let listBarang;
    if (q) {
        try {
            listBarang = await prisma.findMany("barang", {
                where: {
                    OR: [
                        {
                            nama: { contains: q },
                        },
                        {
                            kode: { contains: q },
                        },
                    ],
                },
            });
        } catch (e) {
            res.send(
                ResponseDirector.createErrorResponse(
                    "Failed to get list of barang!"
                )
            );
            return;
        }
    } else if (perusahaan) {
        try {
            listBarang = await prisma.findMany("barang", {
                where: {
                    perusahaan_id: perusahaan,
                },
            });
        } catch (error) {
            res.send(
                ResponseDirector.createErrorResponse(
                    "Failed to get list of barang with the specified perusahaan!"
                )
            );
            return;
        }
    } else {
        try {
            listBarang = await prisma.findMany("barang");
        } catch (e) {
            res.send(
                ResponseDirector.createErrorResponse(
                    "Failed to retrieve list of Barang"
                )
            );
            return;
        }
    }
    if (listBarang) {
        res.send(ResponseDirector.createSuccessResponse("Success", listBarang));
    }
});

app.get("/barang/:id", async (req, res) => {
    const { id } = req.params;
    let data;
    try {
        data = await prisma.findUnique("barang", {
            where: { id: id },
        });
    } catch (error) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
        return;
    }
    if (data) {
        res.send(ResponseDirector.createSuccessResponse("Success", data));
    } else {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
    }
});

app.post("/barang", validateToken, async (req, res) => {
    const { nama, harga, stok, perusahaan_id, kode } = req.body;
    const kodeList = await prisma.findMany("barang", {
        where: { kode: kode },
    });
    if (harga <= 0 || stok < 0 || !perusahaan_id || kodeList.length > 0) {
        res.send(ResponseDirector.createErrorResponse("Invalid item data!"));
        return;
    }

    let insertedItem;
    try {
        insertedItem = await prisma.create("barang", {
            data: {
                nama: nama,
                harga: harga,
                stok: stok,
                perusahaan_id: perusahaan_id,
                kode: kode,
            },
        });
    } catch (error) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong"));
        return;
    }

    if (!insertedItem) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong"));
        return;
    }
    res.send(ResponseDirector.createSuccessResponse("Success", insertedItem));
});

app.put("/barang/:id", validateToken, async (req, res) => {
    const { nama, harga, stok, perusahaan_id, kode } = req.body;
    const id = req.params.id;
    const current = await prisma.findUnique("barang", { where: { id: id } });
    const kodeList = await prisma.findMany("barang", {
        where: { kode: kode },
    });
    if (
        harga <= 0 ||
        stok < 0 ||
        !perusahaan_id ||
        (current.kode != kode && kodeList.length > 0)
    ) {
        res.send(ResponseDirector.createErrorResponse("Invalid item data!"));
        return;
    }

    let updatedItem;
    try {
        updatedItem = await prisma.update("barang", {
            where: { id: id },
            data: {
                nama: nama,
                harga: harga,
                stok: stok,
                perusahaan_id: perusahaan_id,
                kode: kode,
            },
        });
    } catch (error) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
        return;
    }

    if (!updatedItem) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
        return;
    }

    res.send(ResponseDirector.createSuccessResponse("Success", updatedItem));
});

app.delete("/barang/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    let deletedItem;
    try {
        deletedItem = await prisma.delete("barang", { where: { id: id } });
    } catch (error) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong"));
        return;
    }
    if (!deletedItem) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong"));
        return;
    }

    res.send(
        ResponseDirector.createSuccessResponse(
            "Successful item delete",
            deletedItem
        )
    );
});

app.get("/perusahaan/:id", async (req, res) => {
    const { id } = req.params;
    let data;
    try {
        data = await prisma.findFirst("perusahaan", {
            where: { id: id },
        });
    } catch (err) {
        res.send(
            ResponseDirector.createErrorResponse(
                "Failed to retrieve perusahaan with id!"
            )
        );
        return;
    }

    if (data) {
        res.send(ResponseDirector.createSuccessResponse("Success", data));
    } else {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
    }
});

app.get("/perusahaan", async (req, res) => {
    const { q } = req.query;

    let response;
    let listPerusahaan;
    try {
        listPerusahaan = await prisma.findMany("perusahaan");
        if (q) {
            listPerusahaan = await prisma.findMany("perusahaan", {
                where: {
                    OR: [
                        {
                            nama: { contains: q },
                        },
                        {
                            kode: { contains: q },
                        },
                    ],
                },
            });
        }
    } catch (error) {
        res.send(
            ResponseDirector.createErrorResponse(
                "Failed to retrieve list of companies"
            )
        );
        return;
    }

    response = ResponseDirector.createSuccessResponse(
        "Successfully retrieved list Perusahaan!",
        listPerusahaan
    );
    res.send(response);
});

app.post("/perusahaan", validateToken, async (req, res) => {
    const { nama, alamat, no_telp, kode } = req.body;
    let perusahaan;
    if (!nama || !alamat || !no_telp || !kode) {
        res.send(ResponseDirector.createErrorResponse("Invalid company data!"));
        return;
    }
    const code = [...kode];

    if (checkCode(code)) {
        try {
            perusahaan = await prisma.create("perusahaan", {
                data: {
                    nama: nama,
                    alamat: alamat,
                    no_telp: no_telp,
                    kode: kode,
                },
            });
        } catch (error) {
            res.send("Something went wrong!");
            return;
        }
        res.send(
            ResponseDirector.createSuccessResponse(
                "Successfully created a new company!",
                perusahaan
            )
        );
    } else {
        res.send(ResponseDirector.createErrorResponse("Invalid company code"));
    }
});

app.put("/perusahaan/:id", validateToken, async (req, res) => {
    const { nama, alamat, no_telp, kode } = req.body;
    if (kode && !checkCode([...kode])) {
        res.send(ResponseDirector.createErrorResponse("Invalid company code!"));
        return;
    }
    const id = req.params.id;
    try {
        const { currId, currNama, currAlamat, currNo_Telp, currKode } =
            await prisma.findUnique("perusahaan", { where: { id: id } });
        const update = await prisma.update("perusahaan", {
            where: { id: id },
            data: {
                nama: nama ? nama : currNama,
                alamat: alamat ? alamat : currAlamat,
                no_telp: no_telp ? no_telp : currNo_Telp,
                kode: kode ? kode : currKode,
            },
        });
        res.send(
            ResponseDirector.createSuccessResponse(
                "Successfully updated company!",
                update
            )
        );
    } catch (e) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong!"));
    }
});

app.delete("/perusahaan/:id", validateToken, async (req, res) => {
    const { id } = req.params;
    let deletedCompanyItems, deletedCompany;
    try {
        deletedCompanyItems = await prisma.deleteMany("barang", {
            where: { perusahaan_id: id },
        });
        if (!deletedCompanyItems) {
            res.send(
                ResponseDirector.createErrorResponse("Something went wrong")
            );
            return;
        }

        deletedCompany = await prisma.delete("perusahaan", {
            where: { id: id },
        });
        if (!deletedCompany) {
            res.send(
                ResponseDirector.createErrorResponse("Something went wrong")
            );
            return;
        }
    } catch (error) {
        res.send(ResponseDirector.createErrorResponse("Something went wrong"));
        return;
    }

    res.send(
        ResponseDirector.createSuccessResponse(
            "Successful delete on company",
            deletedCompany
        )
    );
});
