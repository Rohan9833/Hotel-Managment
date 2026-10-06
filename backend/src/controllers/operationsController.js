import {z} from "zod";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Attendance from "../models/Attendance.js";
import ShiftAssignment from "../models/ShiftAssignment.js";
import ShiftHandover from "../models/ShiftHandover.js";
import DailyOperationsReport from "../models/DailyOperationsReport.js";
import {writeAudit} from "../services/auditService.js";

const id=z.string().min(1);
const day=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const nextDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()+1);return x};
const orgWide=slug=>["owner","group-administrator"].includes(slug);
async function hotelFor(req,hotelId){
 if(!hotelId)return null;
 const h=await Hotel.findOne({_id:hotelId,organization:req.user.organization});
 if(!h)throw Object.assign(new Error("Hotel not found"),{status:404});
 if(!orgWide(req.user.role?.slug)&&!req.hotelIds.includes(h._id.toString()))throw Object.assign(new Error("You are not authorized for this hotel"),{status:403});
 return h;
}
async function statsFor(req,hotelId,businessDate){
 await hotelFor(req,hotelId); const start=day(businessDate),end=nextDay(businessDate);
 const [rooms,attendance,assignments,handovers,report]=await Promise.all([
  Room.find({organization:req.user.organization,hotel:hotelId,isActive:true}).select("currentStatus maintenanceStatus"),
  Attendance.find({organization:req.user.organization,hotel:hotelId,date:{$gte:start,$lt:end}}).select("employee status"),
  ShiftAssignment.find({organization:req.user.organization,hotel:hotelId,date:{$gte:start,$lt:end}}).select("employee status"),
  ShiftHandover.find({organization:req.user.organization,hotel:hotelId,status:{$in:["open","in_progress"]}}).select("priority status description createdAt"),
  DailyOperationsReport.findOne({organization:req.user.organization,hotel:hotelId,businessDate:start})
 ]);
 const total=rooms.length, occupied=rooms.filter(r=>r.currentStatus==="occupied").length;
 const count=s=>rooms.filter(r=>r.currentStatus===s).length;
 const present=attendance.filter(a=>a.status==="present"||a.status==="late").length;
 const maintenanceAttention=rooms.filter(r=>["attention","blocked"].includes(r.maintenanceStatus)).length;
 const urgentHandovers=handovers.filter(h=>h.priority==="urgent").length;
 return {businessDate:start,totalRooms:total,occupancyPercent:total?Number(((occupied/total)*100).toFixed(2)):0,rooms:{occupied,available:rooms.filter(r=>["vacant","ready"].includes(r.currentStatus)&&r.maintenanceStatus!=="blocked").length,dirty:count("dirty"),cleaning:count("cleaning"),ready:count("ready")},checkIns:report?.checkIns||0,checkOuts:report?.checkOuts||0,maintenance:{attention:maintenanceAttention,urgent:0},staff:{scheduled:assignments.filter(a=>a.status!=="cancelled").length,present,absent:attendance.filter(a=>a.status==="absent").length,late:attendance.filter(a=>a.status==="late").length,onLeave:attendance.filter(a=>a.status==="leave").length},pendingTasks:handovers.length,urgentTasks:urgentHandovers,maintenanceAttention,reportSubmitted:Boolean(report),report};
}
export async function dashboard(req,res){const input=z.object({hotelId:id,date:z.coerce.date().optional()}).parse(req.query);res.json({dashboard:await statsFor(req,input.hotelId,input.date||new Date())});}
export async function submitReport(req,res){
 const input=z.object({hotelId:id,businessDate:z.coerce.date(),occupancyPercent:z.coerce.number().min(0).max(100),roomsSold:z.coerce.number().int().min(0),roomsAvailable:z.coerce.number().int().min(0),adr:z.coerce.number().min(0),revpar:z.coerce.number().min(0),revenue:z.coerce.number().min(0),complaints:z.coerce.number().int().min(0).optional(),staffPresent:z.coerce.number().int().min(0),checkIns:z.coerce.number().int().min(0).optional(),checkOuts:z.coerce.number().int().min(0).optional(),notes:z.string().optional()}).parse(req.body);
 await hotelFor(req,input.hotelId);const businessDate=day(input.businessDate);
 const existing=await DailyOperationsReport.findOne({organization:req.user.organization,hotel:input.hotelId,businessDate});
 if(existing){
  if(!req.user.permissions?.includes("operations.report.correct"))return res.status(409).json({message:"An official daily report already exists for this hotel and date"});
  if(!input.notes)return res.status(400).json({message:"Correction reason must be provided in notes"});
  existing.status="corrected";existing.correctionReason=input.notes;Object.assign(existing,{...input,businessDate,submittedBy:req.user._id,submittedAt:new Date()});await existing.save();
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"correct",entity:"DailyOperationsReport",recordId:existing._id.toString(),newValue:input});
  return res.json({report:existing});
 }
 const report=await DailyOperationsReport.create({organization:req.user.organization,hotel:input.hotelId,businessDate,...input,submittedBy:req.user._id});
 await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"DailyOperationsReport",recordId:report._id.toString(),newValue:input});
 res.status(201).json({report});
}
export async function getReport(req,res){const input=z.object({hotelId:id,date:z.coerce.date()}).parse(req.query);await hotelFor(req,input.hotelId);res.json({report:await DailyOperationsReport.findOne({organization:req.user.organization,hotel:input.hotelId,businessDate:day(input.date)}).populate("submittedBy","name")});}
export async function listReports(req,res){await hotelFor(req,req.query.hotelId);const reports=await DailyOperationsReport.find({organization:req.user.organization,hotel:req.query.hotelId}).populate("submittedBy","name").sort({businessDate:-1}).limit(90);res.json({reports});}
export async function groupSummary(req,res){
 const hotels=await Hotel.find({organization:req.user.organization,_id:{$in:req.hotelIds}}).select("name");
 const today=day(new Date()),reports=await DailyOperationsReport.find({organization:req.user.organization,hotel:{$in:hotels.map(h=>h._id)},businessDate:today}).populate("hotel","name");
 const submitted=new Set(reports.map(r=>r.hotel._id.toString()));
 const totals=reports.reduce((a,r)=>({roomsSold:a.roomsSold+r.roomsSold,revenue:a.revenue+r.revenue,occupancySum:a.occupancySum+r.occupancyPercent}),{roomsSold:0,revenue:0,occupancySum:0});
 res.json({date:today,totalHotels:hotels.length,submitted:reports.length,pending:hotels.length-reports.length,groupOccupancy:reports.length?Number((totals.occupancySum/reports.length).toFixed(2)):0,revenue:totals.revenue,roomsSold:totals.roomsSold,reports});
}
export async function exceptions(req,res){
 const hotelId=req.query.hotelId;await hotelFor(req,hotelId);
 const dashboard=await statsFor(req,hotelId,req.query.date||new Date()),items=[];
 if(!dashboard.reportSubmitted)items.push({type:"report",severity:"high",message:"Daily operations report has not been submitted"});
 if(dashboard.urgentTasks)items.push({type:"handover",severity:"urgent",message:`${dashboard.urgentTasks} urgent handover item(s) need attention`});
 if(dashboard.maintenanceAttention)items.push({type:"maintenance",severity:"high",message:`${dashboard.maintenanceAttention} room(s) have maintenance attention or are blocked`});
 if(dashboard.staff.absent)items.push({type:"staff",severity:"medium",message:`${dashboard.staff.absent} scheduled staff member(s) are marked absent`}); const previous=await DailyOperationsReport.findOne({organization:req.user.organization,hotel:hotelId,businessDate:{$lt:day(req.query.date||new Date())}}).sort({businessDate:-1}); if(previous&&dashboard.report&&Number(previous.occupancyPercent)-Number(dashboard.report.occupancyPercent)>=10)items.push({type:"occupancy",severity:"high",message:`Occupancy is down ${(Number(previous.occupancyPercent)-Number(dashboard.report.occupancyPercent)).toFixed(1)} percentage points from the previous report`});
 res.json({exceptions:items});
}