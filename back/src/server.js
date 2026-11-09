import app from "./app.js";
import { conn } from "./config/conn.js";
import { popularBancoInicial } from "./config/seed.js";

const PORT = 3333;

const iniciarServidor = async () => {
    try {
        await conn.sync();
        console.log("Banco de dados sincronizado com sucesso!");

        await popularBancoInicial();

        app.listen(PORT, () => {
            console.log(`Servidor iniciado em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Erro ao iniciar o servidor:", error);
    }
};

await iniciarServidor();
