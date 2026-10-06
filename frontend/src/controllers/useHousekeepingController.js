import {useCallback,useEffect,useState} from "react";import {housekeepingModel} from "../models/housekeepingModel";
export function useHousekeepingController(hotels,user){
 const [hotelId,setHotelId]=useState(hotels[0]?._id||""),[rooms,setRooms]=useState([]),[tasks,setTasks]=useState([]),[checklists,setChecklists]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const permissions=user?.permissions||[];const can=p=>permissions.includes(p);
 useEffect(()=>{if(!hotelId&&hotels[0])setHotelId(hotels[0]._id)},[hotels,hotelId]);
 const load=useCallback(async()=>{if(!hotelId)return;setLoading(true);try{const [b,t,c]=await Promise.all([can("housekeeping.board.view")?housekeepingModel.board(hotelId):{rooms:[],tasks:[]},can("housekeeping.task.view")?housekeepingModel.tasks(hotelId):{tasks:[]},can("housekeeping.checklist.view")?housekeepingModel.checklists(hotelId):{checklists:[]}]);setRooms(b.rooms||[]);setTasks(t.tasks||b.tasks||[]);setChecklists(c.checklists||[]);setError("")}catch(e){setError(e.message)}finally{setLoading(false)}},[hotelId,user]);
 useEffect(()=>{load()},[load]);
 const createTask=async data=>{await housekeepingModel.createTask({...data,hotelId});await load()};
 const updateTask=async(id,data)=>{await housekeepingModel.updateTask(id,data);await load()};
 const checklistItem=async(id,index,completed)=>{await housekeepingModel.checklistItem(id,{index,completed});await load()};
 const createChecklist=async data=>{await housekeepingModel.createChecklist({...data,hotelId});await load()};
 return{hotelId,setHotelId,rooms,tasks,checklists,loading,error,can,createTask,updateTask,checklistItem,createChecklist,reload:load};
}