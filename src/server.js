var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

app.use(express.static(__dirname+'/controllers'));
app.use(express.static(__dirname+'/css'));
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/images'));
app.use(express.static(__dirname+'/i18n'));

app.get('/', function(req, res){

  res.sendfile(__dirname + '/index.html');
});   

app.get('/api/lang', function(req, res) {
  
  if(!req.query.lang) {
      res.status(500).send();
      return;
  }
  try {
      var lang = require('./i18n/' + req.query.lang);
      res.send(lang); // `lang ` contains parsed JSON
  } catch(err) {
      res.status(404).send();
  }
});

io.on('connection', function(socket){
  console.log('user connected ');
  socket.on('message', function(msg){
    console.log('--------------Message ', msg);
    socket.broadcast.emit('message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});