import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, // unique username
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },

    profile_picture:{
        type:String,
        default:"https://cdn.vectorstock.com/i/500p/66/69/default-profile-picture-avatar-photo-placeholder-vector-32286669.jpg"
        // default:"https://scontent.fktm10-1.fna.fbcdn.net/v/t39.30808-1/458796472_893887249312728_952651428924082333_n.jpg?stp=cp6_dst-jpg_s720x720_tt6&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=dX9oxYoyUOcQ7kNvwEzjDLO&_nc_oc=AdmBHFE7gFkemautnyy73glBKN_dQU2Fxz8LBjDdM065DP7iXeWMFueMkoWe7xw2HuULXhO2tx9WDw5HVbq5A_IK&_nc_zt=24&_nc_ht=scontent.fktm10-1.fna&_nc_gid=nZeNhDivJMs2tncON6NDPA&oh=00_Afnsahr3tRLplwcaLZCkkwkTTtB0_1hHey7EGKeOpyOvug&oe=69515C10"
    },

    refreshToken: {
        type: String,
        default: ""
    },

    resetPasswordToken: {
        type: String,
        default: ""
    },
    resetPasswordExpiry: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // friend relations stored in separate collection
});

const User = mongoose.model("User", userSchema)

export default User;