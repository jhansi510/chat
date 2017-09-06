var _ = require('lodash');

function User(name,nick) {
	this.name = name;
	if(nick)	
		this.nick = nick;
	else
		this.nick = name;
    this.online = true;
}

exports = module.exports = function() {
    var _users = {};
   	
    return {
        createUser: function(id) {
           if(!_users[id]) {
               _users[id] = new User(id);
               return _users[id];
           }
           return null;
        },
        getUser: function(id) {
            return _users[id];
        },
        getAll: function() {
            return _.map(_users, function(user) {
                return {name: user.name, nick: user.nick, online: user.online};
            });
        },
        /** Changes user nickname but be carefull, if newnick is alredy in use, this takes it over */
        changeNick: function(oldNick, newNick) {
            var user = this.getUser(oldNick);
            if(user && !user.online) {
                user.nick = newNick;
                delete _users[oldNick];
                _users[newNick] = user;
            }
        },
		updateNick: function(name, newNick) {
            var user = this.getUser(name);
             if(user) {
                user.nick = newNick;
               // delete _users[oldNick];
               // _users[newNick] = user;
            }
        },
		deleteUser: function(id) {
            delete _users[id];
        },
		updateStatus: function(id,status) {
			var user = _users[id];
			if(user)
				user.online = status;				
		}
    }
}