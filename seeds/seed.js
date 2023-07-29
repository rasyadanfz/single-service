import { PrismaClient } from "@prisma/client";
import {
    companyName,
    companyNum,
    address,
    companyCode,
    items,
    kodeBarang,
} from "./seedHelper.js";

const prisma = new PrismaClient();
const barangList = Array.from(items);
const kodeBarangList = Array.from(kodeBarang);
const companyList = [];

async function resetDatabase() {
    await prisma.barang.deleteMany();
    await prisma.perusahaan.deleteMany();
    await prisma.admin.deleteMany();

    for (let i = 0; i < companyName.length; i++) {
        let nama = companyName.at(i);
        let alamat = address.at(i);
        let notelp = companyNum.at(i);
        let kode = companyCode.at(i);

        let company = {
            nama: nama,
            alamat: alamat,
            no_telp: notelp,
            kode: kode,
        };
        const newCompany = await prisma.perusahaan.create({ data: company });
        companyList.push(newCompany);
    }

    await insertBarang();
    await insertAdmin();
}

const insertBarang = async () => {
    let len = barangList.length;
    while (len > 0) {
        const itemNum = Math.floor(Math.random() * len);
        let newItem = {
            nama: barangList.at(itemNum),
            harga: Math.floor(Math.random() * 150000),
            stok: Math.floor(Math.random() * 10),
            kode: kodeBarangList.at(itemNum),
            perusahaan_id: companyList.at(
                Math.floor(Math.random() * companyList.length)
            ).id,
        };
        await prisma.barang.create({ data: newItem });
        barangList.splice(itemNum, 1);
        kodeBarangList.splice(itemNum, 1);
        len--;
    }
};

const insertAdmin = async () => {
    const hashedPw =
        "$2y$12$VFXnSCKrJRlmR8BNGHonAOB5XvNfN5sQLYHSeMvSF7LG66ypzIEBy";
    let result = await prisma.admin.create({
        data: {
            name: "admin",
            username: "adminss",
            password: hashedPw,
        },
    });
};

resetDatabase()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        await prisma.$disconnect();
        process.exit(1);
    });
