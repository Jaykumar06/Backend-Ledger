const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required:[true ,"Email is required for creatong a user"],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"inavlid email"],
        unique:[true, "email already existed"]
    },
    name:{
        type:String,
        required: [true," name is required"],
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6, "minlength of password must be more than 6"],
        select: false
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
},{
    timestamps: true
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password= hash

    return
})

userSchema.methods.comparePassword = async function(password) {
   return  await bcrypt.compare(password, this.password)
    
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel