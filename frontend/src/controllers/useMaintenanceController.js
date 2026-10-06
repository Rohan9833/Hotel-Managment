import {useCallback,useEffect,useState} from "react";import {maintenanceModel} from "../models/maintenanceModel";
export function useMaintenanceController(hotels,user){
 const [hotelId,setHotelId]=useState(hotels[0]?._id||""),[issues,setIssues]=useState([]),[schedules,setSchedules]=useState([]),[dashboard,setDashboard]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const permissions=user?.permissions||[];const can=p=>permissions.includes(p);
 useEffect(()=>{if(!hotelId&&hotels[0])setHotelId(hotels[0]._id)},[hotels,hotelId]);
 const load=useCallback(async()=>{if(!hotelId)return;setLoading(true);try{const [d,i,s]=await Promise.all([can("maintenance.dashboard.view")?maintenanceModel.dashboard(hotelId):{open:0,urgent:0,overdue:0},can("maintenance.issue.view")?maintenanceModel.issues(hotelId):{issues:[]},can("maintenance.preventive.view")?maintenanceModel.schedules(hotelId):{schedules:[]}]);setDashboard(d);setIssues(i.issues||[]);setSchedules(s.schedules||[]);setError("")}catch(e){setError(e.message)}finally{setLoading(false)}},[hotelId,user]);
 useEffect(()=>{load()},[load]);
 const createIssue=async data=>{await maintenanceModel.createIssue({...data,hotelId});await load()};
 const updateIssue=async(id,data)=>{await maintenanceModel.updateIssue(id,data);await load()};
 const createSchedule=async data=>{await maintenanceModel.createSchedule({...data,hotelId});await load()};
 const updateSchedule=async(id,data)=>{await maintenanceModel.updateSchedule(id,data);await load()};
 return{hotelId,setHotelId,issues,schedules,dashboard,loading,error,can,createIssue,updateIssue,createSchedule,updateSchedule,reload:load};
}