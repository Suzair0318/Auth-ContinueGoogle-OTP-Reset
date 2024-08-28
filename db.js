const mongoose  = require('mongoose');

const MongoDB = new mongoose.Schema({
       username : {
         type : String,
         require : true
       },
       email : {
          type : String,
          require : true
       },
       password : {
          type : String,
       }
})

const DB = mongoose.model('User' , MongoDB);

module.exports = DB