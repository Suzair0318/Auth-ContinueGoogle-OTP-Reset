const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const body_parser = require('body-parser')
require('./connections.js')
const DB = require('./db.js')
const verifytoken = require('./middlewares');
const otp = require('otp-generator');
const { oauth2client } = require('./googleConfig.js');
const axios = require('axios')
const fs = require('fs');


const corsOption = {
    credentials : true,
    origin: '*'
}
 
app.use(cors(corsOption));
app.use(express.json());
app.use(body_parser.json());
app.post('/register' , async(req , res) => {
   try {
      let {username , email , password} = req.body

      let findalready = await DB.find({email : email});
      if(findalready){
          res.status(400).send({message : "Email Alredy Exist"})
      }
      let hash_pass = bcrypt.hashSync(password , 1);  git 
      let save_user = await new DB({username :  username ,email : email,password : hash_pass})
      let a = await save_user.save() 
      res.status(200).send({message : "User Register succesfull"})
   } catch (error) { 
     console.log(error)
     res.status(400).send(error)
   }
})

app.post('/login' ,  async(req , res) => {
    try {
        let {email , password} = req.body;
        let find_user = await DB.findOne({email : email});
        console.log(find_user)
        if(!find_user){
            res.status(400).send({message : "User not Found"})
        }
        let compare_pass = await bcrypt.compare( password , find_user.password)
        if(!compare_pass){
            return res.status(400).send({message : "Password is incorrect"})
        } 
        let token = await jwt.sign({_id : find_user._id} , 'suzair');
        
        
        res.status(200).send({message : "User login succesfull" , auth_token : token})
    
    } catch (error) {
        res.status(400).send({message : "Ceitical error" , data : error})
        console.log(error)
    }
})

app.post('/verify_token' , verifytoken ,  async(req , res) => {
       try {
            let user = req.userdata;
            res.status(200).send({message : "Token Verified" , data : user })
       } catch (error) {
        res.status(400).send({message : error})
       }
})

app.get('/auth/google' , async( req , res) => {
      try{
            const {code} = req.query;
            const getgoogletoken = await oauth2client.getToken(code);
           
            await oauth2client.setCredentials(getgoogletoken.tokens);
            
            const getgoogleprpfile = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${getgoogletoken.tokens.access_token}`)
               
            const { name , email , picture} = getgoogleprpfile.data;
           
            let finduser = await DB.findOne({email : email});
            if(!finduser){
                 finduser = await new DB({
                     username : name,
                     email : email
                 });

                 await finduser.save();
            }
            const {_id} = finduser;
            let token = await jwt.sign({_id : _id} , 'suzair');
             res.status(200).send({auth_token: token , client : finduser })
            }
            catch(error){
                console.log(error)
                res.status(400).send("Kuch asla o gya") 
            }
})

app.post('/checkemail' , async(req , res) => {
     try {
         let  {email} = req.body;
         
         let findemail = await DB.findOne({email : email});
        
          fs.writeFileSync('user.txt' , findemail.email);
         
          if(!findemail){
            return  res.status(400).send({message : 'email not found'})
          }

            const otpnum = otp.generate(4 , {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets : false,
                digits : true
              })

              fs.writeFileSync('OTP.txt' , otpnum)
            
              res.status(200).send({message : "OTP is Send to Your Email" , otp : otpnum})
          
          
        
     } catch (error) {
        console.log(error)
        res.status(400).send({message : 'email not found'})
     }
})

app.post('/checkotp/:num' , async(req , res) => {
    try {
       let {num} = req.params
      let read = fs.readFileSync('OTP.txt').toString();
       if(num !== read){
         return    res.status(400).send({message : "OTP does not Match"})
       }

      res.status(200).send({messsage : "OTP is Verified" })

    } catch (error) {
       console.log(error)
       res.status(400).send({message : 'OTP galt hy '})
    }
})

app.put('/reset/:pass' , async(req , res) => {
    try {
       let {pass} = req.params
      let read = fs.readFileSync('user.txt').toString();
      let findemail = await DB.findOne({email : read});
      let reset = await DB.findByIdAndUpdate({_id : findemail._id} , {
        $set : {
            password : bcrypt.hashSync(pass , 1)
        }
      });
      
      if(!reset){
        return res.status(400).send({message : "user not fiund"})
      }

      res.status(200).send({messsage : "Password is reset" })

    } catch (error) {
       console.log(error)
       res.status(400).send({message : 'masla hy'})
    }
})





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
