// =========================================================
// 1. ELEMENTOS DA TELA
// =========================================================
const btnSair = document.getElementById("btnSair");
const btnDiminuir = document.getElementById("btnDiminuir");
const btnAumentar = document.getElementById("btnAumentar");
const btnTema = document.getElementById("btnTema");


// =========================================================
// 2. SAIR
// replace() troca esta página pelo Login, então o botão "voltar"
// do navegador não retorna para cá. Nada do localStorage é apagado.
// =========================================================
btnSair.addEventListener("click", function () {
    window.location.replace("Login.html");
});


// =========================================================
// 3. AUMENTAR E DIMINUIR LETRAS (não é zoom)
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
// 4. TEMA CLARO / ESCURO
// Usa a mesma chave das outras telas, então o tema escolhido
// continua igual ao navegar pelo sistema.
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