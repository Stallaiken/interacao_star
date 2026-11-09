import { DataTypes } from "sequelize";
import { conn } from "../config/conn.js";

export const produtoModel = conn.define(
    "produtos",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        preco: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        desconto: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Percentual de desconto (0 a 100)
        },
        estoque: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        avaliacao: {
            type: DataTypes.FLOAT,
            defaultValue: 5.0,
        },
        especificacoes: {
            type: DataTypes.JSON,
            defaultValue: {
                franquia: "Geral",
                fabricante: "GeekStore",
                edicaoLimitada: false,
            },
        },
        tags: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
    },
    {
        tableName: "produtos",
        timestamps: true,
    }
);

export default produtoModel;

