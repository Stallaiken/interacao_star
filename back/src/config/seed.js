import { produtoModel } from "../model/produtoModel.js";
import { pedidoModel } from "../model/pedidoModel.js";

export const popularBancoInicial = async () => {
    try {
        const totalProdutos = await produtoModel.count();

        if (totalProdutos > 0) {
            return;
        }

        console.log("Populando banco de dados inicial (Seed da Loja Geek)...");

        await produtoModel.bulkCreate([
            {
                nome: "Action Figure Homem de Ferro Mark LXXXV",
                categoria: "Action Figure",
                preco: 349.9,
                desconto: 10,
                estoque: 8,
                avaliacao: 4.9,
                especificacoes: {
                    franquia: "Marvel",
                    fabricante: "Iron Studios",
                    escala: "1/10",
                    edicaoLimitada: true,
                },
                tags: ["marvel", "vingadores", "colecionavel", "destaque"],
            },
            {
                nome: "Sabre de Luz Darth Vader Force FX",
                categoria: "Colecionáveis",
                preco: 899.0,
                desconto: 15,
                estoque: 3,
                avaliacao: 5.0,
                especificacoes: {
                    franquia: "Star Wars",
                    fabricante: "Hasbro",
                    escala: "1/1",
                    edicaoLimitada: true,
                },
                tags: ["star-wars", "sith", "led", "som-realista"],
            },
            {
                nome: "Teclado Mecânico RGB Cyberpunk 75%",
                categoria: "Periféricos",
                preco: 420.0,
                desconto: 0,
                estoque: 15,
                avaliacao: 4.7,
                especificacoes: {
                    franquia: "Cyberpunk",
                    fabricante: "KeyGeek",
                    switch: "Red Linear",
                    edicaoLimitada: false,
                },
                tags: ["setup", "gamer", "rgb", "mecanico"],
            },
            {
                nome: "Funko Pop! Goku Ultra Instinct #386",
                categoria: "Action Figure",
                preco: 129.9,
                desconto: 5,
                estoque: 20,
                avaliacao: 4.8,
                especificacoes: {
                    franquia: "Dragon Ball Super",
                    fabricante: "Funko",
                    escala: "Standard",
                    edicaoLimitada: false,
                },
                tags: ["anime", "dragon-ball", "funko", "presente"],
            },
            {
                nome: "Moletom Akatsuki Nuvem Vermelha",
                categoria: "Vestuário",
                preco: 189.9,
                desconto: 20,
                estoque: 12,
                avaliacao: 4.6,
                especificacoes: {
                    franquia: "Naruto Shippuden",
                    fabricante: "GeekWear",
                    material: "Algodão Flanelado",
                    edicaoLimitada: false,
                },
                tags: ["anime", "naruto", "roupa", "inverno"],
            },
            {
                nome: "Board Game Catan - O Jogo",
                categoria: "Jogos de Tabuleiro",
                preco: 279.9,
                desconto: 10,
                estoque: 6,
                avaliacao: 4.9,
                especificacoes: {
                    franquia: "Catan",
                    fabricante: "Devir",
                    jogadores: "3 a 4",
                    edicaoLimitada: false,
                },
                tags: ["estrategia", "tabuleiro", "familia"],
            },
            {
                nome: "Estátua Batman Cavaleiro das Trevas",
                categoria: "Action Figure",
                preco: 549.0,
                desconto: 0,
                estoque: 0, // Sem estoque de propósito para o aluno testar filtro e erro de compra!
                avaliacao: 4.9,
                especificacoes: {
                    franquia: "DC Comics",
                    fabricante: "McFarlane Toys",
                    escala: "1/6",
                    edicaoLimitada: true,
                },
                tags: ["dc", "batman", "esgotado", "colecionavel"],
            },
            {
                nome: "Caneca Térmica Pokébola 400ml",
                categoria: "Acessórios",
                preco: 79.9,
                desconto: 0,
                estoque: 25,
                avaliacao: 4.5,
                especificacoes: {
                    franquia: "Pokémon",
                    fabricante: "Zona Criativa",
                    material: "Inox",
                    edicaoLimitada: false,
                },
                tags: ["pokemon", "cozinha", "cafe", "barato"],
            },
        ]);

        await pedidoModel.bulkCreate([
            {
                cliente: "Lucas Skywalker",
                cupom: "GEEK10",
                itens: [
                    {
                        produtoId: 2,
                        nome: "Sabre de Luz Darth Vader Force FX",
                        quantidade: 1,
                        precoUnitario: 764.15,
                        subtotal: 764.15,
                    },
                ],
                valorBruto: 764.15,
                valorDesconto: 76.42,
                valorTotal: 687.73,
                status: "ENTREGUE",
            },
            {
                cliente: "Tony Stark",
                cupom: null,
                itens: [
                    {
                        produtoId: 1,
                        nome: "Action Figure Homem de Ferro Mark LXXXV",
                        quantidade: 2,
                        precoUnitario: 314.91,
                        subtotal: 629.82,
                    },
                    {
                        produtoId: 8,
                        nome: "Caneca Térmica Pokébola 400ml",
                        quantidade: 1,
                        precoUnitario: 79.9,
                        subtotal: 79.9,
                    },
                ],
                valorBruto: 709.72,
                valorDesconto: 0,
                valorTotal: 709.72,
                status: "CONFIRMADO",
            },
        ]);

        console.log("Seed concluído: 8 produtos e 2 pedidos criados!");
    } catch (error) {
        console.error("Erro ao popular o banco de dados inicial:", error);
    }
};

