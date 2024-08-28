const jwt = require('jsonwebtoken');
const DB = require('./db')
const verifytoken = async(req , res , next) => {
    try {
         let user_token = req.headers['auth_token'];
         if(!user_token){
            return res.status(400).send({message : "Token is not Provided"})
         }

         let decode = await jwt.verify(user_token , 'suzair');
         if(!decode){
            return res.status(400).send({message : "Token is expired"})
         }

         let find_user = await DB.findOne({_id : decode});
         req.userdata = find_user
         req.userid = find_user._id

         next();

    } catch (error) {
        res.status(400).send({message : "invalid error" , data : error})
    }
}

module.exports =  verifytoken;