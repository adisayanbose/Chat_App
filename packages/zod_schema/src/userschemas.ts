import {email, z} from "zod"
export const usersignupschema=z.object({
    email:z.email("email required"),
    firstname:z.string("first name required").min(3,"too shot").max(20,"too large"),
    lastname:z.string("last name required").min(3,"too short").max(15,"too large"),
    password:z.string("password required").min(3,"too short").max(8,"too large"),
    photo:z.string().optional()
})
export const usersigninschema=z.object({
    email:z.email(),
    password:z.string().min(3,"too short").max(8,"too long")
})