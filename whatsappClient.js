const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { saveMessage, saveMessageHistory, isMessageStored } = require('./database');
const { sendEmailAlert } = require('./emailService'); // Import email function

const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

whatsappClient.on('qr', (qr) => {
    console.log('📲 Scan the QR code below to connect:');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('authenticated', () => console.log('✅ WhatsApp authenticated!'));

whatsappClient.on('ready', () => console.log('🚀 WhatsApp is ready!'));

const targetNumbers = ['918179972700@c.us','918008404707@c.us','918790910514@c.us','917995830577@c.us']; // Target WhatsApp numbers

// Function to fetch chat history and save unique messages
const fetchAndSaveMessages = async (chatId) => {
    try {
        console.log(`📥 Fetching chat history for: ${chatId}`);
        const chat = await whatsappClient.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit: 50 }); // Fetch last 50 messages

        for (const message of messages) {
            const isStored = await isMessageStored(message.id._serialized);
            if (!isStored) {
                await saveMessageHistory(message.from, message.to, message.body, message.id._serialized);
            }
        }

        console.log(`✅ Chat history saved for: ${chatId}`);
    } catch (error) {
        console.error('❌ Error fetching chat history:', error);
    }
};

// Handle received messages
whatsappClient.on('message', async (message) => {
    try {
        const { from, to, body } = message;

        if (targetNumbers.includes(from) || targetNumbers.includes(to)) {
            console.log(`🔔 Message detected from/to: ${from}`);

            // Save message to MongoDB
            await saveMessage(from, to, body, message.id._serialized);

            // Fetch chat history and save
            await fetchAndSaveMessages(from);

            // Send Email Alert
            await sendEmailAlert(from, to, body);
        }
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Handle sent messages
whatsappClient.on('message_create', async (message) => {
    try {
        if (message.fromMe) {
            console.log(`📤 Sent message detected to: ${message.to}`);
            await saveMessage(message.from, message.to, message.body, message.id._serialized);

            // Fetch chat history and save
            await fetchAndSaveMessages(message.to);

            // Send Email Alert
            await sendEmailAlert(message.from, message.to, message.body);
        }
    } catch (error) {
        console.error('❌ Error processing sent message:', error);
    }
});

const startWhatsAppClient = () => whatsappClient.initialize();

module.exports = { startWhatsAppClient };
