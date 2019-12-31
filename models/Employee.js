const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
       name:{type:Number},
       image:{type:String}
      });

module.exports = mongoose.model('emp',employeeSchema);