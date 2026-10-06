import mongoose from "mongoose";
const schema=new mongoose.Schema({organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},status:{type:String,enum:["active","inactive"],default:"active"}},{timestamps:true});
schema.index({user:1,hotel:1},{unique:true});
export default mongoose.model("HotelMembership",schema);