// =========================================================
// 1. ELEMENTOS DA TELA E CONFIGURAÇÕES
// =========================================================
const listaPacientes = document.getElementById("listaPacientes");
const campoBusca = document.getElementById("campoBusca");
const contador = document.getElementById("contador");
const paginacao = document.getElementById("paginacao");

const btnSair = document.getElementById("btnSair");
const btnDiminuir = document.getElementById("btnDiminuir");
const btnAumentar = document.getElementById("btnAumentar");
const btnTema = document.getElementById("btnTema");

// Chaves do localStorage (as mesmas usadas na Tela-inicial)
const CHAVE_PACIENTES = "pacientes";            // lista com todos os pacientes
const CHAVE_ANTIGA = "prontuarioPaciente";      // versão antiga (um paciente só)
const CHAVE_EDICAO = "pacienteEmEdicao";        // qual paciente a Tela-inicial deve abrir para editar

const PACIENTES_POR_PAGINA = 5;                 // igual à imagem de referência

// Ordem do status ao clicar: Ativo → Em andamento → Em alta → Ativo
const PROXIMO_STATUS = {
    "Ativo": "Em andamento",
    "Em andamento": "Em alta",
    "Em alta": "Ativo"
};

// Classe CSS de cada status (define a cor da etiqueta)
const CLASSE_STATUS = {
    "Ativo": "status-ativo",
    "Em andamento": "status-andamento",
    "Em alta": "status-alta"
};

// Ícones usados na lista
const ICONE_PESSOA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>';
const ICONE_SETA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>';
const ICONE_LAPIS = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="M14 6l4 4" /></svg>';
const ICONE_LIXEIRA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>';

// Estado da tela
let pacientes = lerPacientes();   // todos os pacientes salvos
let paginaAtual = 1;
const abertos = new Set();        // ids dos pacientes com os detalhes abertos


// =========================================================
// 2. LOCALSTORAGE: LER E GRAVAR A LISTA DE PACIENTES
// =========================================================
function lerPacientes() {
    try {
        const lista = JSON.parse(localStorage.getItem(CHAVE_PACIENTES));
        if (Array.isArray(lista)) return lista;

        // Se existir um paciente salvo na versão antiga, transforma em lista
        const antigo = JSON.parse(localStorage.getItem(CHAVE_ANTIGA));
        if (antigo) {
            antigo.id = String(Date.now());
            antigo.status = "Ativo";
            const novaLista = [antigo];
            localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(novaLista));
            localStorage.removeItem(CHAVE_ANTIGA);
            return novaLista;
        }
    } catch (e) {
        // Dados ilegíveis ou localStorage bloqueado: começa com a lista vazia
    }
    return [];
}

function gravarPacientes() {
    try {
        localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(pacientes));
    } catch (e) {
        alert("Não foi possível salvar as alterações neste navegador.");
    }
}


// =========================================================
// 3. FUNÇÕES DE FORMATAÇÃO
// =========================================================

// Protege a página: textos digitados pelo usuário são mostrados como texto,
// nunca interpretados como código HTML.
function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Mesma função de máscara da Tela-inicial: cada "0" do modelo vira um número
function aplicarMascara(numeros, modelo) {
    let resultado = "";
    let posicao = 0;
    for (const caractere of modelo) {
        if (posicao >= numeros.length) break;
        if (caractere === "0") {
            resultado += numeros[posicao];
            posicao++;
        } else {
            resultado += caractere;
        }
    }
    return resultado;
}

// "1990-05-10" → "10/05/1990"
function formatarData(iso) {
    if (!iso) return "";
    const partes = iso.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Idade em anos completos a partir da data de nascimento
function calcularIdade(iso) {
    if (!iso) return null;
    const nascimento = new Date(iso + "T00:00:00");
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const faltaAniversario =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
    if (faltaAniversario) idade--;
    return idade;
}

// "34 anos — Feminino"
function textoIdadeSexo(identificacao) {
    const idade = calcularIdade(identificacao.dataNascimento);
    let texto = "";
    if (idade !== null) {
        if (idade === 0) texto = "Menos de 1 ano";
        else if (idade === 1) texto = "1 ano";
        else texto = idade + " anos";
    }
    if (identificacao.sexo) {
        texto += (texto ? " — " : "") + identificacao.sexo;
    }
    return texto;
}

// Junta valor e unidade só se o valor existir. Ex.: "72" + " bpm"
function comUnidade(valor, unidade) {
    return valor ? valor + unidade : "";
}

// Remove acentos e deixa tudo minúsculo, para a busca ignorar essas diferenças
function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}


