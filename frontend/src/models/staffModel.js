import {api,request} from "../services/api";
export const staffModel={
 departments:()=>request(api.get("/staff/departments")),
 createDepartment:data=>request(api.post("/staff/departments",data)),
 employees:hotelId=>request(api.get("/staff/employees",{params:{hotelId}})),
 createEmployee:data=>request(api.post("/staff/employees",data)),
 updateEmployee:(id,data)=>request(api.patch("/staff/employees/"+id,data)),
 attendance:(hotelId,date)=>request(api.get("/staff/attendance",{params:{hotelId,date}})),
 saveAttendance:data=>request(api.post("/staff/attendance",data)),
 shifts:hotelId=>request(api.get("/staff/shifts",{params:{hotelId}})),
 createShift:data=>request(api.post("/staff/shifts",data)),
 updateShift:(id,data)=>request(api.patch("/staff/shifts/"+id,data)),
 assignments:(hotelId,date)=>request(api.get("/staff/assignments",{params:{hotelId,date}})),
 createAssignment:data=>request(api.post("/staff/assignments",data)),
 updateAssignment:(id,data)=>request(api.patch("/staff/assignments/"+id,data)),
 replaceAssignment:(id,data)=>request(api.post("/staff/assignments/"+id+"/replace",data)),
 handovers:(hotelId,status)=>request(api.get("/staff/handovers",{params:{hotelId,status}})),
 createHandover:data=>request(api.post("/staff/handovers",data)),
 updateHandover:(id,data)=>request(api.patch("/staff/handovers/"+id,data))
};