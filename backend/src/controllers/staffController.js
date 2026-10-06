import {z} from "zod";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Shift from "../models/Shift.js";
import ShiftAssignment from "../models/ShiftAssignment.js";
import ShiftHandover from "../models/ShiftHandover.js";
import Hotel from "../models/Hotel.js";
import {writeAudit} from "../services/auditService.js";

const id=z.string().min(1);
const dateSchema=z.coerce.date();
const orgWide=slug=>["owner","group-administrator"].includes(slug);

async function hotelFor(req,hotelId){
  if(!hotelId)return null;
  const hotel=await Hotel.findOne({_id:hotelId,organization:req.user.organization});
  if(!hotel)throw Object.assign(new Error("Hotel not found"),{status:404});
  if(!orgWide(req.user.role?.slug)&&!req.hotelIds.includes(hotelId.toString()))throw Object.assign(new Error("You are not authorized for this hotel"),{status:403});
  return hotel;
}
function dayStart(value){const d=new Date(value);d.setHours(0,0,0,0);return d}
async function employeeFor(req,employeeId){
  const employee=await Employee.findOne({_id:employeeId,organization:req.user.organization});
  if(!employee)throw Object.assign(new Error("Employee not found"),{status:404});
  await hotelFor(req,employee.hotel);
  return employee;
}
async function departmentFor(req,departmentId){
  if(!departmentId)return null;
  const d=await Department.findOne({_id:departmentId,organization:req.user.organization});
  if(!d)throw Object.assign(new Error("Department not found"),{status:404});
  return d;
}

export async function listDepartments(req,res){
  const departments=await Department.find({organization:req.user.organization}).sort({name:1});
  res.json({departments});
}
export async function createDepartment(req,res){
  const input=z.object({name:z.string().min(2),code:z.string().min(2),description:z.string().optional()}).parse(req.body);
  const department=await Department.create({organization:req.user.organization,...input});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"Department",recordId:department._id.toString(),newValue:input});
  res.status(201).json({department});
}
export async function updateDepartment(req,res){
  const input=z.object({name:z.string().min(2).optional(),code:z.string().min(2).optional(),description:z.string().optional(),status:z.enum(["active","inactive"]).optional()}).parse(req.body);
  const department=await Department.findOne({_id:req.params.departmentId,organization:req.user.organization});
  if(!department)return res.status(404).json({message:"Department not found"});
  const previous=department.toObject();Object.assign(department,input);await department.save();
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"update",entity:"Department",recordId:department._id.toString(),previousValue:previous,newValue:input});
  res.json({department});
}

