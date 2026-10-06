import mongoose from "mongoose";
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},tokenHash:{type:String,required:true,unique:true},expiresAt:{type:Date,required:true,index:true},usedAt:Date},{timestamps:true});
export default mongoose.model("PasswordResetToken",schema);