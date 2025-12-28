import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
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

    text: {
        type: String,
        default: ""
    },


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

const MessageModel = mongoose.model("MessageModel", MessageSchema)

export default MessageModel;
