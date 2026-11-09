import { DataTypes } from "sequelize";
import { conn } from "../config/conn.js";

export const pedidoModel = conn.define(
    "pedidos",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cliente: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cupom: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        itens: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        valorBruto: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        valorDesconto: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        valorTotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "CONFIRMADO",
        },
    },
    {
        tableName: "pedidos",
        timestamps: true,
    }
);

export default pedidoModel;

