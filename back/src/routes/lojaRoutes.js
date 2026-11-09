import { Router } from "express";
import {
    listarProdutosSimples,
    criarProduto,
    filtrarProdutos,
    buscarProdutoPorId,
    listarProdutosDetalhados,
    atualizarEstoqueOuDesconto,
} from "../controllers/produtoController.js";
import {
    listarPedidos,
    criarPedido,
    obterResumoDashboard,
} from "../controllers/pedidoController.js";

const router = Router();

// NÍVEL 1: Básico (Array plano de objetos + POST simples)
router.get("/produtos", listarProdutosSimples);
router.post("/produtos", criarProduto);

// NÍVEL 2: Intermediário (Filtros via Query Params + Busca por ID + Objeto com metadados)
// Exemplo: GET /api/produtos/filtro?categoria=Action Figure&apenasEstoque=true&ordem=menor_preco
router.get("/produtos/filtro", filtrarProdutos);

// NÍVEL 3: Avançado (Objetos aninhados, arrays internos e atualização parcial)
router.get("/produtos/detalhados", listarProdutosDetalhados);
router.patch("/produtos/:id", atualizarEstoqueOuDesconto);
router.get("/produtos/:id", buscarProdutoPorId);

// NÍVEL 4: Chefão Full Stack (Checkout com validação de estoque, cupom e Dashboard)
router.get("/pedidos", listarPedidos);
router.post("/pedidos", criarPedido);
router.get("/dashboard", obterResumoDashboard);

export default router;

