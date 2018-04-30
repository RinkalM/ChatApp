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
  // Check endpoint called with appropriate param.:
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
  console.log('connected users  ', io.connected);
  socket.on('new message', function(msg){
    console.log('Message ', msg);
    socket.broadcast.emit('new message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    
//http.createServer(function (request, response) {
    // Send the HTTP header 
    // HTTP Status: 200 : OK
    // Content Type: text/plain
    //response.writeHead(200, {'Content-Type': 'text/plain'});
    
    // Send the response body as "Hello World"
    //response.end('Hello World\n');
 //}).listen(8081);
 
 // Console will print the message
 //console.log('Server running at http://127.0.0.1:8081/');