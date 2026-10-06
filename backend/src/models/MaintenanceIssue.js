import mongoose from "mongoose";
const partSchema=new mongoose.Schema({name:{type:String,required:true},quantity:{type:Number,min:0,required:true},unitCost:{type:Number,min:0,default:0}},{_id:false});
const schema=new mongoose.Schema({
 organization:{type:mongoose.Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
 locationType:{type:String,enum:["room","asset","general"],default:"general"},
 room:{type:mongoose.Schema.Types.ObjectId,ref:"Room",default:null,index:true},
 asset:{type:mongoose.Schema.Types.ObjectId,ref:"PropertyAsset",default:null,index:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,required:true},
 category:{type:String,enum:["electrical","plumbing","hvac","furniture","internet","appliances","general"],default:"general",index:true},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium",index:true},
 photos:{type:[String],default:[]},
 reportedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 assignedTechnician:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 status:{type:String,enum:["open","assigned","in_progress","resolved","verified","closed"],default:"open",index:true},
 expectedCompletionAt:Date,
 actualCompletionAt:Date,
 resolvedAt:Date,
 verifiedAt:Date,
 closedAt:Date,
 verifiedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 resolution:String,
 parts:{type:[partSchema],default:[]},
 cost:{type:Number,min:0,default:0},
 beforePhotos:{type:[String],default:[]},
 afterPhotos:{type:[String],default:[]},
 preventiveSchedule:{type:mongoose.Schema.Types.ObjectId,ref:"PreventiveMaintenanceSchedule",default:null},
 source:{type:String,enum:["reactive","preventive"],default:"reactive"}
},{timestamps:true});
schema.index({hotel:1,status:1,priority:1});
export default mongoose.model("MaintenanceIssue",schema);