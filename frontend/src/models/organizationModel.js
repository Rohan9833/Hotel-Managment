import {api,request} from "../services/api";
export const organizationModel={get:()=>request(api.get("/organization")),update:(data)=>request(api.patch("/organization",data))};