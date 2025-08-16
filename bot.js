// ===== CONFIGURAÇÕES DO BOT =====
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Coloque seu token do bot aqui
const TOKEN = 'MTQwNjMxMDEzNTc1MTc3NDIwOA.GE-Mo-.uD7dJYmrZBpvyzoddedAI00aBjuBQHkHx3cdf0';

// ID do canal onde o bot vai enviar as mensagens
const CANAL_ID = '1406311956499005690';

// URL da API da rádio
const API_URL = 'https://radiohabb.live/api/status';

// Tempo entre verificações (em milissegundos) - 30 segundos
const INTERVALO_VERIFICACAO = 30000;

// ===== CRIAÇÃO DO BOT =====
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Variável para guardar o último locutor
let ultimoLocutor = null;

// ===== FUNÇÃO PARA VERIFICAR A API =====
async function verificarRadio() {
    try {
        // Busca os dados da API
        const response = await axios.get(API_URL);
        const dados = response.data;
        
        // Pega os dados da API
        const locutorAtual = dados.locutor;
        const programacao = dados.programa;
        const ouvintes = dados.unicos;
        
        // Verifica se é um locutor real (não é AutoDJ)
        const ehLocutorReal = locutorAtual && 
                             locutorAtual.toLowerCase() !== 'radio habblive' &&
                             locutorAtual.toLowerCase() !== 'autodj' &&
                             locutorAtual.toLowerCase() !== 'auto dj';
        
        // Se mudou de locutor e é um locutor real
        if (ehLocutorReal && locutorAtual !== ultimoLocutor) {
            
            // Atualiza o último locutor
            ultimoLocutor = locutorAtual;
            
            // Monta a mensagem
            const mensagem = `**- Locutor ${locutorAtual} está AO VIVO pela Rádio Habblive com a programação ${programacao}! 😍🎶**\n\n:follow ${locutorAtual}`;
            
            // Envia a mensagem no canal
            const canal = client.channels.cache.get(CANAL_ID);
            if (canal) {
                await canal.send(mensagem);
                console.log(`✅ Mensagem enviada: Locutor ${locutorAtual} entrou ao vivo!`);
            } else {
                console.log('❌ Canal não encontrado! Verifique o ID do canal.');
            }
        }
        
        // Se voltou para o AutoDJ, reseta o último locutor
        if (!ehLocutorReal && ultimoLocutor !== null) {
            ultimoLocutor = null;
            console.log('🎵 Voltou para o AutoDJ');
        }
        
        // Log para debug (pode remover depois)
        console.log(`📊 Status: Locutor: ${locutorAtual} | Programa: ${programacao} | Ouvintes: ${ouvintes}`);
        
    } catch (erro) {
        console.error('❌ Erro ao verificar a API:', erro.message);
    }
}

// ===== QUANDO O BOT FICAR ONLINE =====
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} está online!`);
    
    // Faz a primeira verificação imediatamente
    verificarRadio();
    
    // Configura para verificar a cada X segundos
    setInterval(verificarRadio, INTERVALO_VERIFICACAO);
});

// ===== COMANDOS DO BOT (OPCIONAL) =====
client.on('messageCreate', async (message) => {
    // Ignora mensagens do próprio bot
    if (message.author.bot) return;
    
    // Comando !status - mostra o status atual da rádio
    if (message.content === '!status') {
        try {
            const response = await axios.get(API_URL);
            const dados = response.data;
            
            const statusMsg = `📻 **Status da Rádio Habblive**\n` +
                            `👤 Locutor: ${dados.locutor}\n` +
                            `📺 Programa: ${dados.programa}\n` +
                            `👥 Ouvintes: ${dados.unicos}`;
            
            message.reply(statusMsg);
        } catch (erro) {
            message.reply('❌ Erro ao buscar status da rádio!');
        }
    }
    
    // Comando !help - mostra os comandos disponíveis
    if (message.content === '!help') {
        const helpMsg = `📌 **Comandos do Bot Rádio Habblive**\n` +
                       `\`!status\` - Mostra o status atual da rádio\n` +
                       `\`!help\` - Mostra esta mensagem de ajuda`;
        
        message.reply(helpMsg);
    }
});

// ===== INICIA O BOT =====
client.login(TOKEN);