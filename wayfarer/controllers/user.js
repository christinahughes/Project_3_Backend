var express = require('express');
var router = express.Router();
var auth   = require('../modules/auth');
var db       = require('../models');
var bcrypt     = require('bcryptjs');



router.get('/', function(req, res, next) {   
  res.render('index', { title: 'this is user js' });
});
router.post('/login', function(req, res) {   
    
    var username = req.body.username;
    var password = req.body.password;
    
    auth.validateLogin(username,password,function(err,data){
        if(err){
            if(err==='invalidUsername' || err==='invalidPassword'){
                res.json({"message":"invalid username or password","status":false})
            }
            else{
                res.status(500).json({"message":"invalid username or password","status":false})
            }
        }
        else{
            res.set({
                
            }).json({"message":"login successful", "status":true,'token': auth.genToken(data._id)})
        }
        
    });
});
router.post('/signup', function(req, res) {   
       
    var username = req.body.username;
    var password = req.body.password;
    var conPassword = req.body.conpassword;
   
    if(password  !== conPassword){
        res.json({"message":"Password not match with Conform Password","status":false})
    }
    else{
        bcrypt.hash(password, 8, function(err, hash) {
            if(err){
                
                res.status(500).json({"message":"password error found","status":false});
            }
            else{
               
                db.users.create({
                    username:username,
                    date: new Date (),
                    password:hash,
                    profilePic:'none'
                 }, function (err, data) {
                   if(err){
                    res.status(500).json({"message":err,"status":false});
                   }
                   else{
                        res.json({"message":"Login sucessfully","status":true});
                        
                   }
                });
            }
        }); 
    }  
});
router.put('/edit/:type',function(req,res){
    var types = ['fullname','city'];
    var paramData = req.params.type;
    var token = req.body.token
 
    auth.getIdFromToken(token, (err,data)=>{
        
        if(err){
            res.status(500).json({"message":"Invalid token"});
        }
        else{
            var indx = types.indexOf(paramData);
            if(indx === -1){
                res.status(500).json({"message":"invalid request","status":false});
            }else{
                var updateValue = '';
                if(paramData ==='fullname'){
                    updateValue = req.body.fullname;
                }
                else{
                    updateValue  = req.body.city;
                }
                updateData = {};
                updateData[types[indx]] = updateValue;
                db.users.findOneAndUpdate({_id:data.data},updateData,(err,updates)=>{
                    if(err){
                        res.json({"message":"error in updates","status":false})
                    }
                    else{
                        res.json({"message":"update sucesfull","status":true})
                    }
                })
            }
        }
        
    });
});
router.get('/post/:id', function(req,res){
    db.posts.find({userid: req.params.id }).exec(function(err, data){
      if(err){
        res.json({"error":err})
      }else{
        const posts = data.map((post, index)=>{
          return {
            "cityid": post.cityid,
          "title": post.title,
          "body": post.body,
          "image": post.pic}
            
          
        
        })
        res.json(posts)
        }
      })
    })
    router.post('/profile',function(req,res){
        var token = req.body.token;
        auth.getIdFromToken(token, (err,data)=>{
            if(err){
                res.json({
                    "message":"Internal server error",
                    "status":false
                })
            }
            else{
                db.users.findOne({_id:data.data},function(err,userdata){
                    console.log(userdata)
                    if(err){
                        res.json({
                            "message":"invalid query",
                            "status":false
                        })
                    }else{
                        res.json({
                            "data":{
                                "fullname":userdata.fullname,
                                "profilePic":userdata.profilePic,
                                "city": userdata.city,
                                "date":userdata.date,
                            },
                            "status":true
                        })
                    }
                });
            }
     
        });
     });

module.exports = router;
