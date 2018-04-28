var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

app.use(express.static(__dirname+'/js'));
app.use(express.static(__dirname+'/css'));
app.use(express.static(__dirname+'/template'));
app.use(express.static(__dirname+'/images'));

app.get('/', function(req, res){

  res.sendfile(__dirname + '/index_new.html');
});   

io.on('connection', function(socket){
  socket.on('new message', function(msg){
    console.log('Message ', msg);
    socket.emit('new message', msg);
    console.log('after emit ', msg);
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