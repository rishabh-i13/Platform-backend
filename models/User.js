const mongoose=require('mongoose');

const UserSchema= new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true,
        unique:true,
        min:5
    },
    password:{
        type:String,
        require:true
    }
})

const User = new mongoose.model("User", UserSchema);
module.exports=User;