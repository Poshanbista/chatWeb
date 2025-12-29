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

export const upload = multer({
    storage,
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("audio/") ||
            file.mimetype === "application/pdf" ||
            file.mimetype === "text/plain"
        ) {
            cb(null, true);
        } else {
            cb(new Error("File type not supported"), false);
        }
    }
});
