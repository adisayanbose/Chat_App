import {z} from "zod";

export const createroomschema=z.object({
    name:z.string().min(3,"too small").max(20,"too large")
})