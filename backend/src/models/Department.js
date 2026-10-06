import mongoose from "mongoose";
const schema=new mongoose.Schema({organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},name:{type:String,required:true,trim:true},code:{type:String,required:true,trim:true,uppercase:true},description:String,status:{type:String,enum:["active","inactive"],default:"active"}},{timestamps:true});
schema.index({organization:1,code:1},{unique:true});
export default mongoose.model("Department",schema);