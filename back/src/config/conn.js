import { Sequelize } from "sequelize";

export const conn = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite"
});

try {
    await conn.authenticate();
    console.log("Banco de dados conectado com sucesso!");
} catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
}