const express= require('express')
const routes= express.Router()
const file = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
routes.use(express.json())
dotenv.config();

routes.get("/getallusers",(req,res)=>{
    let token = req.headers.token.split(' ')[1]
    try{
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        file.readFile("users.json" , "utf8", (error, data) =>{
        if(error){
            res.send("Something went wrong");
        }
        else{
            const fileJson = JSON.parse(data);
            const index = fileJson.findIndex(v => v.email == user.email);
            fileJson.splice(index, 1);
            for(let i=0;i<fileJson.length;i++){
                delete fileJson[i].password;
            }
            return res.send(fileJson);       
        }
    })

}
    catch(e){
        return res.send({"alert":"Invalid token"})
    }
    
});
routes.get("/user",(req,res)=>{
    let token = req.headers.token.split(' ')[1]
    try{
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        file.readFile("users.json" , "utf8", (error, data) =>{
        if(error){
            res.send("Something went wrong");
        }
        else{
            const fileJson = JSON.parse(data);
            const index = fileJson.findIndex(v => v.email == user.email);
            delete fileJson[index].password;
            return res.send(fileJson[index]);       
        }
    })

}
    catch(e){
        return res.send({"alert":"Invalid token"})
    }
    
});
routes.post("/login",(req,res)=>{
    let { email, password, } = req.body;
     if (!email.length || !password.length) {
        return res.json({ 'alert': 'fill all the inputs' });
    } 
        else if (ValidateEmail(email)) {
            res.json({'alert':'You have entered an invalid email address!'});
        }
        else if (password.length < 8) {
            return res.json({ 'alert': 'password should be 8 letters long' });
        }  
        else{
            file.readFile("users.json", "utf8", (error, data) =>{
        if(error){
            return res.send("Something went wrong");
        }
        else{
            const fileJson=JSON.parse(data);
            const user=fileJson[fileJson.findIndex(p => p.email == email)]
            if(user){
                 bcrypt.compare(password,user.password,(err, result)=>{
                    if(result){
                        let token = jwt.sign( {email:req.body.email} , process.env.JWT_SECRET_KEY, { expiresIn:"10h"})
                        return res.send({Status: " User Logged in Successfully", token:token}); 
                    }
                    else
                    return res.json({'alert':'Password incorrect'});
                });
            }
            else{
                return res.json({'alert':'Email does not exists'});
            }
            

        }
    })}
});
routes.post("/register",(req,res)=>{
    let { name, email, password, number, profilePic } = req.body;
     if (!name.length||!number.length||!email.length || !password.length|| !profilePic.length) {
        return res.json({ 'alert': 'fill all the inputs' });
    } 
        else if (ValidateEmail(email)) {
            res.json({'alert':'You have entered an invalid email address!'});
        }
        else if (password.length < 8) {
            return res.json({ 'alert': 'password should be 8 letters long' });
        }  else if (!Number(number) || number.length < 10) {
            return res.json({ 'alert': 'invalid number, please enter valid one' });
        }
        else
    {file.readFile("users.json", "utf8", (error, data) =>{
        if(error){
            return res.send("Something went wrong");
        }
        else{
            const fileJson=JSON.parse(data);
            if(fileJson.findIndex(p => p.email == email)!=-1){
                return res.json({ 'alert': 'email already exists' });
            }
            bcrypt.genSalt(10,(error,salt)=>{
                bcrypt.hash(password,salt,(err,hash)=>{
                    req.body.password=hash
                    fileJson[fileJson.length]=req.body;
                    file.writeFile("users.json",JSON.stringify(fileJson),Err=>{
                        if(Err)
                        return res.send("Something went wrong");
                        else
                        {   let token = jwt.sign( {email:req.body.email} , process.env.JWT_SECRET_KEY, { expiresIn:"10h"})
                            return res.send({Message:"User Registered Successfully",token:token});
                        }
                    })
                })
            });

        }
    })}
});
routes.put("/editdetails",(req,res)=>{
        let token = req.headers.token.split(' ')[1]
    try{
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        file.readFile("users.json" , "utf8", (error, data) =>{
        if(error){
            res.send("Something went wrong");
        }
        else{
            const fileJson = JSON.parse(data);
            const index = fileJson.findIndex(v => v.email == user.email);
            const newuser=fileJson[index];
            const change=Object.keys(req.body)
            const already=Object.keys(newuser)
            for (const key in change) {
                if(Object.values(already).indexOf(change[key])!=-1)
                {if(change[key].toLowerCase()=="password")
                continue
                else
               newuser[change[key]]=req.body[change[key]]}
            }
            fileJson[index]=newuser
            file.writeFile("users.json",JSON.stringify(fileJson),Err=>{
                        if(Err)
                        return res.send("Something went wrong");
                        else
                        return res.send("Information is successfully updated");
                    })     
        }
    })

}
    catch(e){
        return res.send({"alert":"Invalid token"})
    }
    

})
routes.put("/changepassword",(req,res)=>{
     let { currentpassword, password,confirmpassword } = req.body;
      if (!currentpassword.length || !password.length||!confirmpassword.length) {
        return res.json({ 'alert': 'fill all the inputs' });
    } 
    else if (password.length < 8) {
            return res.json({ 'alert': 'password should be 8 letters long' });
        } 
    else if(confirmpassword!=password){
        return res.json({ 'alert': 'Passwords do not match' });
    }
    else
     { 
    let token = req.headers.token.split(' ')[1]
    try{
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        file.readFile("users.json" , "utf8", (error, data) =>{
        if(error){
            res.send("Something went wrong");
        }
        else{
            const fileJson = JSON.parse(data);
            const index = fileJson.findIndex(v => v.email == user.email);
             bcrypt.compare(currentpassword,fileJson[index].password,(err, result)=>{
                    if(result){
                        bcrypt.genSalt(10,(error,salt)=>{
                            bcrypt.hash(password,salt,(err,hash)=>{
                                    fileJson[index].password=hash;
                                file.writeFile("users.json",JSON.stringify(fileJson),Err=>{
                                    if(Err)
                                    return res.send("Something went wrong");
                                    else
                                    return res.send("Password Changed Successfully");
                                })
                             })
                        });
                    }
                    else
                    return res.json({'alert':'Current Password is incorrect'});
                });
              
        }
    })

}
    catch(e){
        return res.send({"alert":"Invalid token"})
    }}
    
})


function ValidateEmail(inputText) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
        return false;
    }
    else {
        return true;
    }
}
module.exports=routes
