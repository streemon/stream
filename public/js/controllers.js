var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', '$location', '$localStorage', function($scope, $route, $location, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	$scope.search = function () {
		var query = this.q;
		if (!$route.current.media) $route.current.media = 'movies';

		$location.path('/search/' + $route.current.media + '/' + query);
	}
}]);

controllers.controller('IndexController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	/*
	$http.get('/api/lists', {media: $route.current.media}).success(function(data) {
		$scope.lists = data;
	});
	*/
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
	$scope.$route = $route;

	if ($route.current.media == 'shows' || $route.current.media == 'movies') {
		$http.get('/api/search/' + $route.current.media + '/' + $route.current.params.q).success(function(data) {
			$scope.search = data;
		})
	}
}]);

controllers.controller('MovieController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	$scope.$route = $route;

	$scope.addLinkRow = function () {
		function linkModel(id) {
			this.url = '';
			this.media = 'movies';
			this.mediaId = id;
		}

		$scope.formLinks.push(new linkModel($scope.$route.current.params.id));
	}

	$scope.submitLinks = function(links) {
		$http.post('/api/links', links)
			.success(function(data) {
				$scope.form = {msg: data.length + " links have been added"};
				$scope.links.push(data);
			})
			.error(function (err) {
				$scope.form = err;
			});
	}

	$scope.formLinks = [];
	$scope.addLinkRow();

	$http.get('/api/movies/' + $route.current.params.id)
		.success(function(data) {
			$scope.movie = data;
		})
		.error(function(err) {
			$scope.movie = err;
		});

	$http.get('/api/movies/' + $route.current.params.id + '/links')
		.success(function (data) {
			$scope.links = data;
		})
		.error(function (err) {
			$scope.links = err;
		});
}]);

controllers.controller('ShowController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	$scope.$route = $route;

	$http.get('/api/shows/' + $route.current.params.id).success(function(data) {
		$scope.show = data;
	})
}]);