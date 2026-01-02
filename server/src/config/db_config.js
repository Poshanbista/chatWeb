import mongose from "mongoose"

export const db_config=()=>{
    mongose
    .connect('mongodb://127.0.0.1:27017/ChatApp')
    .then(()=>console.log("mongodb connected"))
    .catch((err)=>console.log(err))
};