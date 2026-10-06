import {api,request} from "../services/api";
export const housekeepingModel={
 checklists:hotelId=>request(api.get("/housekeeping/checklists",{params:{hotelId}})),
 createChecklist:data=>request(api.post("/housekeeping/checklists",data)),
 board:hotelId=>request(api.get("/housekeeping/board",{params:{hotelId}})),
 tasks:(hotelId,status)=>request(api.get("/housekeeping/tasks",{params:{hotelId,...(status?{status}:{})}})),
 createTask:data=>request(api.post("/housekeeping/tasks",data)),
 updateTask:(id,data)=>request(api.patch("/housekeeping/tasks/"+id,data)),
 checklistItem:(id,data)=>request(api.patch("/housekeeping/tasks/"+id+"/checklist",data))
};