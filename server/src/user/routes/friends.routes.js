import { Router } from "express"
import { auth } from "../middlware/auth.js";
import { getAllFriend } from "../controller/friend.controller.js";

const friendRoutes = Router()

friendRoutes.get("/getFriend", auth,getAllFriend )

export default friendRoutes;