export async function listEmployees(req,res){
  const hotel=await hotelFor(req,req.query.hotelId);
  const filter={organization:req.user.organization,...(hotel?{hotel:hotel._id}:{})};
  const employees=await Employee.find(filter).populate("department","name code").populate("manager","name employeeId").sort({name:1});
  res.json({employees});
}
export async function createEmployee(req,res){
  const input=z.object({hotelId:id,employeeId:z.string().min(1),name:z.string().min(2),phone:z.string().optional(),email:z.string().email().optional(),userId:id.optional(),departmentId:id.optional(),designation:z.string().optional(),joiningDate:dateSchema.optional(),status:z.enum(["active","on_leave","suspended","resigned","terminated"]).optional(),managerId:id.optional(),emergencyContact:z.object({name:z.string().optional(),relationship:z.string().optional(),phone:z.string().optional()}).optional(),documents:z.array(z.object({name:z.string(),type:z.string().optional(),reference:z.string().optional(),expiresAt:dateSchema.optional()})).optional()}).parse(req.body);
  const hotel=await hotelFor(req,input.hotelId);await departmentFor(req,input.departmentId);
  if(input.managerId){const manager=await Employee.findOne({_id:input.managerId,organization:req.user.organization,hotel:hotel._id});if(!manager)return res.status(400).json({message:"Manager must belong to the same hotel"})}
  const employee=await Employee.create({organization:req.user.organization,hotel:hotel._id,employeeId:input.employeeId,name:input.name,phone:input.phone,email:input.email,user:input.userId,department:input.departmentId,designation:input.designation,joiningDate:input.joiningDate,status:input.status,manager:input.managerId,emergencyContact:input.emergencyContact,documents:input.documents});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"Employee",recordId:employee._id.toString(),newValue:{...input}});
  res.status(201).json({employee});
}
export async function updateEmployee(req,res){
  const employee=await employeeFor(req,req.params.employeeId);
  const input=z.object({name:z.string().min(2).optional(),phone:z.string().optional(),email:z.string().email().optional(),userId:id.nullish(),departmentId:id.nullish(),designation:z.string().optional(),joiningDate:dateSchema.optional(),status:z.enum(["active","on_leave","suspended","resigned","terminated"]).optional(),managerId:id.nullish(),emergencyContact:z.object({name:z.string().optional(),relationship:z.string().optional(),phone:z.string().optional()}).optional(),documents:z.array(z.object({name:z.string(),type:z.string().optional(),reference:z.string().optional(),expiresAt:dateSchema.optional()})).optional()}).parse(req.body);
  await departmentFor(req,input.departmentId);
  if(input.managerId){const manager=await Employee.findOne({_id:input.managerId,organization:req.user.organization,hotel:employee.hotel});if(!manager)return res.status(400).json({message:"Manager must belong to the same hotel"})}
  const previous=employee.toObject();
  if(input.name!==undefined)employee.name=input.name;if(input.phone!==undefined)employee.phone=input.phone;if(input.email!==undefined)employee.email=input.email;if(input.userId!==undefined)employee.user=input.userId||null;if(input.departmentId!==undefined)employee.department=input.departmentId||null;if(input.designation!==undefined)employee.designation=input.designation;if(input.joiningDate!==undefined)employee.joiningDate=input.joiningDate;if(input.status!==undefined)employee.status=input.status;if(input.managerId!==undefined)employee.manager=input.managerId||null;if(input.emergencyContact!==undefined)employee.emergencyContact=input.emergencyContact;if(input.documents!==undefined)employee.documents=input.documents;
  await employee.save();await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"update",entity:"Employee",recordId:employee._id.toString(),previousValue:previous,newValue:input});res.json({employee});
}

async function validateEmployeeHotel(req,employeeId,hotelId){
  const employee=await employeeFor(req,employeeId);
  if(hotelId&&employee.hotel.toString()!==hotelId.toString())throw Object.assign(new Error("Employee does not belong to this hotel"),{status:400});
  return employee;
}
export async function listAttendance(req,res){
  await hotelFor(req,req.query.hotelId);
  const filter={organization:req.user.organization,...(req.query.hotelId?{hotel:req.query.hotelId}:{}),...(req.query.date?{date:dayStart(req.query.date)}:{})};
  const attendance=await Attendance.find(filter).populate("employee","name employeeId").populate("shift","name startTime endTime").sort({date:-1});
  res.json({attendance});
}
export async function upsertAttendance(req,res){
  const input=z.object({hotelId:id,employeeId:id,date:dateSchema,status:z.enum(["present","absent","late","half_day","leave"]),checkIn:dateSchema.nullish(),checkOut:dateSchema.nullish(),shiftId:id.nullish(),remarks:z.string().optional()}).parse(req.body);
  await hotelFor(req,input.hotelId);const employee=await validateEmployeeHotel(req,input.employeeId,input.hotelId);
  if(input.shiftId){const shift=await Shift.findOne({_id:input.shiftId,organization:req.user.organization,hotel:employee.hotel});if(!shift)return res.status(400).json({message:"Shift does not belong to this hotel"})}
  const filter={employee:employee._id,date:dayStart(input.date)};
  const previous=await Attendance.findOne(filter);
  const attendance=await Attendance.findOneAndUpdate(filter,{organization:req.user.organization,hotel:employee.hotel,employee:employee._id,date:dayStart(input.date),status:input.status,checkIn:input.checkIn||null,checkOut:input.checkOut||null,shift:input.shiftId||null,remarks:input.remarks,recordedBy:req.user._id},{upsert:true,new:true,setDefaultsOnInsert:true});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:previous?"update":"create",entity:"Attendance",recordId:attendance._id.toString(),previousValue:previous,newValue:attendance.toObject()});
  res.status(previous?200:201).json({attendance});
}

