import mongoose from "mongoose";
const schema=new mongoose.Schema({
 organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
 businessDate:{type:Date,required:true,index:true},
 occupancyPercent:{type:Number,min:0,max:100,required:true},
 roomsSold:{type:Number,min:0,required:true},
 roomsAvailable:{type:Number,min:0,required:true},
 adr:{type:Number,min:0,required:true},
 revpar:{type:Number,min:0,required:true},
 revenue:{type:Number,min:0,required:true},
 complaints:{type:Number,min:0,default:0},
 staffPresent:{type:Number,min:0,required:true},
 checkIns:{type:Number,min:0,default:0},
 checkOuts:{type:Number,min:0,default:0},
 notes:String,
 submittedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 submittedAt:{type:Date,default:Date.now},
 status:{type:String,enum:["official","corrected"],default:"official"},
 correctionReason:String
},{timestamps:true});
schema.index({hotel:1,businessDate:1},{unique:true});
export default mongoose.model("DailyOperationsReport",schema);