const express = require("express");
const fs = require('fs');

const DBManager = require('./utils/LowDB');

const app = express();

const host = "localhost";
const port = "8000";

app.set("port",process.env.PORT||port);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let DB;
DBManager.create().then((list) => {DB = list});


app.post('/admin',(req,res) => {
    DB.addBot(req.body.botname,req.body.botbrain).then(()=>{
        res.status(200).send('ajout fait');
    });
})

app.delete('/admin/:botname',(req,res) => {
    DB.removeBot(req.params.botname).then(()=>{
        res.status(200).send('suppression faite');
    });
})

app.put('/admin/:botname/:brain',(req,res) => {
    DB.updateBot(req.params.botname,req.params.brain).then(()=>{
        res.status(200).send('modification faite');
    });
})


app.get('/joinchat/:botname',(req,res) => {
    let botbrain = DB.getBotbrain(req.params.botname);
    fs.readFile("./brains/" + botbrain,'utf8',(err,data) => {
        res.send(data);
    })
})

app.get('/getbot',(req,res) => {
    res.send(DB.getBots());
})

app.get('/botlist',(req,res) => {
        res.send(DB.getBots());
})

app.get('/brainlist',(req,res) => {
    fs.readdir('./brains',(error,brainlist) => {
        if (error){console.log("erreur");}
        else{res.send(brainlist);}
    })
})


app.listen(port,host,function(){
    console.log(`app listening @ http://${host}:${port}`);
})