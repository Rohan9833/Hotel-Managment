import {api,request} from "../services/api";
export const operationsModel={
 dashboard:(hotelId,date)=>request(api.get("/operations/dashboard",{params:{hotelId,date}})),
 report:(hotelId,date)=>request(api.get("/operations/report",{params:{hotelId,date}})),
 reports:hotelId=>request(api.get("/operations/reports",{params:{hotelId}})),
 submitReport:data=>request(api.post("/operations/report",data)),
 exceptions:(hotelId,date)=>request(api.get("/operations/exceptions",{params:{hotelId,date}})),
 groupSummary:()=>request(api.get("/operations/group-summary"))
};