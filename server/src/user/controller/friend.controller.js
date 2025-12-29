import { StatusCodes } from "http-status-codes";
import Friend from "../model/friend.model.js";

// get all Friend 
export async function getAllFriend(req, res) {
    try {

        const userId = req.userId;

        const friendData = await Friend.find(
            { user: userId }
        ).populate("friend", "username displayName profile_picture")

        if (!friendData) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "no friend",
                success: true,
                friends: ""
            })
        }
        

        return res.status(StatusCodes.OK).json({
            success: true,
            friends: friendData
        })

    } catch (error) {
        console.log("Error while declining Friend Request", error)
        return res.status(500).json({
            message: "Server Error",
            error: true
        })
    }
}