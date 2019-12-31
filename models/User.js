const mongoose = require('mongoose');

const userShema = new mongoose.Schema({
    name:{type:String,required:true,min:2},
    email:{type:String,required:true,min:6,max:100},
    password:{type:String,required:true,max:1000,min:6},
    date:{type:Date,default:Date.now}
});


module.exports = mongoose.model('User',userShema)