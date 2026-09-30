// =========================================================
// 1. PEGANDO OS ELEMENTOS DA TELA
// =========================================================
const formulario = document.getElementById("formProntuario");
const campos = document.getElementById("camposFormulario");   // fieldset com todos os campos
const mensagem = document.getElementById("mensagem");

// Identificação
const nome = document.getElementById("nome");
const sexo = document.getElementById("sexo");
const documento = document.getElementById("documento");
const telefone = document.getElementById("telefone");
const endereco = document.getElementById("endereco");
const numeroProntuario = document.getElementById("numeroProntuario");
const dataNascimento = document.getElementById("dataNascimento");
const idPaciente = document.getElementById("idPaciente");

// Anamnese
const queixaPrincipal = document.getElementById("queixaPrincipal");
const historiaDoenca = document.getElementById("historiaDoenca");
const especificacaoAlergia = document.getElementById("especificacaoAlergia");
const medicamentos = document.getElementById("medicamentos");

// Exame clínico
const estadoGeral = document.getElementById("estadoGeral");
const peleMucosa = document.getElementById("peleMucosa");
const sistemaRespiratorio = document.getElementById("sistemaRespiratorio");
const nivelConsciencia = document.getElementById("nivelConsciencia");
const orientacao = document.getElementById("orientacao");
const cabecaPescoco = document.getElementById("cabecaPescoco");
const sistemaCardiovascular = document.getElementById("sistemaCardiovascular");
const abdomen = document.getElementById("abdomen");

// Sinais vitais
const dataAfericao = document.getElementById("dataAfericao");
const horario = document.getElementById("horario");
const frequenciaRespiratoria = document.getElementById("frequenciaRespiratoria");
const pressaoArterial = document.getElementById("pressaoArterial");
const temperatura = document.getElementById("temperatura");
const saturacaoO2 = document.getElementById("saturacaoO2");
const frequenciaCardiaca = document.getElementById("frequenciaCardiaca");

// Botões
const btnSalvar = document.getElementById("btnSalvar");
const btnEditar = document.getElementById("btnEditar");
const btnCancelar = document.getElementById("btnCancelar");
const btnSair = document.getElementById("btnSair");
const btnDiminuir = document.getElementById("btnDiminuir");
const btnAumentar = document.getElementById("btnAumentar");
const btnTema = document.getElementById("btnTema");

// Chaves do localStorage (as mesmas usadas na Tela-prontuario)
const CHAVE_PACIENTES = "pacientes";            // lista com todos os pacientes
const CHAVE_ANTIGA = "prontuarioPaciente";      // versão antiga (um paciente só)
const CHAVE_EDICAO = "pacienteEmEdicao";        // paciente escolhido para editar na Tela-prontuario

// Qual paciente está aberto no formulário (null = paciente novo)
let idAtual = null;
// true quando a edição veio da Tela-prontuario (depois volta para lá)
let voltarParaProntuarios = false;

// Modelos de máscara: cada "0" é trocado por um número
const MASCARA_CPF = "000.000.000-00";
const MASCARA_CNPJ = "00.000.000/0000-00";
const MASCARA_TELEFONE = "(00) 00000-0000";


// =========================================================
// 2. FUNÇÕES DE APOIO
// =========================================================

// Mostra a mensagem de erro embaixo do campo e deixa a borda vermelha
function mostrarErro(elemento, texto) {
    const campo = elemento.closest(".campo");
    campo.querySelector(".erro").textContent = texto;
    campo.classList.add("invalido");
}

function limparErro(elemento) {
    const campo = elemento.closest(".campo");
    if (!campo) return;
    campo.querySelector(".erro").textContent = "";
    campo.classList.remove("invalido");
}

function limparTodosErros() {
    document.querySelectorAll(".campo.invalido").forEach(function (campo) {
        campo.classList.remove("invalido");
        campo.querySelector(".erro").textContent = "";
    });
}

// Mensagem geral acima dos botões (tipo: "sucesso", "erro" ou "info")
function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
}

// Retorna só os números de um texto
function somenteDigitos(texto) {
    return texto.replace(/\D/g, "");
}

