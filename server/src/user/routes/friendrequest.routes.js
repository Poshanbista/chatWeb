import Router from "express"
import { auth } from "../middlware/auth.js";
import { acceptFriendRequest, cancleFriendRequest, getFriendRequest, sendFriendRequest } from "../controller/friendRequest.controller.js";

const friendRequestRoutes = Router();

friendRequestRoutes.post("/send-request/:id", auth, sendFriendRequest)
friendRequestRoutes.delete("/cancel-request/:id", auth, cancleFriendRequest)
friendRequestRoutes.get("/getrequest", auth, getFriendRequest)
friendRequestRoutes.put("/accept-request/:requestId",auth,acceptFriendRequest)

export default friendRequestRoutes;