const express = require("express")
const ejs = require("ejs")

const serveur = express()

const host = "localhost"
const port = "8008"

serveur.set("port",process.env.PORT||port)

serveur.set('view engine', 'ejs');

serveur.use(express.static(__dirname+'/public'));

serveur.get('/', function(req, res){
    console.log("Bang!");
    res.render('index');
})

serveur.listen(port,host,function(){
    console.log(`serveur @ http://${host}:${port}`)
})