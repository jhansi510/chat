app.controller('chatController',['$http','$scope', 'chatService', function($http,$scope,chatService){
	var socket = io.connect();		
	//var ws = new WebSocket('ws://127.0.0.1:8888');
	/*   ws.onmessage = function (event) {
        console.log(event.data);
		ws.send("Hi");
      };
	*/	 
	 $scope.isChat = false;	 
	 $scope.chatDisable = true;
	 $scope.messages = [];
	 
	 $scope.test = "Enter User Name";
	 var api = "http://localhost:8888/users";
	 
	 loadUsers();
	 
	 function loadUsers()
	{
	
		chatService.getUsersList(function callback(err,data){
			if(!err && data)
			{
			$scope.users = data.data;
			console.log("success");
			}
			else
			{
			console.log("Error!! something went wrong to get users");
			}
		});
	
		/*$http.get(api).then(function sucessCallback(res){
			$scope.users = res.data.data;
			console.log("success");
		},function errorCallback(res){
			console.log("Error!! something went wrong to get users");
		});	*/
	}
	
	$scope.onUser = function() {
		$scope.userInfo.name = $scope.userInfo.name.toLowerCase();
		socket.emit('connect user',$scope.userInfo.name,function(data){
			if(data) {
				$scope.isChat= true;	
				$scope.infoMsg = "";				
				}
				else
				{
			 $scope.infoMsg = "username is in use.";
			 $scope.$apply();
			 }
		});			
		//	ws.send("Hi");		
		// $scope.$apply();
	}
	
	$scope.onChat = function() {	
		$scope.nickError = "";
		var msg = $scope.message.trim();
		if(msg.length == 0)
		{
		  $scope.nickError = "Empty Message";
		  return;
		  }		
		if(msg.toLowerCase().indexOf('/nick ') == 0){ //chnaging nick name				
			socket.emit('nick change',msg);
		
		} else if (msg.indexOf('/') != -1){			   
			$scope.nickError = "Send any text data without leadin '/' character.";
			$scope.$apply();
		} else {
				//$scope.messages.push({"nick":$scope.userInfo.name,"msg":msg});
			var data = new Object({"name":$scope.userInfo.name,"nick":$scope.userInfo.nick,"msg":msg});			
			var name = $scope.userInfo.name;	
			socket.emit('message',data);
		}		
		$scope.message = "";	
	}
	
	$scope.onSingelUser = function(nick){	
		$scope.filtereduser ={};
		$scope.filtereduser.nick = nick;
		//$scope.$apply();
	}
	
	socket.on('message',function(data){		
		$scope.messages.push({"name":data.name,"nick":data.nick,"msg":data.msg});		
		 $scope.$apply();
	});	
	
	socket.on('update users',function(name,nick){
	  loadUsers();
	});
	
	socket.on('nick error', function(data){
		$scope.nickError = "nick name is in use, please select another nickname.";
		 $scope.$apply();
	});	
	
	socket.on('nick change', function(name,nick){
		if($scope.userInfo.name == name)
			$scope.userInfo.nick = nick;
		loadUsers();
	});
	
	socket.on('status message', function(msg){						
		$scope.messages.push({"name":"","nick":"","msg":msg});		
	});
	
}]);	
