const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const path = require('path');

const connectDB = require('./server/database/connection');

const app = express();

dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 8080

let dbo;
let connectionString = 'mongodb://localhost:27017';

const mongodb = require('mongodb');

mongodb.connect (
    connectionString,
    { useNewUrlParser: true, useUnifiedTopology: true},
    function (err, client) {
        if (err) throw err;
        dbo = client.db("Loginuser");
        console.log("mongodb connected!");
    }
);

// log requests
app.use(morgan('tiny'));

// mongodb connection
connectDB();

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended : true}))

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

app.use('/assets', express.static('assets'));

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))

// login
app.use('/login',(req, res)=> {
    res.sendFile(__dirname + '/login.html')
})

// sign up
app.use('/signup',(req, res)=> {
    res.sendFile(__dirname + '/signup.html')
})

app.post('/logincheck',(req, res) => {
 var user = req.body.login;
 var pwd =  req.body.password;

 var query = {"login":user, "pwd": pwd };

 dbo.collection("userdbs").find(query).toArray(function(err,result){
     if (err) throw err;
     console.log("1 record retrieved!");
     console.log(JSON.stringify(result));
     if (result.length > 0) {
        res.write("login_ok");
     }
     else {
        res.write("login_fail");
     }
     res.end();
 });

});

//sign up

app.post('/signupcheck',(req, res) => {
    var user = req.body.login;
    var pwd =  req.body.password;
   
    var query = {"login":user, "pwd": pwd };
   
    dbo.collection("userdbs").insertOne(query, function(err,result){
        if (err) throw err;
        console.log("sign up sucessed!");
        console.log(JSON.stringify(result.ops[0]));
        if (result.ops) {
           res.write("signup_ok");
        }
        else {
           res.write("login_fail");
        }
        res.end();
    });
   
   });

// load routers
app.use('/', require('./server/routes/router'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});