// Coloca os números dentro do modelo. Ex.: "12345678901" + "000.000.000-00"
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

// Valor marcado em um grupo de radio (ou "" se nada marcado)
function valorRadio(nomeGrupo) {
    const marcado = document.querySelector('input[name="' + nomeGrupo + '"]:checked');
    return marcado ? marcado.value : "";
}

function marcarRadio(nomeGrupo, valor) {
    document.querySelectorAll('input[name="' + nomeGrupo + '"]').forEach(function (radio) {
        radio.checked = radio.value === valor;
    });
}

// Data de hoje no formato do campo de data: "AAAA-MM-DD"
function hojeISO() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return hoje.getFullYear() + "-" + mes + "-" + dia;
}


// =========================================================
// 3. CONTROLE DO QUE PODE SER DIGITADO EM CADA CAMPO
// =========================================================

// Nome: somente letras (com acento) e espaços
nome.addEventListener("input", function () {
    const limpo = nome.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, "");
    if (limpo !== nome.value) {
        nome.value = limpo;
        mostrarErro(nome, "Digite apenas letras.");
    } else {
        limparErro(nome);
    }
});

// CPF ou CNPJ: só números. Até 11 = máscara de CPF; 12 a 14 = máscara de CNPJ
documento.addEventListener("input", function () {
    const semMascara = documento.value.replace(/[.\-\/]/g, "");
    let numeros = somenteDigitos(semMascara);

    if (numeros !== semMascara) {
        mostrarErro(documento, "Digite apenas números.");
    } else {
        limparErro(documento);
    }

    numeros = numeros.slice(0, 14);
    documento.value = aplicarMascara(numeros, numeros.length > 11 ? MASCARA_CNPJ : MASCARA_CPF);
});

// Telefone: só números, 11 dígitos (DDD + número)
telefone.addEventListener("input", function () {
    const semMascara = telefone.value.replace(/[()\s\-]/g, "");
    let numeros = somenteDigitos(semMascara);

    if (numeros !== semMascara) {
        mostrarErro(telefone, "Digite apenas números.");
    } else {
        limparErro(telefone);
    }

    numeros = numeros.slice(0, 11);
    telefone.value = aplicarMascara(numeros, MASCARA_TELEFONE);
});

// Endereço: letras, números, espaço e pontuação comum de endereço.
// Bloqueia emojis, < > (código HTML) e símbolos sem sentido.
endereco.addEventListener("input", function () {
    const limpo = endereco.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,\-\/ºª°#()]/g, "");
    if (limpo !== endereco.value) {
        endereco.value = limpo;
        mostrarErro(endereco, "Use apenas letras, números e . , - / º ( )");
    } else {
        limparErro(endereco);
    }
});

// Campos que aceitam só números, com limite de dígitos
function filtrarDigitos(campo, limite) {
    const numeros = somenteDigitos(campo.value);
    if (numeros !== campo.value) {
        mostrarErro(campo, "Digite apenas números.");
    } else {
        limparErro(campo);
    }
    campo.value = numeros.slice(0, limite);
}

numeroProntuario.addEventListener("input", function () { filtrarDigitos(numeroProntuario, 10); });
idPaciente.addEventListener("input", function () { filtrarDigitos(idPaciente, 10); });
frequenciaRespiratoria.addEventListener("input", function () { filtrarDigitos(frequenciaRespiratoria, 3); });
frequenciaCardiaca.addEventListener("input", function () { filtrarDigitos(frequenciaCardiaca, 3); });
saturacaoO2.addEventListener("input", function () { filtrarDigitos(saturacaoO2, 3); });

// Temperatura: números com uma casa decimal. Ex.: 36,5
temperatura.addEventListener("input", function () {
    const limpo = temperatura.value.replace(/[^0-9.,]/g, "");
    if (limpo !== temperatura.value) {
        mostrarErro(temperatura, "Digite apenas números. Ex.: 36,5");
    } else {
        limparErro(temperatura);
    }

    const partes = limpo.split(/[.,]/);          // separa antes e depois da vírgula
    let resultado = partes[0].slice(0, 2);
    if (partes.length > 1) {
        resultado += "," + partes.slice(1).join("").slice(0, 1);
    }
    temperatura.value = resultado;
});

