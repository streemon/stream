var controllers = angular.module('myapp.controllers', []);

controllers.controller('MainController', ['$scope','$route', '$http', '$location', '$localStorage', function($scope, $route, $http, $location, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	$scope.search = function () {
		var query = this.q;
		if (!$route.current.media) $route.current.media = 'movies';

		$location.path('/search/' + $route.current.media + '/' + query);
	}

	if ($scope.$storage.user && $scope.$storage.user.auth) {
		$http.get('/api/account/notifications')
			.success(function (data) {
				$scope.notifications = data;
			})
/*
		if ($scope.$storage.user.lastActivity) {
			var now = new Date;
			var diff = now - new Date($scope.$storage.user.lastActivity);
			if (diff > 60*60) {
				$http.get('/api/account/sync')
					.success(function (data) {
						$scope.$storage.user = data;
					})
			}
		}
*/
	}
}]);

controllers.controller('IndexController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	/*
	$http.get('/api/lists', {media: $route.current.media}).success(function(data) {
		$scope.lists = data;
	});
	*/
}]);

controllers.controller('LoginController', ['$scope', '$http', '$localStorage', '$location', '$alert', function($scope, $http, $localStorage, $location, $alert) {
	$scope.login = function () {
		var credentials = {
			username: this.username,
			password: this.password
		}

		$http.post('/api/login', credentials)
			.success(function (data) {
				$scope.$storage = $localStorage;
				$scope.data = data;
				
				$scope.$storage.user = data.user;

				return $location.path('/');
			})
			.error(function (data) {
				$alert({title: data.msg, placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
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
	//delay not working properly
	$scope.delay = {show:1000,hide:0};
	if ($route.current.media == 'shows' || $route.current.media == 'movies') {
		$http.get('/api/search/' + $route.current.media + '/' + $route.current.params.q).success(function(data) {
			$scope.search = data;
		})
	}
}]);

controllers.controller('CommentsController', ['$scope', '$route', '$http', '$localStorage', function ($scope, $route, $http, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	$http.get('/api/'+ $route.current.media +'/' + $route.current.params.id + '/comments')
		.success(function(data) {
			$scope.comments = data;
		})
		.error(function(err) {
			$scope.err = err;
		})

	$scope.parseComment = function (comment) {
		var patterns = ['\#([-\.\\w]+)','\@([-\.\\w]+)', 'SPOILER ?:?(.*)'];
		var replacements = ['<a href="/shows/!$1">#$1</a>', '<a href="/users/@$1">@$1</a>', 'SPOILER: <em class="spoiler">$1</em>'];

		for (var i = 0; i < patterns.length; i++) {
			var pattern = new RegExp(patterns[i], "g");
			comment = comment.replace(pattern, replacements[i]);
		};

		return comment;
	}

	$scope.deleteComment = function (comment) {
		if (comment) {
			$http.delete('/api/comments/' + comment.comment._id).success(function (data) {
				$scope.comments.splice($scope.comments.indexOf(comment),1);
			})
		}
	}

	$scope.replyTo = function (username) {
		if (username) {
			$scope.comment = "@" + username + " ";
			$("#commentInput").focus();
		}
	}
	
	$scope.postComment = function () {
		var comment = {
			comment: this.comment,
			media: $route.current.media,
			mediaId: $route.current.params.id
		}

		if ($scope.$storage.user && $scope.$storage.user.auth) {
			if (comment.comment) {
				$http.post('/api/comments', comment)
					.success(function (data) {
						$scope.comment = "";
						$scope.comments.unshift(data);
					})
			}
			else {
				alert('Comment is empty');
			}
		}
		else {
			alert('You must be logged in !');
		}
	}
}]);

controllers.controller('MovieController', ['$scope', '$route', '$http', '$alert', function ($scope, $route, $http, $alert) {
	$scope.$route = $route;
	$scope.formLinks = [];

	$scope.formModal = {
	  "title": "Title",
	  "content": "Hello Modal<br />This is a multiline message!"
	};

	$scope.addLinkRow = function (index) {
		function linkModel(id) {
			this.url = '';
			this.media = 'movies';
			this.mediaId = $scope.movie.ID;
		}

		if (index == undefined || index + 1 == $scope.formLinks.length) $scope.formLinks.push(new linkModel());
	}

	$scope.submitLinks = function(links) {
		$http.post('/api/links', links)
			.success(function(data) {
				$alert({title: data.length + " links", content: "have been added", container: "body", duration: 3, container: '#alertContainer',animation: "am-fade-and-slide-top", placement: 'top', type: 'success', show: true});
				$scope.links.push(data);
				$scope.formLinks = [];
				$scope.addLinkRow();
			})
			.error(function (err) {
				$alert({title: err.msg, placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
				$scope.err = err;
			});
	}


	$http.get('/api/movies/' + $route.current.params.id)
		.success(function(data) {
			$scope.movie = $scope.media = data;
			$scope.addLinkRow();
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

controllers.controller('ShowController', ['$scope', '$route', '$http', '$location', function($scope, $route, $http, $location) {
	$scope.$route = $route;
	$scope.currentEpisode = {}
	$scope.currentEpisode.season_nb = $route.current.params.season || 1;
	$scope.currentEpisode.episode_nb = $route.current.params.episode || 1;
	$scope.formLinks = [];

	//prevents reloading when changing episode
    var lastRoute = $route.current;
    $scope.$on('$locationChangeSuccess', function(event) {
    	if ($route.current.media == 'shows' && $route.current.params.id == lastRoute.params.id) $route.current = lastRoute;
    });

	$scope.addLinkRow = function (index) {
		function linkModel() {
			this.url = '';
			this.media = 'episodes';
			this.mediaId = $scope.currentEpisode.ID;
			this.season_nb = $scope.currentEpisode.season_nb;
			this.episode_nb = $scope.currentEpisode.episode_nb;
		}

		if (index == undefined || index + 1 == $scope.formLinks.length) $scope.formLinks.push(new linkModel());
	}

	$scope.changeSeason = function (season_nb) {
		$scope.currentEpisode.season_nb = season_nb;
	}
	$scope.changeEpisode = function (episode) {
		$scope.currentEpisode = episode;
	}

	$scope.prevEpisode = function () {
		if ($scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb - 1]) $scope.currentEpisode = $scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb - 1];
		else {
			var s = $scope.currentEpisode.season_nb - 1;
			if ($scope.show.seasons[s]) {
				var e = $scope.show.seasons[s].length - 1;
				$scope.currentEpisode = $scope.show.seasons[s][e];
			}
		}
	}
	$scope.nextEpisode = function () {
		if ($scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb + 1]) $scope.currentEpisode = $scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb + 1];
		else {
			var s = $scope.currentEpisode.season_nb + 1;
			if ($scope.show.seasons[s][1]) $scope.currentEpisode = $scope.show.seasons[s][1];
		}
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

	$scope.$watch('currentEpisode', function() {
		if ($scope.currentEpisode.ID) {
			$scope.formLinks = [];
			$scope.addLinkRow();

			//change url path
			$location.path('/shows/' + $scope.currentEpisode.show_id + '/season/' + $scope.currentEpisode.season_nb + '/episode/' + $scope.currentEpisode.episode_nb);

			$http.get('/api/episodes/' + $scope.currentEpisode.ID + '/links')
				.success(function (data) {
					$scope.links = data;
				})
		}
	});

	$http.get('/api/shows/' + $route.current.params.id + '?episodes=1')
		.success(function (data) {
			$scope.show = $scope.media = data;

			if ($scope.show.currentEpisode) {
				$scope.currentEpisode = $scope.show.currentEpisode;
			}
			else {
				if($scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb]) {
					$scope.currentEpisode = $scope.show.seasons[$scope.currentEpisode.season_nb][$scope.currentEpisode.episode_nb];
				}
				else {
					$scope.currentEpisode = $scope.show.seasons[1][1];
				}
			}
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

controllers.controller('SettingsController', ['$scope', '$http', '$localStorage', '$location', '$alert', function ($scope, $http, $localStorage, $location, $alert) {
	$scope.storage = $localStorage;
	$scope.languages = [{code: 'en', name: 'English'}, {code: 'es', name: 'Spanish'}, {code: 'fr', name: 'French'}, {code: 'de', name: 'German'}, {code: 'nl', name: 'Dutch'}];
	
	//if user is not identified
	if (!$scope.storage.user || !$scope.storage.user.auth) return $location.path('/');

	$scope.form = {};
	if ($scope.storage.user.settings) $scope.form.settings = $scope.storage.user.settings;
	else $scope.form.settings = {lang: 'en', subtitles: []};

	$scope.saveSettings = function () {
		$http.put('/api/account', $scope.form)
			.success(function (data) {
				$alert({title: data.msg, placement: 'top', duration: 4, container: '#alertContainer', type: 'success', show: true});
			})
	}

}]);

controllers.controller('LinksController', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {
	$scope.storage = $localStorage;

	$scope.deleteLink = function(link) {
		$http.delete('/api/links/' + link._id).success(function (data) {
			$scope.links.splice($scope.links.indexOf(link), 1);
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