export async function listShifts(req,res){
  await hotelFor(req,req.query.hotelId);
  const shifts=await Shift.find({organization:req.user.organization,...(req.query.hotelId?{hotel:req.query.hotelId}:{})}).populate("department","name code").sort({name:1});
  res.json({shifts});
}
export async function createShift(req,res){
  const input=z.object({hotelId:id,name:z.string().min(2),startTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),endTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),departmentId:id.nullish(),notes:z.string().optional()}).parse(req.body);
  await hotelFor(req,input.hotelId);await departmentFor(req,input.departmentId);
  const shift=await Shift.create({organization:req.user.organization,hotel:input.hotelId,name:input.name,startTime:input.startTime,endTime:input.endTime,department:input.departmentId||null,notes:input.notes});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"Shift",recordId:shift._id.toString(),newValue:input});res.status(201).json({shift});
}
export async function updateShift(req,res){
  const shift=await Shift.findOne({_id:req.params.shiftId,organization:req.user.organization});if(!shift)return res.status(404).json({message:"Shift not found"});await hotelFor(req,shift.hotel);
  const input=z.object({name:z.string().min(2).optional(),startTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/).optional(),endTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/).optional(),departmentId:id.nullish(),status:z.enum(["active","inactive"]).optional(),notes:z.string().optional()}).parse(req.body);await departmentFor(req,input.departmentId);
  const previous=shift.toObject();if(input.name!==undefined)shift.name=input.name;if(input.startTime!==undefined)shift.startTime=input.startTime;if(input.endTime!==undefined)shift.endTime=input.endTime;if(input.departmentId!==undefined)shift.department=input.departmentId||null;if(input.status!==undefined)shift.status=input.status;if(input.notes!==undefined)shift.notes=input.notes;await shift.save();await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"update",entity:"Shift",recordId:shift._id.toString(),previousValue:previous,newValue:input});res.json({shift});
}

export async function listAssignments(req,res){
  await hotelFor(req,req.query.hotelId);
  const filter={organization:req.user.organization,...(req.query.hotelId?{hotel:req.query.hotelId}:{}),...(req.query.date?{date:dayStart(req.query.date)}:{})};
  const assignments=await ShiftAssignment.find(filter).populate("shift","name startTime endTime").populate("employee","name employeeId").populate("replacementFor","employee").sort({date:-1});
  res.json({assignments});
}
export async function createAssignment(req,res){
  const input=z.object({hotelId:id,shiftId:id,employeeId:id,date:dateSchema,notes:z.string().optional()}).parse(req.body);
  await hotelFor(req,input.hotelId);const employee=await validateEmployeeHotel(req,input.employeeId,input.hotelId);const shift=await Shift.findOne({_id:input.shiftId,organization:req.user.organization,hotel:input.hotelId});if(!shift)return res.status(400).json({message:"Shift does not belong to this hotel"});
  const assignment=await ShiftAssignment.create({organization:req.user.organization,hotel:input.hotelId,shift:shift._id,employee:employee._id,date:dayStart(input.date),notes:input.notes,createdBy:req.user._id});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"ShiftAssignment",recordId:assignment._id.toString(),newValue:input});res.status(201).json({assignment});
}
export async function updateAssignment(req,res){
  const assignment=await ShiftAssignment.findOne({_id:req.params.assignmentId,organization:req.user.organization});if(!assignment)return res.status(404).json({message:"Shift assignment not found"});await hotelFor(req,assignment.hotel);
  const input=z.object({status:z.enum(["assigned","replaced","cancelled","completed"]).optional(),employeeId:id.optional(),replacementForId:id.nullish(),checkIn:dateSchema.nullish(),checkOut:dateSchema.nullish(),overtimeMinutes:z.coerce.number().min(0).optional(),notes:z.string().optional()}).parse(req.body);
  const previous=assignment.toObject();
  if(input.employeeId){const e=await validateEmployeeHotel(req,input.employeeId,assignment.hotel);assignment.employee=e._id}
  if(input.status!==undefined)assignment.status=input.status;if(input.replacementForId!==undefined)assignment.replacementFor=input.replacementForId||null;if(input.checkIn!==undefined)assignment.checkIn=input.checkIn||null;if(input.checkOut!==undefined)assignment.checkOut=input.checkOut||null;if(input.overtimeMinutes!==undefined)assignment.overtimeMinutes=input.overtimeMinutes;if(input.notes!==undefined)assignment.notes=input.notes;
  await assignment.save();await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"update",entity:"ShiftAssignment",recordId:assignment._id.toString(),previousValue:previous,newValue:input});res.json({assignment});
}
export async function replaceAssignment(req,res){
  const assignment=await ShiftAssignment.findOne({_id:req.params.assignmentId,organization:req.user.organization});if(!assignment)return res.status(404).json({message:"Shift assignment not found"});await hotelFor(req,assignment.hotel);
  const input=z.object({replacementEmployeeId:id,notes:z.string().optional()}).parse(req.body);const employee=await validateEmployeeHotel(req,input.replacementEmployeeId,assignment.hotel);
  const replacement=await ShiftAssignment.create({organization:req.user.organization,hotel:assignment.hotel,shift:assignment.shift,employee:employee._id,date:assignment.date,status:"replaced",replacementFor:assignment._id,notes:input.notes,createdBy:req.user._id});
  assignment.status="replaced";await assignment.save();await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"replace",entity:"ShiftAssignment",recordId:assignment._id.toString(),newValue:{replacementAssignment:replacement._id,replacementEmployeeId:employee._id}});res.status(201).json({assignment,replacement});
}

