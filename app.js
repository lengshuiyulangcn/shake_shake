var express = require('express')
var port     = process.env.PORT || 3000
var mongoose = require('mongoose')
//var morgan       = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser   = require('body-parser')
var session      = require('express-session')
var partials     = require('express-partials')
var app = express()
var Health=require("model/health");
var server = require('http').Server(app)
var io = require('socket.io')(server)

//config
mongoose.connect('mongodb://127.0.0.1:27017') //default port

//middleware
app.use(express.static(__dirname + '/public'))
app.use(partials())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//reset health before game start
app.get('/admin/reset', function(req,res){
  Health.remove({}, function(err,model){
    Health.create({team: 'white', blood: 100},function(err,result){
      Health.create({team: 'red', blood: 100},function(err,result){
        res.send('save ok')
      })
    }) 
  })
})
app.get('/', function (req, res) {
      Health.find({},function(err,result){
      res.send(result)
      })
})
setInterval(function(){
  Health.find({},function(err,result){
    io.emit('update_blood', result); 
  })
}, 1000);

// shake will minus 1 current blood
app.post('/shake', function(req,res){
  Health.update({team: req.body.team},{$inc: {blood: -1}}, function(err,team){
      res.send(team)
    })
})


//socket io event
io.on('connect',function(socket){
  socket.on('attack',function(msg){
    Health.update({team: msg.team},{$inc: {blood: -1}}, function(err,team){
        console.log(msg)
      })
  }) 
})
server.listen(port)
