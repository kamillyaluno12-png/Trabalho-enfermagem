// =========================================================
// 1. PEGANDO OS ELEMENTOS DA TELA
// =========================================================
const formulario = document.getElementById("formLogin");

const campoCpf = document.getElementById("cpf");
const campoSenha = document.getElementById("senha");

const erroCpf = document.getElementById("erroCpf");
const erroSenha = document.getElementById("erroSenha");

const btnEntrar = document.getElementById("btnEntrar");
const mensagemSucesso = document.getElementById("mensagemSucesso");

const btnDiminuir = document.getElementById("btnDiminuir");
const btnAumentar = document.getElementById("btnAumentar");
const btnTema = document.getElementById("btnTema");


// =========================================================
// 2. FUNÇÕES PARA MOSTRAR E LIMPAR ERROS
// =========================================================
function mostrarErro(campo, spanErro, mensagem) {
    spanErro.textContent = mensagem;
    campo.closest(".caixa").classList.add("invalido");   // borda vermelha
}

function limparErro(campo, spanErro) {
    spanErro.textContent = "";
    campo.closest(".caixa").classList.remove("invalido");
}


// =========================================================
// 3. CPF — somente números, máximo 11, máscara 000.000.000-00
// =========================================================
campoCpf.addEventListener("input", function () {
    // Tira os pontos e o traço da máscara
    const semMascara = campoCpf.value.replace(/[.\-]/g, "");
    // Deixa só os números
    let numeros = semMascara.replace(/\D/g, "");

    if (numeros !== semMascara) {
        mostrarErro(campoCpf, erroCpf, "Digite apenas números.");
    } else {
        limparErro(campoCpf, erroCpf);
    }

    numeros = numeros.slice(0, 11);           // nunca passa de 11 dígitos
    campoCpf.value = aplicarMascaraCpf(numeros);
});

function aplicarMascaraCpf(n) {
    if (n.length > 9) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);
    if (n.length > 6) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6);
    if (n.length > 3) return n.slice(0, 3) + "." + n.slice(3);
    return n;
}

function validarCpf() {
    // A validação conta apenas os números (ignora a máscara)
    const numeros = campoCpf.value.replace(/\D/g, "");

    if (numeros.length === 0) {
        mostrarErro(campoCpf, erroCpf, "Digite seu CPF.");
        return false;
    }
    if (numeros.length !== 11) {
        mostrarErro(campoCpf, erroCpf, "O CPF deve conter 11 dígitos.");
        return false;
    }
    limparErro(campoCpf, erroCpf);
    return true;
}


// =========================================================
// 4. SENHA — mesmas regras da tela de cadastro
// Retorna a mensagem do primeiro problema encontrado,
// ou "" (texto vazio) se a senha estiver correta.
// =========================================================
function verificarRegrasSenha(senha) {
    if (senha.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número.";
    if (!/[^A-Za-z0-9]/.test(senha)) return "A senha deve conter pelo menos um caractere especial.";
    return "";
}

function validarSenha() {
    const senha = campoSenha.value;

    if (senha === "") {
        mostrarErro(campoSenha, erroSenha, "Digite sua senha.");
        return false;
    }

    const problema = verificarRegrasSenha(senha);
    if (problema !== "") {
        mostrarErro(campoSenha, erroSenha, problema);
        return false;
    }

    limparErro(campoSenha, erroSenha);
    return true;
}

// Se o campo já está mostrando erro, revalida enquanto o usuário corrige
campoSenha.addEventListener("input", function () {
    if (erroSenha.textContent !== "") validarSenha();
});


// =========================================================
// 5. MOSTRAR / OCULTAR SENHA (ícone do olho)
// =========================================================
const botaoOlho = document.querySelector(".btn-olho");

botaoOlho.addEventListener("click", function () {
    if (campoSenha.type === "password") {
        campoSenha.type = "text";                      // mostra
        botaoOlho.classList.add("ativo");
        botaoOlho.setAttribute("aria-label", "Ocultar senha");
    } else {
        campoSenha.type = "password";                  // esconde
        botaoOlho.classList.remove("ativo");
        botaoOlho.setAttribute("aria-label", "Mostrar senha");
    }
});


// =========================================================
// 6. COMPARAR COM OS DADOS DO CADASTRO
// Busca no localStorage o CPF e a senha salvos na tela de Cadastro
// e compara com o que foi digitado. Os DOIS precisam ser iguais.
// =========================================================
function conferirComCadastro() {
    let cpfCadastrado = null;
    let senhaCadastrada = null;

    try {
        cpfCadastrado = localStorage.getItem("cpfCadastrado");
        senhaCadastrada = localStorage.getItem("senhaCadastrada");
    } catch (e) {
        // Sem acesso ao localStorage, não há como conferir
    }

    const cpfDigitado = campoCpf.value.replace(/\D/g, "");   // só os números
    const senhaDigitada = campoSenha.value;

    return cpfDigitado === cpfCadastrado && senhaDigitada === senhaCadastrada;
}


// =========================================================
// 7. BOTÃO ENTRAR
// =========================================================
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();   // impede a página de recarregar

    mensagemSucesso.textContent = "";

    // Primeiro: valida o formato dos dois campos
    const cpfOk = validarCpf();
    const senhaOk = validarSenha();

    if (!cpfOk || !senhaOk) {
        return;   // tem erro de preenchimento: não continua
    }

    // Depois: confere se CPF e senha são os mesmos do cadastro
    if (!conferirComCadastro()) {
        // Não diz qual dos dois está errado, por segurança
        campoCpf.closest(".caixa").classList.add("invalido");
        mostrarErro(campoSenha, erroSenha, "CPF ou senha inválidos.");
        return;
    }

    mensagemSucesso.textContent = "Login realizado com sucesso!";
    btnEntrar.disabled = true;

    // Espera 2 segundos e vai para a tela inicial
    setTimeout(function () {
        window.location.href = "Tela-inicial.html";
    }, 2000);
});

// Obs.: o link "Cadastre-se" vai para Cadastro.html pelo próprio HTML (href).


// =========================================================
// 8. AUMENTAR E DIMINUIR LETRAS
// Muda SOMENTE a variável CSS --fonte-base.
// No CSS, apenas os textos usam essa variável; caixas, ícones,
// botões e espaçamentos têm tamanho fixo em px e não mudam.
// (Não é zoom: nada da página é ampliado, só as letras.)
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
// 9. TEMA CLARO / ESCURO
// O CSS troca as cores quando existe data-tema="escuro" no <html>.
// O localStorage guarda apenas a preferência do tema.
// A chave é a mesma da tela de cadastro, então o tema escolhido
// em uma tela continua na outra.
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

// Ao abrir a página, aplica o tema salvo (se existir)
try {
    aplicarTema(localStorage.getItem("temaProntuario") || "claro");
} catch (e) {
    aplicarTema("claro");
}