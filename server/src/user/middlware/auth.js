import { StatusCodes } from "http-status-codes"
import jwt from "jsonwebtoken"


export const auth = async (req, res, next) => {
    try {

        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Token not found",
                error: true
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN || "jsfkjalkdjfkaslkdfjksdf")

        if (!decode) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "unauthorized access",
                error: true
            })
        }

        req.userId = decode.id

        next()

    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: error.message || error,
            success: false
        })
    }
}
