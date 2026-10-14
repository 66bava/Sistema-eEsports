import express from "express";
import equipesRoutes from "./routes/campeonatosRoutes.js";
import corsMiddleware from "./middlewares/corsemiddleware.js";
import { pool, testarConexao } from "./database/conexao.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(corsMiddleware);
app.use(express.json());
app.use("/equipes", equipesRoutes);

app.get("/", function (req, res) {
    res.status(200).json({ mensagem: "API de eSports funcionando" });
});

app.use(function (req, res) {
    res.status(404).json({ mensagem: "Rota nao encontrada." });
});

app.use(function (erro, req, res, next) {
    if (erro.type === "entity.parse.failed") {
        return res.status(400).json({ mensagem: "JSON invalido." });
    }
    console.error("Erro na requisicao:", erro.message);
    return res.status(erro.status || 500).json({ mensagem: "Nao foi possivel processar a requisicao." });
});

async function iniciarServidor() {
    try {
        await testarConexao();
        const servidor = app.listen(PORT, function () {
            console.log("Servidor rodando em http://localhost:" + PORT);
        });
        servidor.on("error", async function (erro) {
            console.error("Nao foi possivel abrir a porta do servidor:", erro.code);
            await pool.end();
            process.exitCode = 1;
        });
    } catch (erro) {
        console.error("Nao foi possivel conectar ao banco de dados:", erro.code || erro.message);
        await pool.end();
        process.exitCode = 1;
    }
}

iniciarServidor();
