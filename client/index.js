const express = require("express");
const http = require('http');
const socketio = require("socket.io");
const ejs = require("ejs");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const host = "localhost";
const port = "3000";

app.set("port",process.env.PORT||port);
app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

io.on('connection', socket => {
    socket.on('joinChat', botname => {
        socket.join(botname);
        socket.emit('message', formatMessage('The Welcoming Bot ', 'Welcome to BotLane!'));
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        message = msg.msg
        botname = msg.bot
        socket.emit('message', formatMessage('You ',message));
        let xml_req = new XMLHttpRequest();
        xml_req.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(xml_req.responseText)
                socket.emit('message', formatMessage(botname+' ',xml_req.responseText))
            }
        };
        xml_req.open("get", "http://localhost:8000/botreply/" + message + "/" + botname, true);
        xml_req.send(null);
        });
    });

app.get('/',getBotList, function(req, res){
    res.render('index');
})
app.get('/addbot',getBrainList, function(req, res){
    res.render('addbot');
})
app.get('/chat', function(req, res){
    res.render('chat');
})
app.get('/delbot',getBotList,function(req, res){
    res.render('delbot');
})

app.post('/addbot2',(req,res) =>{
    let botname = req.body.bot_name;
    let botbrain = req.body.bot_brain;
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let xml_req2 = new XMLHttpRequest();
            xml_req2.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    res.locals.botlist = JSON.parse(xml_req2.responseText);
                    res.render("index");
                }
            };
            xml_req2.open("get", "http://localhost:8000/botlist", true);
            xml_req2.send(null);
        }
    };
    xml_req.open("post", "http://localhost:8000/admin", true);
    xml_req.setRequestHeader('Content-Type', 'application/json');
    xml_req.send(JSON.stringify({botname: botname, botbrain: botbrain}));
})

app.post('/delbot2',(req,res) =>{
    let botname = req.body.bot_name;
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let xml_req2 = new XMLHttpRequest();
            xml_req2.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    res.locals.botlist = JSON.parse(xml_req2.responseText);
                    res.render("index");
                }
            };
            xml_req2.open("get", "http://localhost:8000/botlist", true);
            xml_req2.send(null);
        }
    };
    xml_req.open("delete", "http://localhost:8000/admin/" + botname, true);
    xml_req.send(null);
})

function getBotList(req,res,next){
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            res.locals.botlist = JSON.parse(xml_req.responseText);
            next();
        }
    };
    xml_req.open("get", "http://localhost:8000/botlist", true);
    xml_req.send(null);
}

function getBrainList(req,res,next){
    let xml_req = new XMLHttpRequest();
    xml_req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            res.locals.brainlist = JSON.parse(xml_req.responseText);
            next();
        }
    };
    xml_req.open("get", "http://localhost:8000/brainlist", true);
    xml_req.send(null);
}


server.listen(port,host,function(){
    console.log(`app listening @ http://${host}:${port}`)
})

