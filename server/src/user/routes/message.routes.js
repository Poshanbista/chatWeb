import { Router } from "express";
import { auth } from "../middlware/auth.js"
import { getMessages, sendMessage, updateMessageStatus } from "../controller/message.controller.js";
import { upload } from "../middlware/multer.js"


const messageRoutes = Router();

messageRoutes.post("/send", auth, upload.array("attachments"), sendMessage)
messageRoutes.get("/:friendId", auth, getMessages)
messageRoutes.patch("/status", auth, updateMessageStatus)


export default messageRoutes;