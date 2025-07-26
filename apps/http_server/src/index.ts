import express from "express"
import bcrypt from "bcrypt"
import {  prismaclient } from "@repo/database/client"
import {usersignupschema} from "@repo/zod_schema/users"
import { email, parse } from "zod";
const app=express();
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({
        message:"home api"
    })
})

app.post("/signup",async (req,res)=>{

    const parsedbody=usersignupschema.safeParse(req.body)
    if(!parsedbody.success)
    {
        res.json({
            message:"incomplete details",
            errors:parsedbody.error
        })
        return
    }
    else{
        const userexists=await prismaclient.user.findFirst({
            where:{
                email:parsedbody.data.email
            }
        })
        if(userexists){
            res.json({
                message:"user already exists with",
                email:parsedbody.data.email
            })
            return
        }
        const hashedpassword=await bcrypt.hash(parsedbody.data.password,10)
        const user = await prismaclient.user.create({
            data:{
                email:parsedbody.data.email,
                firstname:parsedbody.data.firstname,
                lastname:parsedbody.data.lastname,
                password:hashedpassword,
                photo:parsedbody.data?.photo
            }
        })
        res.json({
            messaage:"user created",
            userdetails:user
        })
    }
})

app.post("/signin",(req,res)=>{
    
    res.json({
        message:"signin endpoint"
    })
})

app.post("/create-room",(req,res)=>{
    res.json({
        message:"create-room endpoint"
    })
})

app.listen(8000,()=>{
    console.log("http server on port 8000")
})