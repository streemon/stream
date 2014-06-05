var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', '$localStorage', function($scope, $route, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
}]);

controllers.controller('IndexController', ['$scope', '$route', '$localStorage', function($scope, $route, $localStorage) {
	$http.get('/api/lists', {media: $route.current.media}).success(function(data) {
		$scope.lists = data;
	});
}]);

controllers.controller('LoginController', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage) {
	$scope.login = function () {
		var credentials = {
			username: this.username,
			password: this.password
		}

		$http.post('/api/login', credentials).success(function(data) {
			$scope.$storage = $localStorage;
			$scope.data = data;
			
			$scope.$storage.user = data.user;
		});
	}
}]);

controllers.controller('LogoutController', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage) {
	$http.get('/api/logout').success(function(data) {
		$scope.$storage = $localStorage;
		$scope.data = data;

		$scope.$storage.user = data.user;
	});
}]);

controllers.controller('SearchController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	if ($route.current.media == 'shows' || $route.current.media == 'movies') {
		$http.get('/api/search/' + $route.current.media + '/' + $route.current.params.q).success(function(data) {
			$scope.search = data;
		})
	}
}]);

controllers.controller('MovieController', ['$scope', function($scope) {
	
}]);

controllers.controller('ShowController', ['$scope', function($scope) {
	
}]);