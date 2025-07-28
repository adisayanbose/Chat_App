import axios from "axios"

export default async function Home({params}:{params:Promise<{
    slug:string
}>}){
    
    const {slug}=await params
    const room=await axios.get(`http://localhost:8000/room/${slug}`)
    console.log(slug)
    return <div>
        hello world {JSON.stringify(room.data.room)}
    </div>
}