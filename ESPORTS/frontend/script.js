// A interface se comunica com o backend local por meio de fetch.
const API_URL = "http://localhost:3000/equipes";
const lista = document.querySelector("#lista-equipes");
const estadoLista = document.querySelector("#estado-lista");
const mensagem = document.querySelector("#mensagem");
const busca = document.querySelector("#busca");
const filtroJogo = document.querySelector("#filtro-jogo");
const modal = document.querySelector("#modal-equipe");
const form = document.querySelector("#form-equipe");
const campos = document.querySelector("#campos-equipe");
const salvar = document.querySelector("#salvar-equipe");
const erroForm = document.querySelector("#erro-form");
const modalExcluir = document.querySelector("#modal-excluir");
const confirmarExclusao = document.querySelector("#confirmar-exclusao");
let equipes = [];
let equipeParaExcluir = null;
let salvando = false;
let excluindo = false;
let carregando = false;
let listaDisponivel = false;

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle("error", erro);
    mensagem.hidden = false;
}

async function requisicao(caminho = "", opcoes = {}) {
    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, { ...opcoes, signal: AbortSignal.timeout(12000) });
    } catch {
        throw new Error("Não foi possível conectar ao servidor. Confira se o backend está iniciado e tente novamente.");
    }
    let dados;
    try { dados = await resposta.json(); }
    catch { throw new Error("O servidor retornou uma resposta inválida."); }
    if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
    return dados;
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function atualizarResumo() {
    document.querySelector("#total-equipes").textContent = equipes.length;
    document.querySelector("#total-jogadores").textContent = equipes.reduce((total, equipe) => total + Number(equipe.quantidade_jogadores), 0);
    document.querySelector("#total-jogos").textContent = new Set(equipes.map(equipe => equipe.jogo.trim().toLocaleLowerCase("pt-BR"))).size;
    document.querySelector("#total-regioes").textContent = new Set(equipes.map(equipe => equipe.regiao.trim().toLocaleLowerCase("pt-BR"))).size;
}

