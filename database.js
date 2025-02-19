const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhecl.mongodb.net/${process.env.Db_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

const MessageSchema = new mongoose.Schema({
    from: String,
    to: String,
    body: String,
    messageId: { type: String, unique: true },
    timestamp: { type: Date, default: Date.now }
});

const MessageHistorySchema = new mongoose.Schema({
    from: String,
    to: String,
    body: String,
    messageId: { type: String, unique: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);
const MessageHistory = mongoose.model('MessageHistory', MessageHistorySchema);

const saveMessage = async (from, to, body, messageId) => {
    try {
        const message = new Message({ from, to, body, messageId });
        await message.save();
        console.log('💾 Message saved to MongoDB');
    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️ Duplicate message detected, skipping save.');
        } else {
            console.error('❌ Error saving message:', error);
        }
    }
};

const saveMessageHistory = async (from, to, body, messageId) => {
    try {
        const message = new MessageHistory({ from, to, body, messageId });
        await message.save();
        console.log('💾 Message history saved to MongoDB');
    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️ Duplicate history message detected, skipping save.');
        } else {
            console.error('❌ Error saving message history:', error);
        }
    }
};

// Check if a message is already stored
const isMessageStored = async (messageId) => {
    try {
        const existingMessage = await MessageHistory.findOne({ messageId });
        return !!existingMessage;
    } catch (error) {
        console.error('❌ Error checking message existence:', error);
        return false;
    }
};

module.exports = { saveMessage, saveMessageHistory, isMessageStored };
