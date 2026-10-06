import mongoose from "mongoose";
const schema=new mongoose.Schema({
 organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
 asset:{type:mongoose.Schema.Types.ObjectId,ref:"PropertyAsset",default:null,index:true},
 room:{type:mongoose.Schema.Types.ObjectId,ref:"Room",default:null,index:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 category:{type:String,enum:["electrical","plumbing","hvac","furniture","internet","appliances","general"],default:"general"},
 frequency:{type:String,enum:["daily","weekly","monthly","quarterly","half_yearly","yearly"],required:true},
 nextDueAt:{type:Date,required:true,index:true},
 assignedTechnician:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null},
 estimatedCost:{type:Number,min:0,default:0},
 status:{type:String,enum:["active","paused","completed"],default:"active",index:true},
 lastGeneratedAt:Date
},{timestamps:true});
schema.index({hotel:1,nextDueAt:1,status:1});
export default mongoose.model("PreventiveMaintenanceSchedule",schema);