// Pressão arterial: números e uma barra. Ex.: 120/80
pressaoArterial.addEventListener("input", function () {
    const limpo = pressaoArterial.value.replace(/[^0-9\/]/g, "");
    if (limpo !== pressaoArterial.value) {
        mostrarErro(pressaoArterial, "Digite apenas números e a barra. Ex.: 120/80");
    } else {
        limparErro(pressaoArterial);
    }

    const partes = limpo.split("/");
    let resultado = partes[0].slice(0, 3);
    if (partes.length > 1) {
        resultado += "/" + partes.slice(1).join("").slice(0, 3);
    }
    pressaoArterial.value = resultado;
});

// Nos demais campos (textos longos, sexo, datas, horário, Sim/Não, dor),
// o erro some assim que o usuário começa a corrigir.
// Os campos da lista abaixo já cuidam do próprio erro nas funções acima.
const camposComFiltro = [nome, documento, telefone, endereco, numeroProntuario, idPaciente,
    frequenciaRespiratoria, frequenciaCardiaca, saturacaoO2, temperatura, pressaoArterial];

formulario.addEventListener("input", function (evento) {
    if (!camposComFiltro.includes(evento.target)) {
        limparErro(evento.target);
    }
});


// =========================================================
// 4. CAMPOS LIGADOS ÀS OPÇÕES SIM / NÃO
// "Especificação da alergia" e "Quais medicamentos" só ficam
// liberados quando a resposta for "Sim".
// =========================================================
function ligarCampo(ativo, campo) {
    campo.disabled = !ativo;
    campo.closest(".campo").classList.toggle("desativado", !ativo);
    if (!ativo) limparErro(campo);
}

function atualizarRelacoes() {
    ligarCampo(valorRadio("alergias") === "Sim", especificacaoAlergia);
    ligarCampo(valorRadio("usoMedicamentos") === "Sim", medicamentos);
}

document.querySelectorAll('input[name="alergias"], input[name="usoMedicamentos"]').forEach(function (radio) {
    radio.addEventListener("change", atualizarRelacoes);
});


// =========================================================
// 5. VALIDAÇÃO AO CLICAR EM SALVAR
// =========================================================

// Campo obrigatório: não pode ficar vazio
function exigir(campo, texto) {
    if (campo.value.trim() === "") {
        mostrarErro(campo, texto);
        return false;
    }
    return true;
}

// Datas: precisa ser real e (se pedido) não pode ser futura.
// O campo de data do navegador já não aceita datas impossíveis (ex.: 31/02);
// quando isso acontece, validity.badInput fica verdadeiro.
function validarData(campo, textoVazio, naoPodeSerFutura) {
    if (campo.validity.badInput) {
        mostrarErro(campo, "Digite uma data válida.");
        return false;
    }
    if (campo.value === "") {
        mostrarErro(campo, textoVazio);
        return false;
    }
    if (campo.value < "1900-01-01") {
        mostrarErro(campo, "Digite uma data válida.");
        return false;
    }
    if (naoPodeSerFutura && campo.value > hojeISO()) {
        mostrarErro(campo, "A data de nascimento não pode ser uma data futura.");
        return false;
    }
    return true;
}

