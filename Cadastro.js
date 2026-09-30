// =========================================================
// 1. PEGANDO OS ELEMENTOS DA TELA
// =========================================================
const formulario = document.getElementById("formCadastro");

const campoNome = document.getElementById("nome");
const campoCpf = document.getElementById("cpf");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmarSenha");

const erroNome = document.getElementById("erroNome");
const erroCpf = document.getElementById("erroCpf");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmar = document.getElementById("erroConfirmar");

const btnCadastrar = document.getElementById("btnCadastrar");
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
// 3. NOME COMPLETO — somente letras (com acento) e espaços
// =========================================================
campoNome.addEventListener("input", function () {
    // Remove tudo que NÃO for letra ou espaço
    const valorLimpo = campoNome.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, "");

    if (valorLimpo !== campoNome.value) {
        // Se algo foi removido, o usuário digitou um caractere inválido
        campoNome.value = valorLimpo;
        mostrarErro(campoNome, erroNome, "Digite apenas letras.");
    } else {
        limparErro(campoNome, erroNome);
    }
});

function validarNome() {
    if (campoNome.value.trim() === "") {
        mostrarErro(campoNome, erroNome, "Digite seu nome completo.");
        return false;
    }
    limparErro(campoNome, erroNome);
    return true;
}


// =========================================================
// 4. CPF — somente números, máximo 11, máscara 000.000.000-00
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
// 5. SENHA — regras
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


// =========================================================
// 6. CONFIRMAR SENHA — mesmas regras + igual à senha
// =========================================================
function validarConfirmacao() {
    const confirmacao = campoConfirmar.value;

    if (confirmacao === "") {
        mostrarErro(campoConfirmar, erroConfirmar, "Confirme sua senha.");
        return false;
    }

    const problema = verificarRegrasSenha(confirmacao);
    if (problema !== "") {
        mostrarErro(campoConfirmar, erroConfirmar, problema);
        return false;
    }

    if (confirmacao !== campoSenha.value) {
        mostrarErro(campoConfirmar, erroConfirmar, "As senhas não coincidem.");
        return false;
    }

    limparErro(campoConfirmar, erroConfirmar);
    return true;
}

// Se o campo já está mostrando erro, revalida enquanto o usuário corrige
campoSenha.addEventListener("input", function () {
    if (erroSenha.textContent !== "") validarSenha();
    if (erroConfirmar.textContent !== "") validarConfirmacao();
});

campoConfirmar.addEventListener("input", function () {
    if (erroConfirmar.textContent !== "") validarConfirmacao();
});


// =========================================================
// 7. MOSTRAR / OCULTAR SENHA (ícone do olho)
// =========================================================
const botoesOlho = document.querySelectorAll(".btn-olho");

botoesOlho.forEach(function (botao) {
    botao.addEventListener("click", function () {
        // data-alvo diz qual campo esse olho controla
        const campo = document.getElementById(botao.dataset.alvo);

        if (campo.type === "password") {
            campo.type = "text";                       // mostra
            botao.classList.add("ativo");
            botao.setAttribute("aria-label", "Ocultar senha");
        } else {
            campo.type = "password";                   // esconde
            botao.classList.remove("ativo");
            botao.setAttribute("aria-label", "Mostrar senha");
        }
    });
});


// =========================================================
// 8. BOTÃO CADASTRAR
// =========================================================
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();   // impede a página de recarregar

    // Valida todos os campos (todos rodam, para mostrar todos os erros)
    const nomeOk = validarNome();
    const cpfOk = validarCpf();
    const senhaOk = validarSenha();
    const confirmacaoOk = validarConfirmacao();

    if (nomeOk && cpfOk && senhaOk && confirmacaoOk) {
        // Salva no localStorage o CPF (só os 11 números) e a senha,
        // para a tela de Login poder comparar depois
        try {
            localStorage.setItem("cpfCadastrado", campoCpf.value.replace(/\D/g, ""));
            localStorage.setItem("senhaCadastrada", campoSenha.value);
        } catch (e) {
            // Se o navegador bloquear o localStorage, os dados não ficam salvos
        }

        mensagemSucesso.textContent = "Cadastro realizado com sucesso!";
        btnCadastrar.disabled = true;

        // Espera 2 segundos e vai para a tela de login
        setTimeout(function () {
            window.location.href = "Login.html";
        }, 2000);
    } else {
        mensagemSucesso.textContent = "";
    }
});

// Obs.: o link "Entrar" vai para Login.html pelo próprio HTML (href).


// =========================================================
// 9. AUMENTAR E DIMINUIR FONTE
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
// 10. TEMA CLARO / ESCURO
// O CSS troca as cores quando existe data-tema="escuro" no <html>.
// O localStorage guarda apenas a preferência do tema.
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