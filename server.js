const http = require("http");
const fs = require("fs");

const PORTA = 3000;
const ARQUIVO_JOGADORES = "./jogadores.json";

fs.writeFileSync(ARQUIVO_JOGADORES, JSON.stringify({}), "utf8");

const lerArquivo = (caminho, resposta, contentType) => {
    fs.readFile(caminho, (erro, dados) => {
        if (erro) {
            resposta.writeHead(404);
            return resposta.end("Arquivo não encontrado.");
        }
        resposta.writeHead(200, { "Content-Type": contentType });
        resposta.end(dados);
    });
};

const atualizarMovimento = (pedido, resposta, eixo, valor) => {
    let body = "";
    pedido.on("data", chunk => (body += chunk));

    pedido.on("end", () => {
        const nome = JSON.parse(body).nome;
        const lista = JSON.parse(fs.readFileSync(ARQUIVO_JOGADORES));

        console.log(`Movimento de ${nome} para o eixo ${eixo} com valor ${valor}`); // Depuração

        if (lista[nome]) {
            lista[nome][0][eixo] += valor;
            fs.writeFileSync(ARQUIVO_JOGADORES, JSON.stringify(lista));
            resposta.end(JSON.stringify(lista[nome][0][eixo]));
        } else {
            resposta.writeHead(404).end("Player não encontrado.");
        }
    });
};

const servidor = http.createServer((pedido, resposta) => {
    const url = pedido.url;
    console.log(`Requisição recebida: ${url}`); // Depuração

    if (url === "/") return lerArquivo("index.html", resposta, "text/html");
    if (url === "/style.css") return lerArquivo("style.css", resposta, "text/css");
    if (url === "/lista") return lerArquivo(ARQUIVO_JOGADORES, resposta, "application/json");

    if (url === "/adicionarPlayer") {
        let body = "";
        pedido.on("data", chunk => (body += chunk));

        pedido.on("end", () => {
            const { nomeNoInput: nome, corNoInput: cor } = JSON.parse(body);
            const novoPlayer = { nomeDoPlayer: nome, cor, left: 0, bottom: 0, largura: 100, altura: 100 };

            const lista = JSON.parse(fs.readFileSync(ARQUIVO_JOGADORES));
            lista[nome] = [novoPlayer];
            fs.writeFileSync(ARQUIVO_JOGADORES, JSON.stringify(lista));

            resposta.end(JSON.stringify(novoPlayer));
        });
    }

    if (url === "/playerAndaDireita") return atualizarMovimento(pedido, resposta, "left", 20);
    if (url === "/playerAndaEsquerda") return atualizarMovimento(pedido, resposta, "left", -20);
    if (url === "/playerAndaCima") return atualizarMovimento(pedido, resposta, "bottom", 20);
    if (url === "/playerAndaBaixo") return atualizarMovimento(pedido, resposta, "bottom", -20);
});

servidor.listen(PORTA, () => console.log(`Servidor rodando em http://localhost:${PORTA}`));
