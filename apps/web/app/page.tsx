"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home()
{
  const [room,setroom]=useState("");
  const router=useRouter()
  return <div>
    <input type="text" name="" id="" value={room} onChange={(e)=>{
      setroom(e.target.value)
    }}/>
    <button onClick={()=>
      {router.push(`/rooms/${room}`)}
    }>JOIN_ROOM</button>
  </div>
}