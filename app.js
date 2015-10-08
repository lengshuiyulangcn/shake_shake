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
var auth = require('basic-auth')
//config
mongoose.connect('mongodb://127.0.0.1:27017') //default port

//middleware
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public'))
app.use(partials())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var User = {"14":"熊","15":"莘哥","16":"香柱元","17":"庄言","18":"陈晓慧","19":"楊 山山","20":"程 暁華","21":"杨天宇","22":"吴","23":"苏庆阳","24":"冯晶","25":"喬毅","26":"杜雨軒","27":"胡敏","28":"张苹果","29":"秦超群","30":"胡明磊","31":"单雪菲","32":"唐飞","33":"董晶","34":"邱卉","35":"rob","36":"李明","37":"冉景珍","38":"徐晴晔","39":"徐汐炜","40":"程琦祺","41":"于琪瑶","42":"罗怡沁","43":"陈俊琳","44":"张明莹","45":"potato","46":"况莹","47":"Vivian","48":"Tie","49":"马少莹","50":"穆永恒","51":"苗梦溪","52":"孙艳志","53":"彭洁予","54":"郭衍冉","55":"王珊珊","56":"陈锴","57":"吳汶珈","58":"李诗","59":"胡月","60":"徐书尹","61":"向雪林","62":"翁欣","63":"马冬梅","64":"韩露","65":"王睿","66":"梁世阳","67":"李帆","68":"包辰","69":"任骥原","70":"陈汉杰","71":"黄洁","72":"莎莎","73":"方依宁","74":"中原倍佳","75":"刘理","76":"肖潇","77":"甄妮","78":"yang","79":"程矗","80":"马少莹","81":"窦智","82":"Dongying Xiao","83":"马宁远","84":"姜虹宇","85":"施佳音","86":"刘福君","87":"王程超凡","88":"曽新達","89":"郭若炜","90":"姜雅琪","91":"毛杰","92":"张颖","93":"唐彦春","94":"郭笑蕾","95":"Jack","96":"陈昊","97":"钱继安","98":"肖雨珊","99":"朱雪梅","100":"丁睿哲","101":"瀟瀟","102":"董事长","103":"孟嘉琪","104":"郭翼飛","105":"唐琳","106":"小琳","107":"赵羽骁","108":"劉","109":"ellie","110":"王黎","111":"李 奇","112":"郭韦萱","113":"陈 天静","114":"陈欣岱","115":"徐梦婷","116":"李瑞奇","117":"张艺红","118":"乌尔罕","119":"徐蒙","120":"赵雅晨","121":"李力耘","122":"杨文丽","123":"刘 曦雅","124":"边宇佳","125":"徐瑶","126":"黄伟钦","127":"肖林","128":"Hendry","129":"楊尭","130":"闫星宇","131":"张婉杰","132":"滕冰清","133":"Tiffany Wu","134":"ミエ","135":"钱衡","136":"朱玛珺","137":"王心刚","138":"何超","139":"林泽帆","140":"黄梓健","141":"陳秋蘭","142":"区璟晖","143":"趙 佳楽","144":"陈曦","145":"全浩聪","146":"钮臻禹","147":"钟晓枫","148":"胡 越","149":"杨朔","150":"曹远","151":"许乃傲","152":"刘嘉仪","153":"尤一唯","154":"黄","155":"崔斌","156":"周晴","157":"Zhang Junwei","158":"龙微鑫","159":"孟祥申"}

var Winners = [];
//reset health before game start
app.get('/admin/reset', function(req,res){
  Health.remove({}, function(err,model){
    Health.create({team: 'white', blood: 1000},function(err,result){
      Health.create({team: 'red', blood: 1000},function(err,result){
        res.redirect('back')
      })
    }) 
  })
})
app.get('/', function (req, res) {
 res.redirect('/index.html')  
})
app.get('/show', function (req, res) {
  var credentials = auth(req)
    if (!credentials || credentials.name !== 'admin' || credentials.pass !== 'fuckadmintwice') {
          res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="example"')
      res.end('Access denied')
    } else {
        Health.remove({}, function(err,model){
          Health.create({team: 'white', blood: 1000},function(err,result){
           Health.create({team: 'red', blood: 1000},function(err,result){
          res.render('show.ejs')})
          })
      })
    }
})
app.post('/number', function (req, res) {
    var number = req.body.number
    console.log(number)
    if(number%2 == 1) {
    res.render('white.ejs',{userName: User[number]})
    }
    else{
    res.render('red.ejs',{userName: User[number]})
    }
})
app.get('/random/:color', function (req, res) {
  var startNumbers;
  if (req.params.color == 'red'){
    //push red
    startNumbers = Object.keys(User).filter(function(key){ return key % 2 == 0; });
  }
  else if (req.params.color == 'white'){
    startNumbers = Object.keys(User).filter(function(key){ return key % 2 == 1; });
  }
  res.render('watch.ejs',{numbers: startNumbers})

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
        io.emit('attacker', {team: msg.myTeam, attacker: msg.userName}); 
      })
  });
  socket.on('getOne',function(msg){
   Winners.push(msg.number);
  });
  socket.on('nextStage',function(msg){
   io.emit('winners', {winners: Winners});
   console.log(Winners)
   Winners = []
  });
})
server.listen(port)