function validarFormulario() {
    limparTodosErros();
    let tudoCerto = true;

    // ----- Identificação -----
    if (!exigir(nome, "Digite o nome completo.")) tudoCerto = false;
    if (!exigir(sexo, "Selecione o sexo.")) tudoCerto = false;

    const numerosDocumento = somenteDigitos(documento.value);
    if (numerosDocumento.length === 0) {
        mostrarErro(documento, "Digite o CPF ou CNPJ.");
        tudoCerto = false;
    } else if (numerosDocumento.length !== 11 && numerosDocumento.length !== 14) {
        mostrarErro(documento, "O CPF deve ter 11 dígitos e o CNPJ, 14 dígitos.");
        tudoCerto = false;
    }

    const numerosTelefone = somenteDigitos(telefone.value);
    if (numerosTelefone.length === 0) {
        mostrarErro(telefone, "Digite o telefone.");
        tudoCerto = false;
    } else if (numerosTelefone.length !== 11) {
        mostrarErro(telefone, "O telefone deve ter 11 dígitos (DDD + número).");
        tudoCerto = false;
    }

    if (!exigir(endereco, "Digite o endereço.")) tudoCerto = false;
    if (!exigir(numeroProntuario, "Digite o número do prontuário.")) tudoCerto = false;
    if (!validarData(dataNascimento, "Informe a data de nascimento.", true)) tudoCerto = false;

    if (!exigir(idPaciente, "Digite o ID do paciente.")) {
        tudoCerto = false;
    } else if (/^0+$/.test(idPaciente.value)) {
        mostrarErro(idPaciente, "Digite um ID válido.");
        tudoCerto = false;
    }

    // ----- Anamnese -----
    if (!exigir(queixaPrincipal, "Digite a queixa principal.")) tudoCerto = false;
    if (!exigir(historiaDoenca, "Descreva a história da doença ou condição atual.")) tudoCerto = false;

    const alergias = valorRadio("alergias");
    if (alergias === "") {
        mostrarErro(document.querySelector('input[name="alergias"]'), "Selecione Sim ou Não.");
        tudoCerto = false;
    } else if (alergias === "Sim" && !exigir(especificacaoAlergia, "Informe qual é a alergia.")) {
        tudoCerto = false;
    }

    const usoMedicamentos = valorRadio("usoMedicamentos");
    if (usoMedicamentos === "") {
        mostrarErro(document.querySelector('input[name="usoMedicamentos"]'), "Selecione Sim ou Não.");
        tudoCerto = false;
    } else if (usoMedicamentos === "Sim" && !exigir(medicamentos, "Informe quais medicamentos.")) {
        tudoCerto = false;
    }

    // ----- Exame clínico -----
    if (!exigir(estadoGeral, "Descreva o estado geral.")) tudoCerto = false;
    if (!exigir(nivelConsciencia, "Descreva o nível de consciência.")) tudoCerto = false;
    if (!exigir(orientacao, "Descreva a orientação.")) tudoCerto = false;

    // ----- Sinais vitais -----
    if (!validarData(dataAfericao, "Informe a data da aferição.", false)) tudoCerto = false;

    if (horario.validity.badInput) {
        mostrarErro(horario, "Digite um horário válido.");
        tudoCerto = false;
    } else if (horario.value === "") {
        mostrarErro(horario, "Informe o horário da aferição.");
        tudoCerto = false;
    }

    // Os campos abaixo não são obrigatórios, mas se preenchidos precisam estar no formato certo
    if (pressaoArterial.value !== "" && !/^\d{2,3}\/\d{2,3}$/.test(pressaoArterial.value)) {
        mostrarErro(pressaoArterial, "Use o formato 120/80.");
        tudoCerto = false;
    }

    if (temperatura.value !== "" && !/^\d{2}(,\d)?$/.test(temperatura.value)) {
        mostrarErro(temperatura, "Use o formato 36,5.");
        tudoCerto = false;
    }

    if (saturacaoO2.value !== "" && Number(saturacaoO2.value) > 100) {
        mostrarErro(saturacaoO2, "A saturação vai de 0 a 100%.");
        tudoCerto = false;
    }

    return tudoCerto;
}


// =========================================================
// 6. JUNTAR OS DADOS / PREENCHER A TELA
// =========================================================

