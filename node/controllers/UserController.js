
const asynchandler = require('express-async-handler');
const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findById } = require('./../models/UserModel');
const crypto = require('crypto');
const Token = require('./../models/tokenModel');
//const sendEmail = require('../utils/sendEmail');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
}
//register user
const registerUser = asynchandler(async (req, res) => {
    const { name, email, password } = req.body;
    const credits = 0;


    //validation 
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    //check if user email is already registered
    const userExist = await User.findOne({ email: email });
    if (userExist) {
        res.status(400);
        throw new Error("email already registered");
    }

    //Create a new user
    const user = await User.create({ name, email, password,credits });
    ///genrate token
    const token = generateToken(user._id)
    //console.log(token);
    //send HTTP cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure: true
    });
    if (user) {
        const { _id, name, email } = user;
        res.status(201).json({
            _id, name, email, credits

        })
    } else {
        res.status(400);
        throw new Error("invalid user data ");
    }
});
//logout user

const logout= asynchandler(async(req,res)=>{
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    });
    return res.status(200).json({message:"succefully logged out"});
    });


//login user
const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    //validate request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter a valid email and password");
    }
    ///check if user exists
    const user = await User.findOne({ email })
    if (!user) {
        res.status(400);
        throw new Error("User not found please sign up");
    }
    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (user && passwordIsCorrect) {
        const { _id, name, email, credits } = user;
        ///genrate token
        const token = generateToken(user._id)

        //send HTTP cookie 
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),
            sameSite: "none",
            secure: true
        });
        res.status(200).json({
            _id, name, email,credits, token

        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

// get user data
const getUser = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { _id, name, email, credits } = user;
        res.status(200).json({
            _id, name, email,credits

        })
    } else {
        res.status(400);
        throw new Error("User not found ");
    }
})
const addCredits = asynchandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    if(user){
        const {credits} = user;
    }
})
// get logged in Status
const loginStatus=asynchandler(async (req, res) => {
    const token= req.cookies.token;
    if (!token) {
        return res.json(false);
    }
    const verified = jwt.verify(token,process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }else{
        return res.json(false)
    }
});

//update user profile

const updateUser =asynchandler( async (req, res) => {
    const user=await User.findById(req.user._id);
    if(user){
        const { name, email} = user;
        
        user.name=req.body.name || name;
        user.email = email ;
       


        const updatedUser = await user.save();
        res.status(200).json({ 
            _id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            
        })
    }

    else{
        res.status(400);
        throw new Error ("User not found");
    }
});
// update Password
const updatePassword = asynchandler(async(req,res)=>{
    const user=await User.findById(req.user._id);
    const {oldPassword,password} =req.body;

    if(!user){
        res.status(400);
        throw new Error("user not found");
    }
    //validate

    if(!oldPassword || !password){
        res.status(400);
        throw new Error("Please add old and new password");
    }
    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
    if ( passwordIsCorrect){
        user.password = password;
        await user.save();
        res.status(200).send("Password changed succ");
    }
    else{
        res.status(400);
        throw new Error("Old password is incorrect");
    }

})
//reset password and update
const forgotpassword =asynchandler(async (req,res)=>{
    const {email}=req.body;
    const user = await User.findOne({email});
    if (!user){
        res.status(404);
        throw new Error("User not found");
    }

//Delete token if it exists
    let token = await Token.findOne({userId: user.id});
    if (token){
        await Token.deleteOne()
    }

    // create reset token
    let resetToken = crypto.randomBytes(32).toString("hex")+ user._id;
    console.log(resetToken);
    //hash token

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    //save reset token 
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt:  Date.now(),
        expiresAt:  Date.now()+1800000 ,// noss se3a
    }).save();
    // Reset URL
    const resetUrl = process.env.FRONTEND_URL+'resetpassword/'+resetToken

    //send reset Email
const message='<h2> Hello! '+user.name+' </h2> <p> Please use this url to reset your password </p><p>btw it is valid for only 30 mn.</p> <a href='+resetUrl+' clicktracking=off>'+resetUrl+'</a> <p> Regards ...</p><p>StockBillsApp</p>';
const subject="Password Reset Request";
const to=user.email;
const from=process.env.EMAIL_USER;
try {
    await sendEmail(subject, message,to,from)
    res.status(200).json({success: true,message: "Reset Email sent Successfully"});
}catch(e){
    res.status(500)
    throw new Error("email not sent try again");
}
});
// Reset password
const resetPassword=asynchandler(async (req,res) =>{
    const {password}=req.body;
    const {resetToken}=req.params
    //hash token to compare 
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    // look for token in db
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt:Date.now()}

    })
    if (!userToken ){
        res.status(404);
        throw new Error("Invalid or expired token");
    }
// look for the user 
const user = await User.findOne({_id: userToken.userId})
user.password = password;
await user.save();

res.status(200).json({
    message: "Password changed successfully"
});
await Token.deleteOne()
})


module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    updatePassword,
    forgotpassword,
    resetPassword
}