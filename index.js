
const CriarPlayer = document.querySelector("#CriarPlayer");
const Tela = document.querySelector("#Tela");
const inputNome = document.querySelector("#nome");
const inputCor = document.querySelector("#cor");

const atualizarTela = async () => {
    const resposta = await fetch("/lista");
    const dados = await resposta.json();
    Tela.innerHTML = "";

    Object.values(dados).forEach(([player]) => {
        const div = document.createElement("div");
        div.className = `player ${player.nomeDoPlayer}`;
        div.style.cssText = `
               position: absolute;
               left: ${player.left}px;
               bottom: ${player.bottom}px;
               height: ${player.altura}px;
               width: ${player.largura}px;
               background-color: ${player.cor};
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
           `;
        div.textContent = player.nomeDoPlayer;
        Tela.appendChild(div);
    });
};

const adicionarPlayer = async () => {
    const nome = inputNome.value.trim();
    const cor = inputCor.value.trim();
    if (!nome || !cor) return alert("Preencha os campos!");

    const resposta = await fetch("/adicionarPlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeNoInput: nome, corNoInput: cor })
    });

    if (resposta.ok) {
        CriarPlayer.style.display = "none";
        Tela.style.display = "flex";
        document.removeEventListener("keydown", movimentarPlayer);
        document.addEventListener("keydown", movimentarPlayer);
        atualizarTela();
    }
};

const movimentarPlayer = async (evento) => {
    const teclas = {
        "d": "/playerAndaDireita",
        "a": "/playerAndaEsquerda",
        "w": "/playerAndaCima",
        "s": "/playerAndaBaixo"
    };

    const nome = inputNome.value.trim();
    if (teclas[evento.key] && nome) {
        console.log(`Movendo o player ${nome} para a tecla ${evento.key}`); // Depuração

        const resposta = await fetch(teclas[evento.key], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome })
        });

        if (resposta.ok) {
            console.log("Movimento registrado com sucesso");
            atualizarTela();
        } else {
            console.log("Erro ao mover o player");
        }
    }
};

window.addEventListener("keyup", (e) => {
    if (e.key === "Enter") adicionarPlayer();
});

setInterval(atualizarTela, 100);