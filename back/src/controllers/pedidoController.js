import { pedidoModel } from "../model/pedidoModel.js";
import { produtoModel } from "../model/produtoModel.js";

const CUPONS_VALIDOS = {
    GEEK10: 10, // 10% de desconto extra
    DEV20: 20,  // 20% de desconto extra
    FULLSTACK15: 15,
};

export const listarPedidos = async (request, response) => {
    try {
        const pedidos = await pedidoModel.findAll({
            order: [["createdAt", "DESC"]],
        });

        return response.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao listar pedidos" });
    }
};

export const criarPedido = async (request, response) => {
    try {
        const { cliente, cupom, itens } = request.body;

        if (!cliente || !cliente.trim()) {
            return response.status(400).json({
                erro: "VALIDACAO_CLIENTE",
                message: "O nome do cliente é obrigatório para finalizar o pedido.",
            });
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            return response.status(400).json({
                erro: "CARRINHO_VAZIO",
                message: "O pedido precisa conter pelo menos 1 item no array 'itens'.",
            });
        }

        let percentualCupom = 0;
        let codigoCupomNormalizado = null;

        if (cupom && cupom.trim() !== "") {
            codigoCupomNormalizado = cupom.trim().toUpperCase();
            if (!CUPONS_VALIDOS[codigoCupomNormalizado]) {
                return response.status(422).json({
                    erro: "CUPOM_INVALIDO",
                    message: `O cupom '${cupom}' não existe ou expirou.`,
                    cuponsAceitosParaTeste: Object.keys(CUPONS_VALIDOS),
                });
            }
            percentualCupom = CUPONS_VALIDOS[codigoCupomNormalizado];
        }

        const itensProcessados = [];
        const errosEstoque = [];
        let valorBruto = 0;

        for (const item of itens) {
            const { produtoId, quantidade } = item;
            const qtd = Number(quantidade);

            if (!produtoId || !qtd || qtd <= 0) {
                return response.status(400).json({
                    erro: "ITEM_INVALIDO",
                    message: "Cada item deve informar 'produtoId' e 'quantidade' maior que zero.",
                });
            }

            const produto = await produtoModel.findByPk(produtoId);

            if (!produto) {
                errosEstoque.push({
                    produtoId,
                    motivo: "Produto não encontrado no banco de dados",
                });
                continue;
            }

            if (produto.estoque < qtd) {
                errosEstoque.push({
                    produtoId: produto.id,
                    nome: produto.nome,
                    quantidadeSolicitada: qtd,
                    estoqueDisponivel: produto.estoque,
                    motivo:
                        produto.estoque === 0
                            ? "Produto esgotado"
                            : `Estoque insuficiente (restam apenas ${produto.estoque} unidades)`,
                });
                continue;
            }

            const precoComDescontoProduto = Number(
                (produto.preco * (1 - produto.desconto / 100)).toFixed(2)
            );
            const subtotal = Number((precoComDescontoProduto * qtd).toFixed(2));

            valorBruto = Number((valorBruto + subtotal).toFixed(2));

            itensProcessados.push({
                instanciaProduto: produto,
                resumoItem: {
                    produtoId: produto.id,
                    nome: produto.nome,
                    categoria: produto.categoria,
                    quantidade: qtd,
                    precoOriginal: produto.preco,
                    descontoProdutoPercentual: produto.desconto,
                    precoUnitario: precoComDescontoProduto,
                    subtotal,
                },
            });
        }

        if (errosEstoque.length > 0) {
            return response.status(422).json({
                erro: "ESTOQUE_INSUFICIENTE",
                message: "Não foi possível concluir o pedido devido a problemas de estoque.",
                detalhes: errosEstoque,
            });
        }

        for (const item of itensProcessados) {
            item.instanciaProduto.estoque -= item.resumoItem.quantidade;
            await item.instanciaProduto.save();
        }

        const valorDesconto = Number(
            ((valorBruto * percentualCupom) / 100).toFixed(2)
        );
        const valorTotal = Number((valorBruto - valorDesconto).toFixed(2));

        const novoPedido = await pedidoModel.create({
            cliente: cliente.trim(),
            cupom: codigoCupomNormalizado,
            itens: itensProcessados.map((i) => i.resumoItem),
            valorBruto,
            valorDesconto,
            valorTotal,
            status: "CONFIRMADO",
        });

        return response.status(201).json({
            message: "Pedido realizado com sucesso!",
            resumoFinanceiro: {
                valorBruto,
                cupomAplicado: codigoCupomNormalizado,
                percentualCupom,
                valorDesconto,
                valorTotal,
            },
            pedido: novoPedido,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao processar pedido" });
    }
};

export const obterResumoDashboard = async (request, response) => {
    try {
        const produtos = await produtoModel.findAll();
        const pedidos = await pedidoModel.findAll({
            order: [["createdAt", "DESC"]],
        });

        const faturamentoTotal = Number(
            pedidos.reduce((acc, p) => acc + p.valorTotal, 0).toFixed(2)
        );

        const produtosSemEstoque = produtos
            .filter((p) => p.estoque === 0)
            .map((p) => ({ id: p.id, nome: p.nome, categoria: p.categoria }));

        const produtosEstoqueBaixo = produtos
            .filter((p) => p.estoque > 0 && p.estoque <= 5)
            .map((p) => ({
                id: p.id,
                nome: p.nome,
                estoque: p.estoque,
            }));

        const resumoPorCategoria = produtos.reduce((acc, prod) => {
            if (!acc[prod.categoria]) {
                acc[prod.categoria] = {
                    quantidadeProdutos: 0,
                    unidadesEmEstoque: 0,
                };
            }
            acc[prod.categoria].quantidadeProdutos += 1;
            acc[prod.categoria].unidadesEmEstoque += prod.estoque;
            return acc;
        }, {});

        return response.status(200).json({
            indicadores: {
                totalProdutosCadastrados: produtos.length,
                totalPedidosRealizados: pedidos.length,
                faturamentoTotal,
                ticketMedio:
                    pedidos.length > 0
                        ? Number((faturamentoTotal / pedidos.length).toFixed(2))
                        : 0,
            },
            alertasEstoque: {
                esgotados: produtosSemEstoque,
                estoqueCritico: produtosEstoqueBaixo,
            },
            resumoPorCategoria,
            cuponsAtivos: CUPONS_VALIDOS,
            ultimosPedidos: pedidos.slice(0, 5),
        });
    } catch (error) {
        console.error(error);
        return response
            .status(500)
            .json({ message: "Erro ao carregar dados do dashboard" });
    }
};

