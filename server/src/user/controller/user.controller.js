import { StatusCodes } from "http-status-codes"
import crypto from "crypto";
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { checkLoginAttemps, recordFailedAttempt, resetAttempts } from "../utils/loginRateLimit.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { transporter } from "../utils/mailSender.js"
import redisClient from "../../redisconfig/redis.js";
import svgCaptcha from "svg-captcha"
import cloudinary from "../utils/cloudinary.config.js";
import fs from "fs"
import FriendRequest from "../model/friendrequest.model.js";
import Friend from "../model/friend.model.js";


// Temporary captcha store (replace with Redis for production)
let captchaStore = {};

export const getCaptcha = (req, res) => {
    const sessionId = crypto.randomUUID();

    const captcha = svgCaptcha.create({
        size: 6,
        ignoreChars: "0oO1ilI",
        noise: 2,
        color: false,
        background: "black",
        width: 150,
        height: 50,
        fontSize: 40,
    })

    captchaStore[sessionId] = captcha.text;

    return res.json({
        sessionId,
        svg: captcha.data
    });
};


//registration
export async function userRegistration(req, res) {
    try {
        const { displayName, username, email, password, confirmPassword, sessionId, captchaText } = req.body;

        if (!displayName || !username || !email || !password || !confirmPassword || !sessionId || !captchaText) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "All field are required",
                success: false,
                error: true
            })
        }

        if (!sessionId || !captchaStore[sessionId]) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "Invalid captcha session.",
                error: true,
                success: false
            });
        }

        if (captchaStore[sessionId] !== captchaText) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "invalid captcha",
                error: true,
                success: false
            })
        }
        // Delete only after validation
        delete captchaStore[sessionId];


        //  Validate password match
        if (password !== confirmPassword) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Passwords do not match.",
                error: true,
                success: false
            }
            );
        }

        //  Check existing user/email
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Email or username already exists.",
                error: true,
                success: false
            });
        }

        //  Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            displayName,
            username,
            email,
            password: passwordHash
        });

        const redisKey = `registrationuser:${email}`;

        await redisClient.set(
            redisKey,
            JSON.stringify({
                _id: newUser._id,
                displayName: newUser.displayName,
                username: newUser.username,
                email: newUser.email,
                password: newUser.password
            }),
            {
                EX: 60 * 60    //expire in 1 hour
            }
        )

        return res.status(StatusCodes.OK).json({
            message: "User Register successfully",
            success: true,
            error: false
        })

    } catch (error) {
        console.log("Error in Registration", error);
        console.log("Error in server");
    }

}

//login 
export async function userLogin(req, res) {
    try {
        const { email, password, sessionId, captchaText } = req.body;

        if (!email || !password || !sessionId || !captchaText) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "Required all field",
                error: true,
                success: false
            })
        }

        const rateLimitKey = `login_attemps:${email}:${req.ip}`

        // check if user is blocked
        const limit = await checkLoginAttemps(rateLimitKey);

        if (limit.blocked) {
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                message: `Too many failed attempts. Please wait ${limit.waitTime} seconds `,
                success: false,
                error: true
            })
        }

        const redisKey = `loginuser:${email}`;

        const cachedUser = await redisClient.get(redisKey);
        let user;

        if (cachedUser) {
            user = JSON.parse(cachedUser);
        }
        else {
            user = await User.findOne({ email })
            if (!user) {
                await recordFailedAttempt(rateLimitKey);
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Register First",
                    error: true,
                    success: false
                })
            }
            await redisClient.set(
                redisKey,
                JSON.stringify({
                    email: user.email,
                    password: user.password
                }),
                { EX: 60 * 60 }
            )
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            await recordFailedAttempt(rateLimitKey);
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Invalid password",
                error: true,
                success: false
            })
        }

        if (!sessionId || !captchaStore[sessionId]) {
            await recordFailedAttempt(rateLimitKey);
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "Invalid captcha session.",
                error: true,
                success: false
            });
        }

        if (captchaStore[sessionId] !== captchaText) {
            await recordFailedAttempt(rateLimitKey)
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "invalid captcha",
                error: true,
                success: false
            })
        }

        // Delete only after validation
        delete captchaStore[sessionId];


        await resetAttempts(rateLimitKey);

        const fullUser = await User.findOne({ email });



        const accessToken = await generateAccessToken(fullUser._id);
        const refreshToken = await generateRefreshToken(fullUser._id);
        console.log("userId", fullUser._id)

        const updateUser = await User.findByIdAndUpdate(user._id,
            { refreshToken: refreshToken }
        )

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie("accessToken", accessToken, cookiesOption)
        res.cookie("refreshToken", refreshToken, cookiesOption)

        return res.status(StatusCodes.OK).json({
            message: "Login Successfully",
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken,
                fullUser
            }
        })


    } catch (error) {
        console.log("Error in login", error);
        console.log("Error in server");
    }

}

