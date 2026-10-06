import axios from "axios";
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://localhost:5000/api/v1",withCredentials:true,headers:{"Content-Type":"application/json"}});
export async function request(promise){try{return (await promise).data}catch(error){throw new Error(error.response?.data?.message||"Request failed")}}