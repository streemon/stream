var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', function($scope, $route) {
	$scope.$route = $route;
}]);

controllers.controller('IndexController', ['$scope', function($scope) {
	
}]);

controllers.controller('MovieController', ['$scope', function($scope) {
	
}]);

controllers.controller('ShowController', ['$scope', function($scope) {
	
}]);