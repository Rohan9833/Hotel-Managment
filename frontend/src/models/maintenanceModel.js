import {api,request} from "../services/api";
export const maintenanceModel={
 dashboard:hotelId=>request(api.get("/maintenance/dashboard",{params:{hotelId}})),
 issues:(hotelId,status)=>request(api.get("/maintenance/issues",{params:{hotelId,...(status?{status}:{})}})),
 createIssue:data=>request(api.post("/maintenance/issues",data)),
 updateIssue:(id,data)=>request(api.patch("/maintenance/issues/"+id,data)),
 schedules:hotelId=>request(api.get("/maintenance/preventive",{params:{hotelId}})),
 createSchedule:data=>request(api.post("/maintenance/preventive",data)),
 updateSchedule:(id,data)=>request(api.patch("/maintenance/preventive/"+id,data))
};