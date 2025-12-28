import multer from "multer"
import cloudinary from "../utils/cloudinary.config.js";
import { CloudinaryStorage } from "multer-storage-cloudinary"

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        let folder = "Chat_app";
        return {
            folder,
            resource_type: "auto",
        }
    }
})

export const upload = multer({ storage })