// =========================================================
// 4. BUSCA
// Procura no nome (inteiro ou em parte), no ID e no número do prontuário.
// =========================================================
function pacientesFiltrados() {
    const termo = normalizar(campoBusca.value.trim());

    // Mais recentes primeiro (o id é a data/hora em que o paciente foi criado)
    const ordenados = pacientes.slice().sort(function (a, b) {
        return Number(b.id) - Number(a.id);
    });

    if (termo === "") return ordenados;

    return ordenados.filter(function (paciente) {
        const i = paciente.identificacao;
        return normalizar(i.nome).includes(termo) ||
               normalizar(i.idPaciente).includes(termo) ||
               normalizar(i.numeroProntuario).includes(termo);
    });
}

// Ao digitar, volta para a página 1 e mostra os resultados
campoBusca.addEventListener("input", function () {
    paginaAtual = 1;
    mostrarLista();
});


// =========================================================
// 5. MONTAR A LISTA NA TELA
// =========================================================
function mostrarLista() {
    const filtrados = pacientesFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PACIENTES_POR_PAGINA));

    // Se a página atual deixou de existir (ex.: após excluir), vai para a última
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    // Pega só os pacientes da página atual
    const inicio = (paginaAtual - 1) * PACIENTES_POR_PAGINA;
    const daPagina = filtrados.slice(inicio, inicio + PACIENTES_POR_PAGINA);

    if (pacientes.length === 0) {
        listaPacientes.innerHTML = '<p class="lista-vazia">Nenhum paciente cadastrado ainda. Clique em "Novo prontuário" para cadastrar.</p>';
    } else if (filtrados.length === 0) {
        listaPacientes.innerHTML = '<p class="lista-vazia">Nenhum paciente encontrado.</p>';
    } else {
        listaPacientes.innerHTML = daPagina.map(montarPaciente).join("");
    }

    // Contador: "Mostrando 5 de 27 pacientes"
    const palavra = filtrados.length === 1 ? "paciente" : "pacientes";
    contador.textContent = "Mostrando " + daPagina.length + " de " + filtrados.length + " " + palavra;

    montarPaginacao(totalPaginas);
}

// HTML de um paciente (linha + detalhes, se estiverem abertos)
function montarPaciente(paciente) {
    const i = paciente.identificacao;
    const s = paciente.sinaisVitais;
    const status = CLASSE_STATUS[paciente.status] ? paciente.status : "Ativo";
    const aberto = abertos.has(paciente.id);

    const ultimoAtendimento = s.dataAfericao
        ? formatarData(s.dataAfericao) + (s.horario ? " " + s.horario : "")
        : "—";

    return `
        <article class="paciente">
            <div class="linha">
                <div class="col-paciente">
                    <span class="avatar">${ICONE_PESSOA}</span>
                    <div>
                        <p class="nome">${escapar(i.nome)}</p>
                        <p class="sub">${escapar(textoIdadeSexo(i))}</p>
                    </div>
                </div>
                <div class="col col-id" data-rotulo="ID">${escapar(i.idPaciente)}</div>
                <div class="col col-pront" data-rotulo="Prontuário">${escapar(i.numeroProntuario)}</div>
                <div class="col col-data" data-rotulo="Último atendimento">${escapar(ultimoAtendimento)}</div>
                <div class="col col-status" data-rotulo="Status">
                    <button type="button" class="status ${CLASSE_STATUS[status]}"
                            data-acao="status" data-id="${escapar(paciente.id)}"
                            aria-label="Status: ${status}. Clique para alterar.">${status}</button>
                </div>
                <div class="col-acoes">
                    <button type="button" class="btn-expandir"
                            data-acao="expandir" data-id="${escapar(paciente.id)}"
                            aria-expanded="${aberto}" aria-controls="detalhes-${escapar(paciente.id)}"
                            aria-label="${aberto ? "Ocultar" : "Ver"} detalhes de ${escapar(i.nome)}">${ICONE_SETA}</button>
                </div>
            </div>
            ${aberto ? montarDetalhes(paciente) : ""}
        </article>`;
}

// Uma informação dos detalhes (rótulo + valor)
function item(rotulo, valor) {
    if (!valor) {
        return `<div><span class="info-rotulo">${rotulo}</span><span class="info-valor vazio">Não informado</span></div>`;
    }
    return `<div><span class="info-rotulo">${rotulo}</span><span class="info-valor">${escapar(valor)}</span></div>`;
}

