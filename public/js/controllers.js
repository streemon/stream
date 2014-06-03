var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', '$http', function($scope, $route, $http) {
	$scope.$route = $route;

	//TO CHANGE CAUSE EXECUTED EVERYTIME
	$http.get('/api/home').success(function(data) {
		$scope.user = data;
	});
}]);

controllers.controller('IndexController', ['$scope', function($scope) {
	
}]);

controllers.controller('LoginController', ['$scope', '$http', function($scope, $http) {
	$scope.login = function () {
		var credentials = {
			username: this.username,
			password: this.password
		}

		$http.post('/api/login', credentials).success(function(data) {
			console.log(data);
		});
	}
}]);

controllers.controller('MovieController', ['$scope', function($scope) {
	
}]);

controllers.controller('ShowController', ['$scope', function($scope) {
	
}]);