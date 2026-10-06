import mongoose from "mongoose";
const itemSchema=new mongoose.Schema({label:{type:String,required:true},area:String,required:Boolean,completed:{type:Boolean,default:false},completedAt:Date,completedBy:{type:mongoose.Schema.Types.ObjectId,ref:"Employee"}},{_id:false});
const schema=new mongoose.Schema({
 organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
 room:{type:mongoose.Schema.Types.ObjectId,ref:"Room",required:true,index:true},
 assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 supervisor:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null},
 checklistTemplate:{type:mongoose.Schema.Types.ObjectId,ref:"HousekeepingChecklist",default:null},
 checklist:{type:[itemSchema],default:[]},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},
 status:{type:String,enum:["assigned","in_progress","cleaned","inspection","approved","rejected","cancelled"],default:"assigned",index:true},
 rejectionReason:String,
 cleaningStartedAt:Date,
 cleaningCompletedAt:Date,
 inspectedAt:Date,
 approvedAt:Date,
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});
schema.index({hotel:1,status:1,createdAt:-1});
schema.index({hotel:1,room:1,status:1});
export default mongoose.model("HousekeepingTask",schema);