// Monta um objeto organizado com tudo o que foi preenchido
function coletarDados() {
    const numerosDocumento = somenteDigitos(documento.value);
    const alergias = valorRadio("alergias");
    const usoMedicamentos = valorRadio("usoMedicamentos");

    return {
        identificacao: {
            nome: nome.value.trim(),
            sexo: sexo.value,
            tipoDocumento: numerosDocumento.length === 14 ? "CNPJ" : "CPF",
            documento: numerosDocumento,
            telefone: somenteDigitos(telefone.value),
            endereco: endereco.value.trim(),
            numeroProntuario: numeroProntuario.value,
            dataNascimento: dataNascimento.value,
            idPaciente: idPaciente.value
        },
        anamnese: {
            queixaPrincipal: queixaPrincipal.value.trim(),
            historiaDoenca: historiaDoenca.value.trim(),
            alergias: alergias,
            especificacaoAlergia: alergias === "Sim" ? especificacaoAlergia.value.trim() : "",
            usoMedicamentos: usoMedicamentos,
            medicamentos: usoMedicamentos === "Sim" ? medicamentos.value.trim() : ""
        },
        exameClinico: {
            estadoGeral: estadoGeral.value.trim(),
            peleMucosa: peleMucosa.value.trim(),
            sistemaRespiratorio: sistemaRespiratorio.value.trim(),
            nivelConsciencia: nivelConsciencia.value.trim(),
            orientacao: orientacao.value.trim(),
            cabecaPescoco: cabecaPescoco.value.trim(),
            sistemaCardiovascular: sistemaCardiovascular.value.trim(),
            abdomen: abdomen.value.trim()
        },
        sinaisVitais: {
            dataAfericao: dataAfericao.value,
            horario: horario.value,
            frequenciaRespiratoria: frequenciaRespiratoria.value,
            pressaoArterial: pressaoArterial.value,
            temperatura: temperatura.value,
            saturacaoO2: saturacaoO2.value,
            frequenciaCardiaca: frequenciaCardiaca.value,
            dor: valorRadio("dor")
        }
    };
}

// Coloca os dados salvos de volta nos campos
function preencherFormulario(dados) {
    const i = dados.identificacao;
    const a = dados.anamnese;
    const e = dados.exameClinico;
    const s = dados.sinaisVitais;

    nome.value = i.nome;
    sexo.value = i.sexo;
    documento.value = aplicarMascara(i.documento, i.documento.length === 14 ? MASCARA_CNPJ : MASCARA_CPF);
    telefone.value = aplicarMascara(i.telefone, MASCARA_TELEFONE);
    endereco.value = i.endereco;
    numeroProntuario.value = i.numeroProntuario;
    dataNascimento.value = i.dataNascimento;
    idPaciente.value = i.idPaciente;

    queixaPrincipal.value = a.queixaPrincipal;
    historiaDoenca.value = a.historiaDoenca;
    marcarRadio("alergias", a.alergias);
    especificacaoAlergia.value = a.especificacaoAlergia;
    marcarRadio("usoMedicamentos", a.usoMedicamentos);
    medicamentos.value = a.medicamentos;

    estadoGeral.value = e.estadoGeral;
    peleMucosa.value = e.peleMucosa;
    sistemaRespiratorio.value = e.sistemaRespiratorio;
    nivelConsciencia.value = e.nivelConsciencia;
    orientacao.value = e.orientacao;
    cabecaPescoco.value = e.cabecaPescoco;
    sistemaCardiovascular.value = e.sistemaCardiovascular;
    abdomen.value = e.abdomen;

    dataAfericao.value = s.dataAfericao;
    horario.value = s.horario;
    frequenciaRespiratoria.value = s.frequenciaRespiratoria;
    pressaoArterial.value = s.pressaoArterial;
    temperatura.value = s.temperatura;
    saturacaoO2.value = s.saturacaoO2;
    frequenciaCardiaca.value = s.frequenciaCardiaca;
    marcarRadio("dor", s.dor);

    atualizarRelacoes();
}

// Lê a lista de pacientes salva (ou lista vazia)
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
        // Dados ilegíveis ou localStorage bloqueado
    }
    return [];
}

// Procura um paciente pelo id interno
function buscarPaciente(id) {
    return lerPacientes().find(function (p) { return p.id === id; }) || null;
}

// Atualiza o quadro "Prontuário / ID do paciente" no topo da página
function atualizarResumo(dados) {
    document.getElementById("resumoProntuario").textContent = dados ? dados.identificacao.numeroProntuario : "—";
    document.getElementById("resumoId").textContent = dados ? dados.identificacao.idPaciente : "—";
}


// =========================================================
// 7. MODOS DA TELA: VISUALIZAÇÃO x EDIÇÃO
// Visualização: dados salvos aparecem bloqueados; só "Editar" funciona.
// Edição: campos liberados; "Salvar" e "Cancelar" funcionam.
// =========================================================
function modoVisualizacao() {
    campos.disabled = true;          // bloqueia todos os campos de uma vez
    btnSalvar.disabled = true;
    btnCancelar.disabled = true;
    btnEditar.disabled = false;
}

