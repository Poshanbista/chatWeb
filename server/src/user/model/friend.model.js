import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    friend: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const Friend = mongoose.model("Friend",FriendSchema)

export default Friend;