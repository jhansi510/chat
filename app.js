/*jslint node: true, indent: 2 */
'use strict';
var express = require('express');
var util = require('util');

var app = express();
app.set('name', "Leadin Chat Demo");
app.set('port', 8888);
var socketio = require('socket.io');

var server = require('http').createServer(app);

var io = socketio.listen(server);
var nicknames = [];

var users = new require('./users')();
var chats = new require('./chathistory')();

/*
users.createUser("Andre");
users.createUser("Fabiano");
users.createUser("Jhansi");
users.createUser("Reddy");
*/
io.sockets.on('connection', function(socket){
	
	socket.on('connect user',function(name,callback){
		console.log("server: user");
		var user = users.getUser(name);
		if(user){			
			if(user.online)	{
				callback(false);					
				}
			else {// available
				var _nick = user.nick;
				var _nickExist = isNickDuplicate(_nick);
			
				if(_nickExist) {//nickName exists				    
					users.updateNick(name,name);   // automatically updtaing nickname to name, if it(nick) is used by other user.
					_nick = name;
				}
				
				callback(true);
				socket.name = name;
				users.updateStatus(name,true);
				io.sockets.emit('nick change',name,_nick);			
				io.sockets.emit('status message',name+" joined the room.");
				}				
		} else {
			callback(true);
			users.createUser(name);
			socket.name = name;
			io.sockets.emit('nick change',name,name);
			io.sockets.emit('status message',name+" joined the room.");			
		}
		
	});
	
	function isNickDuplicate(_nick){
		var _nickExist = false;	
		var _users = users.getAll();
			for(var i=0;i<_users.length;i++)	{
				//console.log(_users[i].nick);
				if(_users[i].nick == _nick && _users[i].online){
					console.log("nick: "+_nick);
				  _nickExist = true;
				  break
				}
			}
			return _nickExist;
	}
	
	socket.on('message',function(data){	
			chats.add(data.nick,data.msg);
			io.sockets.emit('message',{nick:data.nick, msg:data.msg});		
	});
	
	socket.on('nick change',function(data){
		var _nick = data.substr(6);
			var _nickExist = false;
			
			var _users = users.getAll();
			for(var i=0;i<_users.length;i++)	{				
				if(_users[i].nick == _nick && _users[i].online){					
				  _nickExist = true;
				  break;
				}
			}
			if(!_nickExist) {//nickName not exists, updat eit
				users.updateNick(socket.name,_nick);
				io.sockets.emit('nick change',socket.name,_nick);
				}
			else // send error message
				io.sockets.emit('nick error');	
	});
	
	socket.on('disconnect',function(data){
		//console.log("Server:Disconnect"+socket.name);
		//users.deleteUser(socket.name);
		users.updateStatus(socket.name,false);
		io.sockets.emit('update users');				
		io.sockets.emit('status message',socket.name+" left the chat.");		
	});
	
});

app.use(require('morgan')('dev'));
//set cors headers
app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(__dirname + '/client'));

/*
var wssServer = require('ws').Server({server: server, perMessageDeflate: false});

wssServer.on('connection', function(ws,user) {
	ws.user = users.getUser(user);
	// console.log("user"+user);
    util.log("Connection from " + util.inspect(ws.upgradeReq.connection.remoteAddress));
    ws.send("Hello from Leadin chat. Set the nickname with the command /nick nickname before chatting away.");
   
   ws.on('open', function(user) {
   console.log("server:open");
   ws.user = users.getUser(user);
   });
    ws.on('message', function(msg) {
	console.log("server:message"+msg);
	ws.send(msg);
	return;
        if(msg[0] === '/') {
            chatProtocol.handleCommand(ws, msg);
        } else {
            if(ws.user) { //we know who this is
                chatProtocol.broadcast(ws.user.nick, msg);
            } else {
                util.log("Chat ignored from unidentified user");
            }  
        }               
    });
    ws.on('close', function(code, message) {
        var user = ws.user;
        user.online = false;
        util.log(user.nick + " dropped out.");
        chatProtocol.broadcast("_server", user.nick + " dropped out.");
    });
});
wssServer.on('error', function(err) {
    util.log("Websocket server error: " + util.inspect(err));
});

var chatProtocol = new require('./protocol')(wssServer, users, chats);
*/

app.get('/chat', function(req,res){
	res.sendFile(__dirname+'/client/views/index.html');
});	
		
//REST routes
app.use(require('./routes')(users, chats).router);

util.log('Server started.');
server.listen(app.get('port'), function () {
  util.log('%s listening at %s', app.get('name'), app.get('port'));
});
