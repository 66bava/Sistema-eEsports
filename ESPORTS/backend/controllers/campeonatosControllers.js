import { pool } from "../database/conexao.js";

function validarId(valor) {
    const id = Number(valor);
    return /^\d+$/.test(valor) && Number.isInteger(id) && id > 0 && id <= 2147483647;
}

function validarEquipe(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        return "Envie os dados da equipe em JSON.";
    }
    const campos = { nome: 100, tag: 10, jogo: 80, regiao: 50 };
    for (const [campo, limite] of Object.entries(campos)) {
        if (typeof dados[campo] !== "string" || !dados[campo].trim()) {
            return "Preencha o campo " + campo + ".";
        }
        if (dados[campo].trim().length > limite) {
            return "O campo " + campo + " aceita ate " + limite + " caracteres.";
        }
    }
    if (!Number.isInteger(dados.quantidade_jogadores) || dados.quantidade_jogadores < 1 || dados.quantidade_jogadores > 2147483647) {
        return "A quantidade de jogadores deve ser um numero inteiro positivo.";
    }
    if (dados.cidade != null && (typeof dados.cidade !== "string" || dados.cidade.trim().length > 100)) {
        return "A cidade deve ser um texto de ate 100 caracteres.";
    }
    return null;
}

function valoresEquipe(dados) {
    return [dados.nome.trim(), dados.tag.trim(), dados.jogo.trim(),
        dados.quantidade_jogadores, dados.regiao.trim(), dados.cidade?.trim() || null];
}

function responderErro(res, erro) {
    console.error("Erro no banco de dados:", erro.code || erro.message);
    if (erro.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({ mensagem: "A equipe possui jogadores, inscricoes, partidas ou apostas vinculados. Remova os vinculos antes de excluir." });
    }
    return res.status(500).json({ mensagem: "Nao foi possivel concluir a operacao no banco de dados." });
}

async function listarEquipes(req, res) {
    try {
        const [equipes] = await pool.query("SELECT * FROM equipes ORDER BY id");
        return res.status(200).json(equipes);
    } catch (erro) { return responderErro(res, erro); }
}

async function buscarEquipe(req, res) {
    if (!validarId(req.params.id)) return res.status(400).json({ mensagem: "ID invalido." });
    try {
        const [equipes] = await pool.execute("SELECT * FROM equipes WHERE id = ?", [Number(req.params.id)]);
        if (!equipes.length) return res.status(404).json({ mensagem: "Equipe nao encontrada." });
        return res.status(200).json(equipes[0]);
    } catch (erro) { return responderErro(res, erro); }
}

async function cadastrarEquipe(req, res) {
    const mensagem = validarEquipe(req.body);
    if (mensagem) return res.status(400).json({ mensagem });
    try {
        const [resultado] = await pool.execute(
            "INSERT INTO equipes (nome, tag, jogo, quantidade_jogadores, regiao, cidade) VALUES (?, ?, ?, ?, ?, ?)",
            valoresEquipe(req.body)
        );
        return res.status(201).json({ mensagem: "Equipe cadastrada com sucesso!", id: resultado.insertId });
    } catch (erro) { return responderErro(res, erro); }
}

async function atualizarEquipe(req, res) {
    if (!validarId(req.params.id)) return res.status(400).json({ mensagem: "ID invalido." });
    const mensagem = validarEquipe(req.body);
    if (mensagem) return res.status(400).json({ mensagem });
    try {
        const [resultado] = await pool.execute(
            "UPDATE equipes SET nome = ?, tag = ?, jogo = ?, quantidade_jogadores = ?, regiao = ?, cidade = ? WHERE id = ?",
            [...valoresEquipe(req.body), Number(req.params.id)]
        );
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Equipe nao encontrada." });
        return res.status(200).json({ mensagem: "Equipe atualizada com sucesso!" });
    } catch (erro) { return responderErro(res, erro); }
}

async function excluirEquipe(req, res) {
    if (!validarId(req.params.id)) return res.status(400).json({ mensagem: "ID invalido." });
    try {
        const [resultado] = await pool.execute("DELETE FROM equipes WHERE id = ?", [Number(req.params.id)]);
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Equipe nao encontrada." });
        return res.status(200).json({ mensagem: "Equipe excluida com sucesso!" });
    } catch (erro) { return responderErro(res, erro); }
}

export { listarEquipes, buscarEquipe, cadastrarEquipe, atualizarEquipe, excluirEquipe };