function atualizarFiltro() {
    const anterior = filtroJogo.value;
    filtroJogo.replaceChildren(new Option("Todos os jogos", ""));
    const jogos = [...new Set(equipes.map(equipe => equipe.jogo))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    jogos.forEach(jogo => filtroJogo.add(new Option(jogo, jogo)));
    if (jogos.includes(anterior)) filtroJogo.value = anterior;
}

function renderizarEquipes() {
    if (!listaDisponivel) return;
    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
    const filtradas = equipes.filter(equipe => {
        const texto = [equipe.nome, equipe.tag, equipe.regiao, equipe.cidade, equipe.jogo].join(" ").toLocaleLowerCase("pt-BR");
        return texto.includes(termo) && (!filtroJogo.value || equipe.jogo === filtroJogo.value);
    });
    lista.replaceChildren();
    for (const equipe of filtradas) {
        const linha = document.createElement("tr");
        const identidade = criarElemento("td");
        const bloco = criarElemento("div", "team-cell");
        bloco.append(criarElemento("span", "team-avatar", equipe.tag.slice(0, 3).toUpperCase()));
        const nome = criarElemento("div");
        const titulo = criarElemento("span", "team-name", equipe.nome);
        titulo.title = equipe.nome;
        nome.append(titulo, criarElemento("span", "team-tag", equipe.tag));
        bloco.append(nome);
        identidade.append(bloco);
        const jogo = criarElemento("td");
        jogo.append(criarElemento("span", "game-badge", equipe.jogo));
        const jogadores = criarElemento("td", "", equipe.quantidade_jogadores + " jogadores");
        const regiao = criarElemento("td");
        regiao.append(criarElemento("span", "region-dot"), document.createTextNode(equipe.regiao));
        const acoes = criarElemento("td");
        const botoes = criarElemento("div", "row-actions");
        const editar = criarElemento("button", "row-button", "Editar");
        editar.type = "button";
        editar.setAttribute("aria-label", "Editar " + equipe.nome);
        editar.addEventListener("click", () => abrirFormulario(equipe));
        const excluir = criarElemento("button", "row-button delete-button", "Excluir");
        excluir.type = "button";
        excluir.setAttribute("aria-label", "Excluir " + equipe.nome);
        excluir.addEventListener("click", () => abrirExclusao(equipe));
        botoes.append(editar, excluir);
        acoes.append(botoes);
        linha.append(identidade, jogo, jogadores, regiao, acoes);
        lista.append(linha);
    }
    document.querySelector("#resultado-contagem").textContent = filtradas.length + (filtradas.length === 1 ? " equipe encontrada" : " equipes encontradas");
    estadoLista.hidden = filtradas.length > 0;
    estadoLista.textContent = equipes.length ? "Nenhuma equipe corresponde à busca. Experimente outro termo ou jogo." : "Sua arena está esperando. Cadastre a primeira equipe para começar.";
}

async function carregarEquipes() {
    if (carregando) return;
    carregando = true;
    const atualizar = document.querySelector("#recarregar");
    atualizar.disabled = true;
    try {
        const dados = await requisicao();
        if (!Array.isArray(dados)) throw new Error("A lista de equipes retornada pelo servidor é inválida.");
        equipes = dados;
        listaDisponivel = true;
        atualizarResumo();
        atualizarFiltro();
        renderizarEquipes();
    } catch (erro) {
        mostrarMensagem(erro.message, true);
        if (!listaDisponivel) {
            estadoLista.textContent = "Não foi possível carregar as equipes. Use Atualizar para tentar novamente.";
            document.querySelector("#resultado-contagem").textContent = "Lista indisponível";
        }
    } finally {
        carregando = false;
        atualizar.disabled = false;
    }
}

function abrirFormulario(equipe = null) {
    form.reset();
    erroForm.hidden = true;
    document.querySelector("#equipe-id").value = equipe?.id || "";
    document.querySelector("#form-title").textContent = equipe ? "Editar equipe" : "Nova equipe";
    salvar.textContent = equipe ? "Salvar alterações ↗" : "Cadastrar equipe ↗";
    if (equipe) {
        for (const campo of ["nome", "tag", "jogo", "quantidade_jogadores", "regiao", "cidade"]) {
            form.elements[campo].value = equipe[campo] ?? "";
        }
    }
    modal.showModal();
    document.querySelector("#nome").focus();
}

function fecharFormulario() { if (!salvando) modal.close(); }
document.querySelector("#nova-equipe").addEventListener("click", () => abrirFormulario());
document.querySelector("#fechar-modal").addEventListener("click", fecharFormulario);
document.querySelector("#cancelar-form").addEventListener("click", fecharFormulario);
modal.addEventListener("cancel", evento => { if (salvando) evento.preventDefault(); });

form.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (salvando || !form.reportValidity()) return;
    const dados = {
        nome: form.elements.nome.value.trim(),
        tag: form.elements.tag.value.trim(),
        jogo: form.elements.jogo.value.trim(),
        quantidade_jogadores: Number(form.elements.quantidade_jogadores.value),
        regiao: form.elements.regiao.value.trim(),
        cidade: form.elements.cidade.value.trim()
    };
    if (![dados.nome, dados.tag, dados.jogo, dados.regiao].every(Boolean)) {
        erroForm.textContent = "Preencha os campos obrigatórios com texto válido.";
        erroForm.hidden = false;
        return;
    }
    const id = document.querySelector("#equipe-id").value;
    salvando = true;
    campos.disabled = true;
    salvar.disabled = true;
    erroForm.hidden = true;
    const textoBotao = salvar.textContent;
    salvar.textContent = "Salvando...";
    try {
        const resposta = await requisicao(id ? "/" + id : "", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        modal.close();
        mostrarMensagem(resposta.mensagem);
        await carregarEquipes();
    } catch (erro) {
        erroForm.textContent = erro.message;
        erroForm.hidden = false;
    } finally {
        salvando = false;
        campos.disabled = false;
        salvar.disabled = false;
        salvar.textContent = textoBotao;
    }
});

function abrirExclusao(equipe) {
    equipeParaExcluir = equipe;
    document.querySelector("#excluir-descricao").textContent = "Deseja excluir a equipe “" + equipe.nome + "”?";
    document.querySelector("#erro-excluir").hidden = true;
    modalExcluir.showModal();
    document.querySelector("#cancelar-exclusao").focus();
}
document.querySelector("#cancelar-exclusao").addEventListener("click", () => { if (!excluindo) modalExcluir.close(); });
modalExcluir.addEventListener("cancel", evento => { if (excluindo) evento.preventDefault(); });
confirmarExclusao.addEventListener("click", async () => {
    if (excluindo || !equipeParaExcluir) return;
    excluindo = true;
    confirmarExclusao.disabled = true;
    confirmarExclusao.textContent = "Excluindo...";
    try {
        const resposta = await requisicao("/" + equipeParaExcluir.id, { method: "DELETE" });
        modalExcluir.close();
        mostrarMensagem(resposta.mensagem);
        await carregarEquipes();
    } catch (erro) {
        const aviso = document.querySelector("#erro-excluir");
        aviso.textContent = erro.message;
        aviso.hidden = false;
    } finally {
        excluindo = false;
        confirmarExclusao.disabled = false;
        confirmarExclusao.textContent = "Excluir equipe";
    }
});

busca.addEventListener("input", renderizarEquipes);
filtroJogo.addEventListener("change", renderizarEquipes);
document.querySelector("#recarregar").addEventListener("click", () => { mensagem.hidden = true; carregarEquipes(); });
carregarEquipes();
