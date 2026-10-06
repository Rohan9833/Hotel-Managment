import {useCallback,useEffect,useState} from "react";
import {operationsModel} from "../models/operationsModel";
export function useOperationsController(hotels,user){
 const [hotelId,setHotelId]=useState(hotels[0]?._id||""),[date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [dashboard,setDashboard]=useState(null),[report,setReport]=useState(null),[reports,setReports]=useState([]),[exceptions,setExceptions]=useState([]),[groupSummary,setGroupSummary]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const permissions=user?.permissions||[];const can=p=>permissions.includes(p);
 useEffect(()=>{if(!hotelId&&hotels[0])setHotelId(hotels[0]._id)},[hotels,hotelId]);
 const load=useCallback(async()=>{if(!hotelId||!user)return;setLoading(true);try{
   const [d,r,e,history,g]=await Promise.all([
    can("operations.dashboard.view")?operationsModel.dashboard(hotelId,date):Promise.resolve({dashboard:null}),
    can("operations.report.view")?operationsModel.report(hotelId,date):Promise.resolve({report:null}),
    can("operations.exceptions.view")?operationsModel.exceptions(hotelId,date):Promise.resolve({exceptions:[]}),
    can("operations.report.view")?operationsModel.reports(hotelId):Promise.resolve({reports:[]}),
    can("operations.group.view")?operationsModel.groupSummary():Promise.resolve({groupSummary:null})
   ]);
   setDashboard(d.dashboard);setReport(r.report);setExceptions(e.exceptions||[]);setReports(history.reports||[]);setGroupSummary(g.totalHotels!==undefined?g:null);setError("");
 }catch(e){setError(e.message)}finally{setLoading(false)}},[hotelId,date,user]);
 useEffect(()=>{load()},[load]);
 const submitReport=async data=>{await operationsModel.submitReport({...data,hotelId,businessDate:date});await load()};
 return{hotelId,setHotelId,date,setDate,dashboard,report,reports,exceptions,groupSummary,loading,error,can,submitReport,reload:load};
}