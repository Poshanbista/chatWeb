import { Router } from "express";
import { fetchEachUser, fetchUser, getCaptcha, userForgotPassword, userLogin, userLogout, userOTPVerification, userProfilePicture, userRegistration, userResetPassword, userSearch } from "../controller/user.controller.js";
import { auth } from '../middlware/auth.js'
import upload from "../middlware/multer.js";

const userRoutes = Router();

userRoutes.get("/captcha", getCaptcha)
userRoutes.post("/register", userRegistration)
userRoutes.post("/login", userLogin)
userRoutes.post("/logout", userLogout)
userRoutes.post("/forgot-password", userForgotPassword)
userRoutes.post("/otp-verification", userOTPVerification)
userRoutes.post("/reset-password", userResetPassword)
userRoutes.put("/profile_picture", auth, upload.single("profilePicture"), userProfilePicture)
userRoutes.get("/userFetch", fetchUser)
userRoutes.get("/search", userSearch)
userRoutes.get("/:user_id", auth, fetchEachUser)

export default userRoutes;