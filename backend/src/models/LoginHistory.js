import mongoose from "mongoose";
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},success:Boolean,ipAddress:String,userAgent:String,reason:String},{timestamps:true});
export default mongoose.model("LoginHistory",schema);