// Todos os dados cadastrados na Tela-inicial
function montarDetalhes(paciente) {
    const i = paciente.identificacao;
    const a = paciente.anamnese;
    const e = paciente.exameClinico;
    const s = paciente.sinaisVitais;

    const mascaraDocumento = i.documento.length === 14 ? "00.000.000/0000-00" : "000.000.000-00";

    return `
        <div class="detalhes" id="detalhes-${escapar(paciente.id)}">
            <div class="bloco">
                <h3>Identificação</h3>
                <div class="info-grade">
                    ${item("Nome completo", i.nome)}
                    ${item("Sexo", i.sexo)}
                    ${item(i.tipoDocumento || "CPF ou CNPJ", aplicarMascara(i.documento, mascaraDocumento))}
                    ${item("Telefone", aplicarMascara(i.telefone, "(00) 00000-0000"))}
                    ${item("Endereço", i.endereco)}
                    ${item("Número do prontuário", i.numeroProntuario)}
                    ${item("Data de nascimento", formatarData(i.dataNascimento))}
                    ${item("ID do paciente", i.idPaciente)}
                </div>
            </div>

            <div class="bloco">
                <h3>Anamnese</h3>
                <div class="info-grade">
                    ${item("Queixa principal", a.queixaPrincipal)}
                    ${item("História da doença / condição atual", a.historiaDoenca)}
                    ${item("Alergias", a.alergias)}
                    ${item("Especificação da alergia", a.especificacaoAlergia)}
                    ${item("Uso de medicamentos", a.usoMedicamentos)}
                    ${item("Quais medicamentos", a.medicamentos)}
                </div>
            </div>

            <div class="bloco">
                <h3>Exame clínico</h3>
                <div class="info-grade">
                    ${item("Estado geral", e.estadoGeral)}
                    ${item("Pele e mucosa", e.peleMucosa)}
                    ${item("Sistema respiratório", e.sistemaRespiratorio)}
                    ${item("Nível de consciência", e.nivelConsciencia)}
                    ${item("Orientação", e.orientacao)}
                    ${item("Cabeça e pescoço", e.cabecaPescoco)}
                    ${item("Sistema cardiovascular", e.sistemaCardiovascular)}
                    ${item("Abdômen", e.abdomen)}
                </div>
            </div>

            <div class="bloco">
                <h3>Sinais vitais</h3>
                <div class="info-grade">
                    ${item("Data da aferição", formatarData(s.dataAfericao))}
                    ${item("Horário", s.horario)}
                    ${item("Frequência respiratória", comUnidade(s.frequenciaRespiratoria, " irpm"))}
                    ${item("Pressão arterial", comUnidade(s.pressaoArterial, " mmHg"))}
                    ${item("Temperatura", comUnidade(s.temperatura, " °C"))}
                    ${item("Saturação de O2", comUnidade(s.saturacaoO2, "%"))}
                    ${item("Frequência cardíaca", comUnidade(s.frequenciaCardiaca, " bpm"))}
                    ${item("Dor (0 a 10)", s.dor ? s.dor + " / 10" : "")}
                </div>
            </div>

            <div class="detalhes-acoes">
                <button type="button" class="btn btn-editar" data-acao="editar" data-id="${escapar(paciente.id)}">${ICONE_LAPIS} Editar</button>
                <button type="button" class="btn btn-excluir" data-acao="excluir" data-id="${escapar(paciente.id)}">${ICONE_LIXEIRA} Excluir</button>
            </div>
        </div>`;
}


// =========================================================
// 6. PAGINAÇÃO
// =========================================================

// Quais números aparecem. Ex.: 1 2 3 4 … 9  ou  1 … 4 5 6 … 9
function numerosDaPaginacao(atual, total) {
    const numeros = [];

    if (total <= 7) {
        for (let n = 1; n <= total; n++) numeros.push(n);
        return numeros;
    }

    let inicio = Math.max(2, atual - 1);
    let fim = Math.min(total - 1, atual + 1);
    if (atual <= 3) { inicio = 2; fim = 4; }
    if (atual >= total - 2) { inicio = total - 3; fim = total - 1; }

    numeros.push(1);
    if (inicio > 2) numeros.push("…");
    for (let n = inicio; n <= fim; n++) numeros.push(n);
    if (fim < total - 1) numeros.push("…");
    numeros.push(total);
    return numeros;
}

function montarPaginacao(totalPaginas) {
    let html = `<button type="button" class="pagina" data-pagina="${paginaAtual - 1}"
                    ${paginaAtual === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button>`;

    numerosDaPaginacao(paginaAtual, totalPaginas).forEach(function (n) {
        if (n === "…") {
            html += '<span class="reticencias" aria-hidden="true">…</span>';
        } else {
            const atual = n === paginaAtual;
            html += `<button type="button" class="pagina ${atual ? "atual" : ""}" data-pagina="${n}"
                        ${atual ? 'aria-current="page"' : ""} aria-label="Página ${n}">${n}</button>`;
        }
    });

    html += `<button type="button" class="pagina" data-pagina="${paginaAtual + 1}"
                ${paginaAtual === totalPaginas ? "disabled" : ""} aria-label="Próxima página">›</button>`;

    paginacao.innerHTML = html;
}

