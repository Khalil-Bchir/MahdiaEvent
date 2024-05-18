const express = require('express');
const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, updatePassword, forgotpassword, resetPassword } = require('../controllers/userController');
const protect = require('../middleware/AuthMiddleware');
const router = express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logout);
router.get("/getuser",protect,getUser);
router.get("/loggedin",loginStatus);
router.patch("/updateUser",protect,updateUser);
//router.patch("/changePassword",protect,updatePassword);
//router.post("/forgotpassword",forgotpassword);
//router.put("/resetpassword/:resetToken",resetPassword);


module.exports = router;