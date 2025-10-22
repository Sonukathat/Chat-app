import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import userRoute from './routes/userRoutes.js'

dotenv.config();
const app = express();

connectDB();

app.use('/api/user',userRoute)

const PORT = process.env.PORT;

// app.get('/',(req,res)=>{
//   res.send("hello......");
// })

app.listen(PORT,()=>{
    console.log(`server runnig on ${PORT}`)
})
