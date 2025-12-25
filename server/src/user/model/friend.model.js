import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    friend: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

FriendSchema.index({ user: 1, friend: 1 }, { unique: true });
module.exports = mongoose.model('Friend', FriendSchema);