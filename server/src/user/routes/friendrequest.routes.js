import Router from "express"
import { auth } from "../middlware/auth.js";
import { cancleFriendRequest, getFriendRequest, sendFriendRequest } from "../controller/friendRequest.controller.js";

const friendRequestRoutes = Router();

friendRequestRoutes.post("/send-request/:id", auth, sendFriendRequest)
friendRequestRoutes.delete("/cancel-request/:id", auth, cancleFriendRequest)
friendRequestRoutes.get("/getrequest", auth, getFriendRequest)

export default friendRequestRoutes;