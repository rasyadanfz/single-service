import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Single Service API",
        description: "Sebuah API terkait perusahaan dan barang",
    },
    host: "localhost:3000",
    schemes: ["http"],
};

const output = "./swagger-output.json";
const endpointFiles = ["./app.js"];

swaggerAutogen(output, endpointFiles, doc);
