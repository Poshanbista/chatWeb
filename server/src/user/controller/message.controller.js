import MessageModel from "../model/message.model.js";
import { StatusCodes } from "http-status-codes"



// send Message
export async function sendMessage(req, res) {
    try {

        const { to, text, type } = req.body;
        const from = req.userId;

        let attachments = [];

        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => file.path)
        }

        const messages = await MessageModel.create({
            from,
            to,
            text,
            attachments,
            type: type || (attachments.length > 0 ? "file" : "text"),
        });

        // Check if recipient is online
        const isRecipientOnline = req.io.sockets.adapter.rooms.get(to);
        if (isRecipientOnline) {
            messages.status = 'delivered';
            await messages.save();
        }

        req.io.to(to).emit("receivedMessage", messages)

        return res.status(StatusCodes.OK).json({
            success: true,
            messages
        })


    } catch (error) {
        console.log("Error while sending messaging", error)
        return res.status(500).json({
            message: "Server Error",
            error: true
        })
    }
}


// get message
export async function getMessages(req, res) {
    try {

        const userId = req.userId;
        const friendId = req.params.friendId;

        const messages = await MessageModel.find({
            $or: [
                { from: userId, to: friendId },
                { from: friendId, to: userId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(StatusCodes.OK).json({
            success: true,
            messages
        })

    } catch (error) {
        console.log("Error while getting messaging", error)
        return res.status(500).json({
            message: "Server Error",
            error: true
        })
    }
}

// update status of message
export async function updateMessageStatus(req, res) {
    try {

        const { messageId, status } = req.body;

        const messages = await MessageModel.findByIdAndUpdate(
            messageId,
            { status },
            { new: true }
        )

        return res.status(StatusCodes.OK).json({
            success: true,
            messages
        })

    } catch (error) {
        console.log("Error while update message status", error)
        return res.status(500).json({
            message: "Server Error",
            error: true
        })
    }
}