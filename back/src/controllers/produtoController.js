import { Op } from "sequelize";
import { produtoModel } from "../model/produtoModel.js";

export const listarProdutosSimples = async (request, response) => {
    try {
        const produtos = await produtoModel.findAll({
            attributes: ["id", "nome", "categoria", "preco", "estoque"],
            order: [["id", "ASC"]],
        });

        return response.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao listar produtos" });
    }
};

export const criarProduto = async (request, response) => {
    try {
        const {
            nome,
            categoria,
            preco,
            desconto = 0,
            estoque = 0,
            avaliacao = 5.0,
            especificacoes,
            tags,
        } = request.body;

        if (!nome || !categoria || preco === undefined) {
            return response.status(400).json({
                message: "Os campos nome, categoria e preco são obrigatórios",
            });
        }

        if (Number(preco) <= 0) {
            return response.status(400).json({
                message: "O preço do produto deve ser maior que zero",
            });
        }

        const novoProduto = await produtoModel.create({
            nome,
            categoria,
            preco: Number(preco),
            desconto: Number(desconto),
            estoque: Number(estoque),
            avaliacao: Number(avaliacao),
            especificacoes: especificacoes || {
                franquia: "Geral",
                fabricante: "GeekStore",
                edicaoLimitada: false,
            },
            tags: Array.isArray(tags) ? tags : [],
        });

        return response.status(201).json({
            message: "Produto cadastrado com sucesso!",
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao criar produto" });
    }
};

export const filtrarProdutos = async (request, response) => {
    try {
        const { categoria, busca, apenasEstoque, ordem } = request.query;

        const filtroWhere = {};

        if (categoria && categoria !== "Todas") {
            filtroWhere.categoria = categoria;
        }

        if (busca) {
            filtroWhere.nome = {
                [Op.like]: `%${busca}%`,
            };
        }

        if (apenasEstoque === "true") {
            filtroWhere.estoque = {
                [Op.gt]: 0,
            };
        }

        let ordenacao = [["id", "ASC"]];
        if (ordem === "menor_preco") ordenacao = [["preco", "ASC"]];
        if (ordem === "maior_preco") ordenacao = [["preco", "DESC"]];
        if (ordem === "melhor_avaliacao") ordenacao = [["avaliacao", "DESC"]];

        const produtos = await produtoModel.findAll({
            where: filtroWhere,
            order: ordenacao,
        });

        const todosProdutos = await produtoModel.findAll({
            attributes: ["categoria"],
        });
        const categoriasDisponiveis = [
            ...new Set(todosProdutos.map((item) => item.categoria)),
        ];

        return response.status(200).json({
            totalEncontrados: produtos.length,
            categoriasDisponiveis,
            filtrosAplicados: {
                categoria: categoria || "Todas",
                busca: busca || null,
                apenasEstoque: apenasEstoque === "true",
                ordem: ordem || "padrao",
            },
            dados: produtos,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao filtrar produtos" });
    }
};

export const buscarProdutoPorId = async (request, response) => {
    try {
        const { id } = request.params;
        const produto = await produtoModel.findByPk(id);

        if (!produto) {
            return response.status(404).json({
                message: "Produto não encontrado na Loja Geek",
            });
        }

        return response.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao buscar produto" });
    }
};

export const listarProdutosDetalhados = async (request, response) => {
    try {
        const produtos = await produtoModel.findAll({
            order: [["id", "ASC"]],
        });

        const catalogoDetalhado = produtos.map((produto) => {
            const valorDesconto = Number(
                ((produto.preco * produto.desconto) / 100).toFixed(2)
            );
            const precoFinal = Number((produto.preco - valorDesconto).toFixed(2));

            let statusEstoque = "DISPONIVEL";
            if (produto.estoque === 0) statusEstoque = "ESGOTADO";
            else if (produto.estoque <= 5) statusEstoque = "ULTIMAS_UNIDADES";

            return {
                id: produto.id,
                nome: produto.nome,
                categoria: produto.categoria,
                avaliacao: produto.avaliacao,
                precificacao: {
                    precoOriginal: produto.preco,
                    percentualDesconto: produto.desconto,
                    valorEconomizado: valorDesconto,
                    precoFinal,
                    emPromocao: produto.desconto > 0,
                },
                disponibilidade: {
                    quantidade: produto.estoque,
                    status: statusEstoque,
                    permiteCompra: produto.estoque > 0,
                },
                especificacoes: produto.especificacoes,
                tags: produto.tags,
            };
        });

        return response.status(200).json({
            loja: "GeekStore Oficial",
            moeda: "BRL",
            totalItens: catalogoDetalhado.length,
            catalogo: catalogoDetalhado,
        });
    } catch (error) {
        console.error(error);
        return response
            .status(500)
            .json({ message: "Erro ao montar catálogo detalhado" });
    }
};

export const atualizarEstoqueOuDesconto = async (request, response) => {
    try {
        const { id } = request.params;
        const { estoque, desconto, preco } = request.body;

        const produto = await produtoModel.findByPk(id);

        if (!produto) {
            return response.status(404).json({ message: "Produto não encontrado" });
        }

        if (estoque !== undefined) {
            if (Number(estoque) < 0) {
                return response.status(400).json({
                    message: "O estoque não pode ficar negativo",
                });
            }
            produto.estoque = Number(estoque);
        }

        if (desconto !== undefined) {
            if (Number(desconto) < 0 || Number(desconto) > 90) {
                return response.status(400).json({
                    message: "O desconto deve estar entre 0% e 90%",
                });
            }
            produto.desconto = Number(desconto);
        }

        if (preco !== undefined) {
            if (Number(preco) <= 0) {
                return response.status(400).json({
                    message: "O preço deve ser maior que zero",
                });
            }
            produto.preco = Number(preco);
        }

        await produto.save();

        return response.status(200).json({
            message: "Produto atualizado com sucesso",
            produto,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Erro ao atualizar produto" });
    }
};

