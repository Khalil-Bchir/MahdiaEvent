const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/UserRoute");
const cookieParser = require("cookie-parser");

const app=express();
app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL,
}));


//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser())

//routes :
app.use("/api/users",userRoute)




//Connect to DB and start server
const PORT= process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,()=>{
        console.log("server started on port " + PORT);
        })
    })
    .catch((err)=>console.log(err));