function modoEdicao() {
    campos.disabled = false;
    btnSalvar.disabled = false;
    btnCancelar.disabled = false;
    btnEditar.disabled = true;
    atualizarRelacoes();
}

// ----- SALVAR -----
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();         // impede a página de recarregar

    if (!validarFormulario()) {
        mostrarMensagem("Corrija os campos destacados em vermelho.", "erro");
        const primeiroErro = document.querySelector(".campo.invalido");
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const dados = coletarDados();
    const lista = lerPacientes();
    const posicao = lista.findIndex(function (p) { return p.id === idAtual; });

    if (posicao === -1) {
        // Paciente novo: ganha um id interno e começa com status "Ativo"
        dados.id = String(Date.now());
        dados.status = "Ativo";
        lista.push(dados);
    } else {
        // Paciente já existente: substitui os dados, mantendo id e status
        dados.id = idAtual;
        dados.status = lista[posicao].status;
        lista[posicao] = dados;
    }

    try {
        localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(lista));
    } catch (e) {
        mostrarMensagem("Não foi possível salvar neste navegador.", "erro");
        return;
    }

    idAtual = dados.id;          // se clicar em Editar, altera este mesmo paciente
    atualizarResumo(dados);
    modoVisualizacao();
    mostrarMensagem("Prontuário salvo com sucesso!", "sucesso");

    // Se a edição veio da tela de Prontuários, volta para a lista atualizada
    if (voltarParaProntuarios) {
        setTimeout(function () {
            window.location.href = "Tela-prontuario.html";
        }, 1500);
    }
});

// ----- EDITAR -----
btnEditar.addEventListener("click", function () {
    modoEdicao();
    mostrarMensagem("Modo de edição: altere os dados e clique em Salvar.", "info");
    nome.focus();
});

// ----- CANCELAR -----
// Descarta o que foi digitado agora. Os dados já salvos NÃO são apagados.
btnCancelar.addEventListener("click", function () {
    if (!confirm("Descartar as alterações que ainda não foram salvas?")) return;

    // Se a edição veio da tela de Prontuários, volta para lá sem mudar nada
    if (voltarParaProntuarios) {
        window.location.href = "Tela-prontuario.html";
        return;
    }

    limparTodosErros();
    const salvo = idAtual ? buscarPaciente(idAtual) : null;

    if (salvo) {
        preencherFormulario(salvo);        // volta para a última versão salva
        modoVisualizacao();
    } else {
        formulario.reset();                // paciente novo: limpa o formulário
        atualizarRelacoes();
    }
    mostrarMensagem("Alterações canceladas.", "info");
});


// =========================================================
// 8. SAIR
// replace() troca a página atual pelo Login, então o botão
// "voltar" do navegador não retorna para esta tela.
// Os dados do paciente continuam salvos no localStorage.
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
// 10. TEMA CLARO / ESCURO
// Mesma chave do Cadastro e do Login: o tema continua entre as telas.
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
// 11. AO ABRIR A TELA
// Se veio do botão Editar da Tela-prontuario, abre aquele paciente.
// Se não, abre o formulário vazio para cadastrar um paciente novo.
// =========================================================
dataNascimento.max = hojeISO();        // o calendário não deixa escolher datas futuras

let idParaEditar = null;
try {
    idParaEditar = localStorage.getItem(CHAVE_EDICAO);
    localStorage.removeItem(CHAVE_EDICAO);   // usa o pedido de edição só uma vez
} catch (e) {
    // localStorage bloqueado
}

const pacienteParaEditar = idParaEditar ? buscarPaciente(idParaEditar) : null;

if (pacienteParaEditar) {
    idAtual = pacienteParaEditar.id;
    voltarParaProntuarios = true;
    preencherFormulario(pacienteParaEditar);
    atualizarResumo(pacienteParaEditar);
    modoEdicao();
    mostrarMensagem("Editando " + pacienteParaEditar.identificacao.nome + ". Altere os dados e clique em Salvar.", "info");
} else {
    modoEdicao();
}