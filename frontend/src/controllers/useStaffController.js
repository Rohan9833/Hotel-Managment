import {useCallback,useEffect,useState} from "react";
import {staffModel} from "../models/staffModel";
export function useStaffController(hotels,user){
 const [hotelId,setHotelId]=useState(hotels[0]?._id||"");
 const [departments,setDepartments]=useState([]),[employees,setEmployees]=useState([]),[attendance,setAttendance]=useState([]),[shifts,setShifts]=useState([]),[assignments,setAssignments]=useState([]),[handovers,setHandovers]=useState([]);
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const permissions=user?.permissions||[];const can=p=>permissions.includes(p);
 useEffect(()=>{if(!hotelId&&hotels[0])setHotelId(hotels[0]._id)},[hotels,hotelId]);
 const load=useCallback(async()=>{if(!user)return;setLoading(true);try{
   const jobs=[can("department.view")?staffModel.departments():Promise.resolve({departments:[]})];
   if(hotelId){jobs.push(can("employee.view")?staffModel.employees(hotelId):Promise.resolve({employees:[]}),can("attendance.view")?staffModel.attendance(hotelId,new Date().toISOString().slice(0,10)):Promise.resolve({attendance:[]}),can("shift.view")?staffModel.shifts(hotelId):Promise.resolve({shifts:[]}),can("shift-assignment.view")?staffModel.assignments(hotelId,new Date().toISOString().slice(0,10)):Promise.resolve({assignments:[]}),can("handover.view")?staffModel.handovers(hotelId):Promise.resolve({handovers:[]}));}
   const [d,e,a,s,as,h]=await Promise.all(jobs);setDepartments(d.departments);setEmployees(e?.employees||[]);setAttendance(a?.attendance||[]);setShifts(s?.shifts||[]);setAssignments(as?.assignments||[]);setHandovers(h?.handovers||[]);setError("");
 }catch(e){setError(e.message)}finally{setLoading(false)}},[hotelId,user]);
 useEffect(()=>{load()},[load]);
 const createDepartment=async data=>{await staffModel.createDepartment(data);await load()};
 const createEmployee=async data=>{await staffModel.createEmployee({...data,hotelId});await load()};
 const saveAttendance=async data=>{await staffModel.saveAttendance({...data,hotelId});await load()};
 const createShift=async data=>{await staffModel.createShift({...data,hotelId});await load()};
 const createAssignment=async data=>{await staffModel.createAssignment({...data,hotelId});await load()};
 const updateAssignment=async(id,data)=>{await staffModel.updateAssignment(id,data);await load()};
 const replaceAssignment=async(id,data)=>{await staffModel.replaceAssignment(id,data);await load()};
 const createHandover=async data=>{await staffModel.createHandover({...data,hotelId});await load()};
 const updateHandover=async(id,data)=>{await staffModel.updateHandover(id,data);await load()};
 return{hotelId,setHotelId,departments,employees,attendance,shifts,assignments,handovers,loading,error,can,createDepartment,createEmployee,saveAttendance,createShift,createAssignment,updateAssignment,replaceAssignment,createHandover,updateHandover,reload:load};
}