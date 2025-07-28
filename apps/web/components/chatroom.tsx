import axios from "axios";
import { BACKEND_URL } from "../app/config";

export  default async function chatroom({id}:{id:number})
{
    const messages=await axios.get(`${BACKEND_URL}/chats/${id}`)
} 