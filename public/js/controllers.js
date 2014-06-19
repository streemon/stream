var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', '$http', '$location', '$localStorage', function($scope, $route, $http, $location, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	$scope.search = function () {
		var query = this.q;
		if (!$route.current.media) $route.current.media = 'movies';

		$location.path('/search/' + $route.current.media + '/' + query);
	}

	if ($scope.$storage.user.auth) {
		$http.get('/api/account/notifications')
			.success(function (data) {
				$scope.notifications = data;
			})
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

controllers.controller('LogoutController', ['$scope', '$http', '$localStorage', function ($scope, $http, $localStorage) {
	$http.get('/api/logout').success(function(data) {
		$scope.$storage = $localStorage;
		$scope.data = data;

		$scope.$storage.user = data.user;
	});
}]);

controllers.controller('SearchController', ['$scope', '$route', '$http', function ($scope, $route, $http) {
	$scope.$route = $route;

	if ($route.current.media == 'shows' || $route.current.media == 'movies') {
		$http.get('/api/search/' + $route.current.media + '/' + $route.current.params.q).success(function(data) {
			$scope.search = data;
		})
	}
}]);

controllers.controller('CommentsController', ['$scope', '$route', '$http', function ($scope, $route, $http) {
	$scope.$route = $route;

	$http.get('/api/'+ $route.current.media +'/' + $route.current.params.id + '/comments')
		.success(function(data) {
			$scope.comments = data;
		})
		.error(function(err) {
			$scope.err = err;
		})

	$scope.postComment = function () {
		var comment = {
			comment: this.comment,
			media: $route.current.media,
			mediaId: $scope.media.ID
		}

		console.log(comment);

		$http.post('/api/comments', comment)
			.success(function (data) {
				$scope.comment = "";
				$scope.comments.push(data);
			})
	}
}]);

controllers.controller('MovieController', ['$scope', '$route', '$http', function ($scope, $route, $http) {
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
				$scope.err = err;
			});
	}

	$scope.formLinks = [];
	$scope.addLinkRow();

	$http.get('/api/movies/' + $route.current.params.id)
		.success(function(data) {
			$scope.movie = $scope.media = data;
		})
		.error(function(err) {
			$scope.err = err;
		});

	$http.get('/api/movies/' + $route.current.params.id + '/links')
		.success(function (data) {
			$scope.links = data;
		})
		.error(function (err) {
			$scope.err = err;
		});
}]);

controllers.controller('ShowController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	$scope.$route = $route;

	$scope.addLinkRow = function (id, seasonNb) {
		function linkModel(id, seasonNb) {
			this.url = '';
			this.media = 'episodes';
			this.episodeId = id;
			this.seasonNb = seasonNb;
		}

		$scope.formLinks.push(new linkModel(id, seasonNb));
	}

	$scope.submitLinks = function(links) {
		$http.post('/api/links', links)
			.success(function(data) {
				$scope.form = {msg: data.length + " links have been added"};
				$scope.links.push(data);
			})
			.error(function (err) {
				$scope.err = err;
			});
	}

	$scope.formLinks = [];

	$http.get('/api/shows/' + $route.current.params.id + '?episodes=1')
		.success(function (data) {
			console.log(data);
			$scope.show = $scope.media = data;
			if ($scope.show.currentEpisode) $scope.addLinkRow($scope.show.currentEpisode.ID, $scope.show.currentEpisode.season_nb);
		})
		.error(function (err) {
			$scope.err = err;
		});

	$http.get('/api/episodes/' + $route.current.params.id + '/links')
		.success(function (data) {
			$scope.links = data;
		})
		.error(function (err) {
			$scope.err = err;
		});
}]);

controllers.controller('ProfileController', ['$scope', '$http', '$route', function ($scope, $http, $route) {
	$scope.$route = $route;

	$http.get('/api/users/@' + $route.current.params.username)
		.success(function (data) {
			$scope.profile = data;
		})
		.error(function (err) {
			$scope.err = err;
		});
}]);

controllers.controller('SettingsController', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {
	$scope.storage = $localStorage;
	$scope.languages = [{code: 'en', name: 'English'}, {code: 'es', name: 'Spanish'}, {code: 'fr', name: 'French'}, {code: 'de', name: 'German'}, {code: 'nl', name: 'Dutch'}];

	//if user is not identified
	if (!$scope.storage.user || !$scope.storage.user.auth) return $location.path('/');

	$scope.form.lang = 'en';
	$scope.form.subtitles = ['en', 'fr'];


}]);

controllers.controller('LinksController', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {
	$scope.storage = $localStorage;

	$scope.deleteLink = function(link) {
		$http.delete('/api/links/' + link._id).success(function (data) {
			$scope.links.pop(link);
		});
	}

	//if user is not identified
	if (!$scope.storage.user || !$scope.storage.user.auth) return $location.path('/');

	$http.get('/api/account/links')
		.success(function (data) {
			$scope.links = data;
		})
		.error(function (err) {
			$scope.err = err;
		})

}]);