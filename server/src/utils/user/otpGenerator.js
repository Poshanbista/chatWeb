import crypto from "crypto"

export const generateOTP=async()=>{
    const otp = crypto.randomInt(100000,999999).toString();  //generate 6 digit otp
    return otp;
}