//logout 
export async function userLogout(req, res) {
    const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }
    res.clearCookie("accessToken", cookiesOption)
    res.clearCookie("refreshToken", cookiesOption)

    return res.status(StatusCodes.OK).json({
        message: "Logout successfully",
        success: true,
        error: false
    })
}


//forgot password 
export async function userForgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "email is required",
                error: true
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "email not found",
                error: true
            })
        }

        const otp = await generateOTP();
        const expireTime = Date.now() + 60 * 60 * 1000;  //expire in 1 hour

        const updateUser = await User.findByIdAndUpdate(user._id,
            {
                resetPasswordToken: otp,
                resetPasswordExpiry: new Date(expireTime).toISOString()
            })

        const mailOption = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset OTP",
            text: "Dear " + user.email + "\n\n" +
                "Your OTP for password reset is " + otp + "\n\n" +
                "This OTP expires in 1 hour."
        }

        console.log("EMAIL:", process.env.EMAIL);
        console.log("PASS:", process.env.PASS.length);



        await transporter.sendMail(mailOption);

        return res.status(StatusCodes.OK).json({
            message: "check your email",
            success: true
        })
    } catch (error) {
        console.error("Error in process of forgot password", error);
        console.info("Server Error")
    }
}

//otp verification
export async function userOTPVerification(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Email or otp is required",
                error: true
            });
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Email not available",
                error: true
            });
        }

        const currentTime = new Date().toISOString();
        if (currentTime > user.resetPasswordExpiry) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "OTP is expired",
                error: true
            });
        }

        if (user.resetPasswordToken !== otp) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Invalid otp",
                error: true
            });
        }

        const updateUser = await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: "",
            resetPasswordExpiry: ""
        })

        await updateUser.save();

        return res.status(StatusCodes.OK).json({
            message: "OTP verify successfully",
            success: true
        })

    } catch (error) {
        console.error("Error in process of verifing otp", error);
        console.info("Server Error")
    }
}

//Reset Password
export async function userResetPassword(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "All field are required",
                error: true
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "email not found",
                error: true
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "newPassword and cPassword not matched",
                error: true
            });
        }

        const newhashedPassword = await bcrypt.hash(newPassword, 10)

        const update = await User.findOneAndUpdate(user._id, {
            password: newhashedPassword
        })

        await update.save()
        return res.status(StatusCodes.OK).json({
            message: "Password Reset Successfully",
            success: true
        })



    } catch (error) {
        console.error("Error in process of Resetting password", error);
        console.info("Server Error")
    }
}

//upload profile picture
export async function userProfilePicture(req, res) {
    try {
        if (!req.file) {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message: "Image is required",
                error: true
            })
        }

        const uploadImage = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile-pictures",
            resource_type: "image"
        })

        fs.unlinkSync(req.file.path)

        const userId = req.user._id

        const updatedUser = await User.findByIdAndUpdate(userId, {
            profile_picture: uploadImage.secure_url
        })

        return res.status(StatusCodes.OK).json({
            message: "Profile picture uploaded successfully",
            success: true,
            error: false,
            user: updatedUser
        })

    } catch (error) {
        console.error("Error in uploading profile picture", error);
        console.info("Server Error")
    }
}

//search user 
export async function userSearch(req, res) {
    try {
        const { query } = req.query;

        if (!query)
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Query is required",
                error: true
            });

        // Case-insensitive regex search on username or displayName
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { displayName: { $regex: query, $options: "i" } }
            ]
        }).limit(10); // limit results for performance

        return res.status(StatusCodes.OK).json({
            users
        })

    } catch (error) {
        console.error("Error in searching", error);
        console.info("Server Error")
    }
}

// fetch all register user
export async function fetchUser(req, res) {
    try {

        const userId = req._id;
        const users = await User.find({ _id: { $ne: userId } })

        return res.status(StatusCodes.OK).json({
            message: "All user",
            success: true,
            users
        })
    } catch (error) {
        console.log("Error while fetching user", error)
        console.log("server Error")
    }
}

//fetch user by id
export async function fetchEachUser(req, res) {
    try {
        const { user_id } = req.params;
        const loggedUser = req.userId;

        const eachUser = await User.findById(user_id)

        if (!eachUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "user not found",
                error: true
            })
        }

        //to check the user send a request or not 
        const isRequestSent = await FriendRequest.exists({
            from: loggedUser,
            to: user_id,
            status: "pending"
        })

        // to check the user received the request from the individual user
        const isRequestReceived = await FriendRequest.exists({
            from: user_id,
            to: loggedUser,
            status: "pending"
        })

        // to check the user is friend with or not
        const isFriend = await Friend.exists({
            $or: [
                { user: loggedUser, friend: user_id },
                { user: user_id, friend: loggedUser }
            ]
        })

        return res.status(StatusCodes.OK).json({
            message: "successfully",
            success: true,
            error: false,
            eachUser,
            isFriendRequestSent: !!isRequestSent,
            isFriendRequestReceived: !!isRequestReceived,
            isFriendWith: !!isFriend
        })

    } catch (error) {
        console.log("Error while fetching each user", error)
        console.log("Server Error")
    }

}