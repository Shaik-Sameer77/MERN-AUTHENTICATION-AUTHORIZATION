import z from "zod";

export const registerSchema=z.object({
    name:z.string().min(3,"Name must be atleast 3 charcters long"),
    email:z.string().email('Invalid email formate'),
    password:z.string().min(8,"minimum 8 charcters")
})

export const loginSchema=z.object({
    email:z.string().email('Invalid email formate'),
    password:z.string().min(8,"minimum 8 charcters")
})