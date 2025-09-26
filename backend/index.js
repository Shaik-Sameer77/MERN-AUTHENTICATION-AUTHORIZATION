import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectToDB from "./database/db.js";
import userRouter from "./routes/user-routes.js";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";

await connectToDB();

const redisUrl = process.env.REDIS_URL;
// console.log(redisUrl,"redisurl")
if (!redisUrl) {
  console.log("missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});
// console.log(redisClient)
redisClient
  .connect()
  .then(() => {
    console.log("connect to redis");
  })
  .catch(console.error);

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

//routes
app.use("/api/user", userRouter);

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`server is running at port ${PORT}`);
// });

export default app
