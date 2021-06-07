const express = require("express");
const http = require('http');
const socketio = require("socket.io");
const ejs = require("ejs");
const RiveScript = require("rivescript");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const formatMessage = require('./utils/messages');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const host = "localhost";
const port = "3000";

app.set("port",process.env.PORT||port);
app.set('view engine','ejs');

app.use(express.static(__dirname+'/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let Bot = new RiveScript();

let Bots;


io.on('connection', socket => {

    // Join chatroom
    socket.on('joinChat', botname => {
        socket.join(botname);
        let already_loaded = false;
        for (let i = 0; i < Bots.length; i++){
            if(Bots[i][0] === botname && Bots[i][1] != null){
                already_loaded = true;
            }
        }
        console.log(already_loaded);
        if (already_loaded === false){
            let xml_req = new XMLHttpRequest();
            xml_req.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    fs.writeFile('./bots/' + botname + ".rive",xml_req.responseText,(err) => {
                        if (err) return console.log(err);
                        for (let i = 0; i < Bots.length; i++){
                            if(Bots[i][0] === botname){
                                Bots[i][1] = './bots/' + botname + ".rive";
                                let newbot = new RiveScript();
                                newbot.loadFile(Bots[i][1]).then( () => {
                                    newbot.sortReplies();
                                })
                                Bot = newbot;
                            }
                        }
                    })
                }
            };
            xml_req.open("get","http://localhost:8000/joinchat/" + botname,true);
            xml_req.send(null);
        }else{
            for (let i = 0; i < Bots.length; i++){
               if(Bots[i][0] === botname){
                   let newbot = new RiveScript();
                   newbot.loadFile(Bots[i][1]).then(() => {
                       newbot.sortReplies();
                   })
                   Bot = newbot;
               }
            }
        }
        socket.emit('message',formatMessage('The Welcoming Bot ', 'Welcome to BotLane !'));
    });

    // Listen for messages
    socket.on('chatMessage', (msg) => {
        let message = msg.msg;
        let botname = msg.bot;
        socket.emit('message',formatMessage('You ',message));
        Bot.reply("",message).then((reply) =>{
            socket.emit('message', formatMessage(botname + ' ',reply));
        })
    });
});


app.get('/',getBotList, (req,res) => {
    res.render('index');
})

app.get('/chat', (req,res) =>{
    res.render('chat');
})

app.get('/addbot',getBrainList, (req,res) => {
    res.render('addbot');
})

app.get('/delbot',getBotList, (req,res) => {
    res.render('delbot');
})

app.get('/updatebot',getBotList,getBrainList, (req,res) => {
    res.render('updatebot');
})


app.post('/addbot2',(req,res) => {
    let botname = req.body.bot_name;
    let botbrain = req.body.bot_brain;
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let xml_req2 = new XMLHttpRequest();
            xml_req2.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    let botlist =JSON.parse(xml_req2.responseText);
                    res.locals.botlist = botlist;
                    let Bots2 = [];
                    for (let i = 0; i < botlist.length; i++){
                        Bots2.push([botlist[i].name,null]);
                    }
                    for (let j = 0; j < Bots.length; j++){
                        for (let k = 0; k < Bots2.length; k++){
                            if (Bots[j][0] === Bots2[k][0] && Bots[j][1] != null){
                                Bots2[k][1]=Bots[j][1];
                            }
                        }
                    }
                    Bots = Bots2;
                    res.render("index");
                }
            };
            xml_req2.open("get","http://localhost:8000/botlist",true);
            xml_req2.send(null);
        }
    };
    xml_req.open("post","http://localhost:8000/admin",true);
    xml_req.setRequestHeader('Content-Type','application/json');
    xml_req.send(JSON.stringify({botname: botname, botbrain: botbrain}));
})

app.post('/delbot2',(req,res) => {
    let botname = req.body.bot_name;
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let xml_req2 = new XMLHttpRequest();
            xml_req2.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    let botlist = JSON.parse(xml_req2.responseText);
                    res.locals.botlist = botlist;
                    let Bots2 = [];
                    for (let i = 0; i < botlist.length; i++){
                        Bots2.push([botlist[i].name,null]);
                    }
                    for (let j = 0; j < Bots.length; j++){
                        for (let k = 0; k < Bots2.length; k++){
                            if (Bots[j][0] === Bots2[k][0] && Bots[j][1] != null){
                                Bots2[k][1]=Bots[j][1];
                            }
                        }
                    }
                    Bots = Bots2;
                    res.render("index");
                }
            };
            xml_req2.open("get","http://localhost:8000/botlist",true);
            xml_req2.send(null);
        }
    };
    xml_req.open("delete","http://localhost:8000/admin/" + botname,true);
    xml_req.send(null);
})

app.post('/updatebot2',(req,res) => {
    let botname = req.body.bot_name;
    let botbrain = req.body.bot_brain;
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let xml_req2 = new XMLHttpRequest();
            xml_req2.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    let botlist = JSON.parse(xml_req2.responseText);
                    res.locals.botlist = botlist;
                    let Bots2 = [];
                    for (let i = 0; i < botlist.length; i++){
                        Bots2.push([botlist[i].name,null]);
                    }
                    for (let j = 0; j < Bots.length; j++){
                        for (let k = 0; k < Bots2.length; k++){
                            if (Bots[j][0] === Bots2[k][0] && Bots[j][1] != null){
                                Bots2[k][1]=Bots[j][1];
                            }
                        }
                    }
                    Bots = Bots2;
                    res.render("index");
                }
            };
            xml_req2.open("get","http://localhost:8000/botlist",true);
            xml_req2.send(null);
        }
    };
    xml_req.open("put","http://localhost:8000/admin/" + botname + '/' + botbrain, true);
    xml_req.send(null);
})


function initBots(){
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let botlist = JSON.parse(xml_req.responseText)
            for (let i = 0; i < botlist.length; i++){
                Bots.push([botlist[i].name,null]);
            }
        }
    };
    xml_req.open("get","http://localhost:8000/botlist", true);
    xml_req.send(null);
}

function getBotList(req,res,next){
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let botlist = JSON.parse(xml_req.responseText);
            res.locals.botlist = botlist;
            let Bots2 = [];
            for (let i = 0; i < botlist.length; i++){
                Bots2.push([botlist[i].name,null]);
            }
            for (let j = 0; j < Bots.length; j++){
                for (let k = 0; k < Bots2.length; k++){
                    if (Bots[j][0] === Bots2[k][0] && Bots[j][1] != null){
                        Bots2[k][1]=Bots[j][1];
                    }
                }
            }
            Bots = Bots2;
            next();
        }
    };
    xml_req.open("get","http://localhost:8000/botlist", true);
    xml_req.send(null);
}

function getBrainList(req,res,next){
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            res.locals.brainlist = JSON.parse(xml_req.responseText);
            next();
        }
    };
    xml_req.open("get","http://localhost:8000/brainlist", true);
    xml_req.send(null);
}


server.listen(port,host,() => {
    Bots = [];
    initBots();
    console.log(`app listening @ http://${host}:${port}`)
})

