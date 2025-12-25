import { StatusCodes } from "http-status-codes";
import FriendRequest from "../model/friendrequest.model.js";

//send friend request 
export async function sendFriendRequest(req, res) {
    try {
        const senderId = req.userId;
        console.log("sender", senderId)

        const receiverId = req.params.id;

        const existing = await FriendRequest.findOne({ from: senderId, to: receiverId });
        if (existing) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Already sent",
                error: true
            })
        }

        const request = await FriendRequest.create({
            from: senderId,
            to: receiverId
        })

        res.status(StatusCodes.OK).json({
            message: "Friend Request Send",
            success: true,
            request
        })

    } catch (error) {
        console.log("Error while sending Friend Request", error)
        return res.status(500).json({
            message: "Server error",
            error: true
        });
    }
}

//cancel request
export async function cancleFriendRequest(req, res) {
    try {
        const senderId = req.userId;
        const receiverId = req.params.id;

        await FriendRequest.findOneAndDelete({
            from: senderId,
            to: receiverId,
            status: "pending"
        })

        return res.status(StatusCodes.OK).json({
            message: "Friend request cancel",
            success: true
        })

    } catch (error) {
        console.log("Error while canceling Friend Request", error)
        return res.status(500).json({
            message: "server Error",
            error: true
        })
    }
}

//getFriendRequest
export async function getFriendRequest(req, res) {
    try {

        const userId = req.userId;
        const requests = await FriendRequest.find({
            to: userId,
            status: "pending"
        }).populate('from', 'username displayName  profile_picture').sort({ createdAt: -1 })

        return res.status(StatusCodes.OK).json({
            message: "fetch friend request",
            success: true,
            requests
        })

    } catch (error) {
        console.log("Error while getting Friend Request", error)
        return res.status(500).json({
            message: "server Error",
            error: true
        })
    }
}