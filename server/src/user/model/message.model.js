import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    text: String,
    attachments: [{ type: String }], // URLs (images, voice files)

    type: {
        type: String,
        enum: ['text', 'image', 'voice', 'system'],
        default: 'text'
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },

    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', MessageSchema);