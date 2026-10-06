import mongoose from "mongoose";
const schema=new mongoose.Schema({organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true},slug:{type:String,required:true},isSystem:{type:Boolean,default:true},permissions:[{type:mongoose.Schema.Types.ObjectId,ref:"Permission"}]},{timestamps:true});
schema.index({organization:1,slug:1},{unique:true});
export default mongoose.model("Role",schema);