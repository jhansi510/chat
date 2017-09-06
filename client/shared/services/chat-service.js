app.factory('chatService', function ($http) {

var chat = {};

	chat.getUsersList = function(callback) {
		var api = "http://localhost:8888/users";
	
		return $http.get(api).then(function sucessCallback(res){
					callback(null,res.data);					
				},function errorCallback(res){
					callback(res,null);
				});
	}		
		return chat;		
});