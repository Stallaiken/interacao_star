import express from "express";
import lojaRoutes from "./routes/lojaRoutes.js";
import cors from "cors";

import "./model/produtoModel.js";
import "./model/pedidoModel.js";

const app = express();


app.use(cors({
    origin:"*", //aqui é quem tem a permissão para acessar a API    
    methods: ["GET"],
    credentials:true
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota de boas-vindas
app.get("/", (request, response) => {
    response.status(200).json({
        mensagem: "API Loja Geek funcionando! (Atenção: CORS desativado por padrão)",
        niveisDeDificuldade: {
            nivel1_Basico: {
                descricao: "Array plano de produtos e cadastro básico",
                rotas: ["GET /api/produtos", "POST /api/produtos"],
            },
            nivel2_Intermediario: {
                descricao: "Objeto com metadados, filtros via Query Params e busca por ID",
                rotas: [
                    "GET /api/produtos/filtro?categoria=Action Figure&busca=Batman&apenasEstoque=true&ordem=menor_preco",
                    "GET /api/produtos/:id",
                ],
            },
            nivel3_Avancado: {
                descricao: "Objetos aninhados (precificacao, disponibilidade, especificacoes), array de tags e PATCH",
                rotas: [
                    "GET /api/produtos/detalhados",
                    "PATCH /api/produtos/:id",
                ],
            },
            nivel4_DesafioFullStack: {
                descricao: "Criação de pedidos com validação de estoque, cálculo de cupom (GEEK10, DEV20) e Dashboard",
                rotas: [
                    "GET /api/pedidos",
                    "POST /api/pedidos",
                    "GET /api/dashboard",
                ],
            },
        },
    });
});

app.use("/api", lojaRoutes);

app.use((request, response) => {
    response.status(404).json({ message: "Rota não encontrada" });
});

export default app;