paginacao.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-pagina]");
    if (!botao || botao.disabled) return;

    paginaAtual = Number(botao.dataset.pagina);
    mostrarLista();
    listaPacientes.scrollIntoView({ behavior: "smooth", block: "start" });
});


// =========================================================
// 7. AÇÕES DE CADA PACIENTE: STATUS, DETALHES, EDITAR, EXCLUIR
// Um único "ouvinte" na lista descobre qual botão foi clicado
// pelos atributos data-acao e data-id.
// =========================================================
listaPacientes.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.acao;

    if (acao === "status") mudarStatus(id);
    if (acao === "expandir") alternarDetalhes(id);
    if (acao === "editar") editarPaciente(id);
    if (acao === "excluir") excluirPaciente(id);
});

function buscarPorId(id) {
    return pacientes.find(function (p) { return p.id === id; });
}

// Devolve o foco ao botão depois que a lista é redesenhada (ajuda quem usa teclado)
function focar(acao, id) {
    const botao = listaPacientes.querySelector('[data-acao="' + acao + '"][data-id="' + id + '"]');
    if (botao) botao.focus();
}

// Ativo → Em andamento → Em alta → Ativo (e salva)
function mudarStatus(id) {
    const paciente = buscarPorId(id);
    if (!paciente) return;

    paciente.status = PROXIMO_STATUS[paciente.status] || "Em andamento";
    gravarPacientes();
    mostrarLista();
    focar("status", id);
}

// Abre ou fecha os detalhes
function alternarDetalhes(id) {
    if (abertos.has(id)) {
        abertos.delete(id);
    } else {
        abertos.add(id);
    }
    mostrarLista();
    focar("expandir", id);
}

// Editar: a Tela-inicial abre este paciente com todas as validações do formulário.
// Ao salvar lá, o mesmo paciente é atualizado (não cria outro) e a tela volta para cá.
function editarPaciente(id) {
    try {
        localStorage.setItem(CHAVE_EDICAO, id);
    } catch (e) {
        return;
    }
    window.location.href = "Tela-inicial.html";
}

// Excluir: pede confirmação e remove do localStorage
function excluirPaciente(id) {
    if (!confirm("Deseja realmente excluir este paciente?")) return;

    pacientes = pacientes.filter(function (p) { return p.id !== id; });
    abertos.delete(id);
    gravarPacientes();
    mostrarLista();   // atualiza lista, contador e paginação
}


// =========================================================
// 8. SAIR (não apaga nada do localStorage)
// =========================================================
btnSair.addEventListener("click", function () {
    window.location.replace("Login.html");
});


// =========================================================
// 9. AUMENTAR E DIMINUIR LETRAS (não é zoom)
// Muda SOMENTE a variável CSS --fonte-base, que só os textos usam.
// =========================================================
const FONTE_MINIMA = 12;
const FONTE_MAXIMA = 22;
const PASSO = 2;
let tamanhoFonte = 16;

function aplicarFonte() {
    document.documentElement.style.setProperty("--fonte-base", tamanhoFonte + "px");
}

btnDiminuir.addEventListener("click", function () {
    if (tamanhoFonte > FONTE_MINIMA) {
        tamanhoFonte = tamanhoFonte - PASSO;
        aplicarFonte();
    }
});

btnAumentar.addEventListener("click", function () {
    if (tamanhoFonte < FONTE_MAXIMA) {
        tamanhoFonte = tamanhoFonte + PASSO;
        aplicarFonte();
    }
});


// =========================================================
// 10. TEMA CLARO / ESCURO (mesma chave das outras telas)
// =========================================================
function aplicarTema(tema) {
    if (tema === "escuro") {
        document.documentElement.setAttribute("data-tema", "escuro");
        btnTema.setAttribute("aria-label", "Alternar para tema claro");
    } else {
        document.documentElement.removeAttribute("data-tema");
        btnTema.setAttribute("aria-label", "Alternar para tema escuro");
    }
}

btnTema.addEventListener("click", function () {
    const temaAtual = document.documentElement.getAttribute("data-tema");
    const novoTema = temaAtual === "escuro" ? "claro" : "escuro";

    aplicarTema(novoTema);

    try {
        localStorage.setItem("temaProntuario", novoTema);
    } catch (e) {
        // Se o navegador bloquear o localStorage, o tema só não fica salvo
    }
});

try {
    aplicarTema(localStorage.getItem("temaProntuario") || "claro");
} catch (e) {
    aplicarTema("claro");
}


// =========================================================
// 11. AO ABRIR A TELA: mostra a lista
// =========================================================
mostrarLista();