export async function listHandovers(req,res){
  await hotelFor(req,req.query.hotelId);
  const handovers=await ShiftHandover.find({organization:req.user.organization,...(req.query.hotelId?{hotel:req.query.hotelId}:{}),...(req.query.status?{status:req.query.status}:{})}).populate("department","name").populate("assignedTo","name employeeId").populate("fromShift","name").populate("toShift","name").populate("createdBy","name").sort({createdAt:-1});
  res.json({handovers});
}
export async function createHandover(req,res){
  const input=z.object({hotelId:id,departmentId:id.nullish(),fromShiftId:id.nullish(),toShiftId:id.nullish(),description:z.string().min(2),priority:z.enum(["low","medium","high","urgent"]).optional(),assignedToId:id.nullish()}).parse(req.body);
  await hotelFor(req,input.hotelId);await departmentFor(req,input.departmentId);
  if(input.assignedToId)await validateEmployeeHotel(req,input.assignedToId,input.hotelId);
  const handover=await ShiftHandover.create({organization:req.user.organization,hotel:input.hotelId,department:input.departmentId||null,fromShift:input.fromShiftId||null,toShift:input.toShiftId||null,description:input.description,priority:input.priority,assignedTo:input.assignedToId||null,createdBy:req.user._id});
  await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"create",entity:"ShiftHandover",recordId:handover._id.toString(),newValue:input});res.status(201).json({handover});
}
export async function updateHandover(req,res){
  const handover=await ShiftHandover.findOne({_id:req.params.handoverId,organization:req.user.organization});if(!handover)return res.status(404).json({message:"Handover not found"});await hotelFor(req,handover.hotel);
  const input=z.object({status:z.enum(["open","in_progress","resolved","closed"]).optional(),priority:z.enum(["low","medium","high","urgent"]).optional(),assignedToId:id.nullish(),description:z.string().min(2).optional()}).parse(req.body);
  if(input.assignedToId)await validateEmployeeHotel(req,input.assignedToId,handover.hotel);const previous=handover.toObject();if(input.status!==undefined){handover.status=input.status;if(input.status==="resolved"||input.status==="closed"){handover.resolvedBy=req.user._id;handover.resolvedAt=new Date()}}if(input.priority!==undefined)handover.priority=input.priority;if(input.assignedToId!==undefined)handover.assignedTo=input.assignedToId||null;if(input.description!==undefined)handover.description=input.description;await handover.save();await writeAudit({req,organization:req.user.organization,user:req.user._id,action:"update",entity:"ShiftHandover",recordId:handover._id.toString(),previousValue:previous,newValue:input});res.json({handover});
}