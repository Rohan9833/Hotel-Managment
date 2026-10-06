import mongoose from "mongoose";
const schema=new mongoose.Schema({key:{type:String,required:true,unique:true},module:{type:String,required:true},action:{type:String,required:true},description:String},{timestamps:true});
export default mongoose.model("Permission",schema);