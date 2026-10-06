import mongoose from "mongoose";
const schema=new mongoose.Schema({
 organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
 name:{type:String,required:true,trim:true},
 items:{type:[{label:{type:String,required:true},area:String,required:{type:Boolean,default:true}}],default:[]},
 status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true});
schema.index({hotel:1,name:1},{unique:true});
export default mongoose.model("HousekeepingChecklist",schema);