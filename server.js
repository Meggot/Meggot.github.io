var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var pather = require('path');
var path = __dirname + '/views/';

//Get BODYPARSER for POST requests.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/index",function(req,res){
  res.sendFile(path + "index.html");
});



router.get("/portfolio",function(req,res){
  res.sendFile(path + "portfolio.html");
});

router.get("/blog",function(req,res){
  res.sendFile(path + "blog.html");
});

app.use("/static", express.static(__dirname + '/static'));

router.get("/images/cthulu.png", function(req,res) {
    res.sendFile(path+ "/images/cthulu.png");
});

router.get("/api", function(req,res) {
    res.json({ message: 'Hi, i spy with my API..'
    });
});
    
app.use("/",router);

app.use('/api', router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});