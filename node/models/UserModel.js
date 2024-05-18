const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
    name:{
        type : String,
        required: [true,"Please enter a name"]
    },
    email:{
        type : String,
        required: [true,"Please enter an email"],
        unique : true,
        trim : true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email address"
        ]

    },
    password:{
        type : String,
        required: [true,"Please enter a password"],
        minLength: [6,"Password must have more than 6 characters"]
    },
    credits:{
        type : Number,
        required:[true,"Error Initiating the Credits"],
    }
},
{
    timestamps: true,
});

////Encrypt password

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    //hash the password
    const salt=await bcrypt.genSalt(15);
    const hashedPassword=await bcrypt.hash(this.password,salt);
    this.password=hashedPassword;
    next();
})

const User = mongoose.model("User",userSchema);
module.exports = User;