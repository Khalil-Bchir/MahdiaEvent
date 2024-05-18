const asynchandler = require('express-async-handler');
const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');

const protect =asynchandler(async(req,res,next)=>{
    try {
        const token= req.cookies.token
        if (!token){
            res.status(401)
            throw new Error("Not authorized Please login");
        }
        //verify token
         const verified = jwt.verify(token,process.env.JWT_SECRET);
         //get the user id from the token
         const user = await User.findById(verified.id).select("-password");

         if(!user){
            res.status(401)
            throw new Error("user not found");
         }
         req.user = user;
         next();
    }catch(error){
        res.status(401)
        throw new Error("Not authorized Please login");
}});
module.exports=protect;