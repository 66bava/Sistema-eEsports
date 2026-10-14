import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Carrega o .env do backend mesmo quando iniciado por outra pasta.
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "esports",
    waitForConnections: true,
    connectionLimit: 10
});

async function testarConexao() {
    const conexao = await pool.getConnection();
    try {
        await conexao.query("SELECT 1");
        console.log("Banco de dados conectado com sucesso!");
    } finally {
        conexao.release();
    }
}

export { pool, testarConexao };
