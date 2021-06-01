const express = require("express");
const RiveScript = require("rivescript");
const fs = require('fs');

const DBManager = require('./utils/LowDB');

const app = express();

const host = "localhost";
const port = "8000";

var DB;
DBManager.create().then((list) => {DB = list});

var bot = new RiveScript();

bot.loadFile("brains/bot.rive").then(loading_done);

app.set("port",process.env.PORT||port);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/admin', function(req, res){
    DB.addBot(req.body.botname,req.body.botbrain).then(()=>{
        res.status(200).send('ajout fait')
    });
})

app.delete('/admin/:botname', function(req, res){
    DB.removeBot(req.params.botname).then(()=>{
        res.status(200).send('suppression faite')
    });
})

app.get('/botreply/:msg/:botname',function(req, res){
    let bots = DB.getBots()
    for (let i = 0; i < bots.length; i++){
        if (bots[i].name == req.params.botname){
            bot = new RiveScript();
            bot.loadFile("brains/" + bots[i].brain).then(() =>{
                loading_done();
                bot.reply("",req.params.msg).then((reply)=>{
                    res.send(reply);
            })});
        }
    }

})

app.get('/botlist',function(req, res){
        res.send(DB.getBots())
})

app.get('/brainlist',function(req, res){
    fs.readdir('./brains',(error,brainlist) => {
        if (error){
            console.log("erreur");}
        else{
            res.send(brainlist);
        }
    })
})

function loading_done() {
    bot.sortReplies();
}

app.listen(port,host,function(){
    console.log(`app listening @ http://${host}:${port}`);
})

