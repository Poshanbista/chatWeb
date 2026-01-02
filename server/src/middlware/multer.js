import multer from "multer"
import fs from "fs"


// Check if the folder exists, if not, create it
if (!fs.existsSync("./publicFolder")) {
    fs.mkdirSync("./publicFolder", { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./publicFolder")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname
            + "-" +
            uniqueSuffix
            + "." +
            file.originalname.split(".").pop(),

        )
    }
})

const upload = multer({
    storage
})

export default upload;