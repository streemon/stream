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
	}
}]);

controllers.controller('IndexController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	var url = '/api/lists/';
	if ($route.current.media) url += $route.current.media;

	$http.get(url).success(function(data) {
		$scope.lists = data;
	});
}]);


controllers.controller('ListController', ['$scope', '$route', '$http', function($scope, $route, $http) {
	var url = '/api/lists/' + $route.current.params.id + '/' 
	if ($route.current.params.media) url += $route.current.params.media;

	$http.get(url).success(function(data) {
		$scope.list = data;
	});
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
	//delay for popovers not working properly
	$scope.delay = {show:1000,hide:0};

	if ($route.current.media == 'shows' || $route.current.media == 'movies') {
		$http.get('/api/search/' + $route.current.media + '/' + $route.current.params.q).success(function(data) {
			$route.current.title = $route.current.params.q;
			$scope.search = data;
		})
	}
}]);

controllers.controller('CommentsController', ['$scope', '$route', '$http', '$localStorage', function ($scope, $route, $http, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	$("#commentInput").keydown(function(e){
	    if (e.keyCode == 13)
		{
			if (e.shiftKey) {
				var text = $(this).val();
				var rows = text.split("\n").length + 1;
				$(this).attr("rows",  rows);
			}
			else {
				e.preventDefault();
				$(this).submit();
				$(this).attr("rows", 1);
			}
	    }
	    else if (e.keyCode == 8) {
			var text = $(this).val();
			var rows = text.split("\n").length;
			$(this).attr("rows",  rows);
	    }
	});

	$http.get('/api/'+ $route.current.media +'/' + $route.current.params.id + '/comments')
		.success(function(data) {
			$scope.comments = data;
		})
		.error(function(err) {
			$scope.err = err;
		})

	$scope.parseComment = function (comment) {
		var patterns = ['(<([^>]+)>)', '\#([-\.\\w]+)','\@([-\.\\w]+)', 'SPOILER ?:?(.*)', '\n'];
		var replacements = ['', '<a href="/shows/!$1">#$1</a>', '<a href="/users/@$1">@$1</a>', 'SPOILER: <em class="spoiler">$1</em>', '<br/>'];

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

controllers.controller('LinkFormController', ['$scope', '$http', '$route', '$alert', function ($scope, $http, $route, $alert) {
	$scope.languages = [{code: 'en', name: '<img class="flag flag-us"></img> English'}, {code: 'es', name: '<img class="flag flag-es"></img> Spanish'}, {code: 'fr', name: '<img class="flag flag-fr"></img> French'}, {code: 'de', name: '<img class="flag flag-de"></img> German'}, {code: 'nl', name: '<img class="flag flag-nl"></img> Dutch'}];
	$scope.sub_languages = [{code: '', name: '<img class="flag"></img> None'}, {code: 'en', name: '<img class="flag flag-us"></img> English'}, {code: 'es', name: '<img class="flag flag-es"></img> Spanish'}, {code: 'fr', name: '<img class="flag flag-fr"></img> French'}, {code: 'de', name: '<img class="flag flag-de"></img> German'}, {code: 'nl', name: '<img class="flag flag-nl"></img> Dutch'}];
	$scope.formLinks = [];

	$scope.addLinkRow = function (link) {
		function linkModel(link) {
			if (!link) var link = {};
			this.url = '';
			this.media = link.media || $route.current.params.media;
			this.mediaId = link.mediaId || $route.current.params.id;
			this.language = link.language|| '';
			this.subtitles = link.subtitles || '';
			return this;
		}

		if (link) {
			console.log(link);
			var index = $scope.formLinks.indexOf(link);
			if (index + 1 == $scope.formLinks.length) {
				var newLink = new linkModel(link);
				$scope.formLinks.push(newLink);
			}
		}
		else $scope.formLinks.push(new linkModel());
	}

	$scope.submitLinks = function(links) {
		$http.post('/api/links', links)
			.success(function(data) {
				$alert({title: data.length + " links", content: "have been added", container: "body", duration: 3, container: '#linkAlertContainer',animation: "am-fade-and-slide-top", placement: 'top', type: 'success', show: true});
				//$scope.links.push(data);
				$scope.formLinks = [];
				$scope.addLinkRow();
			})
			.error(function (err) {
				$alert({title: err.msg, placement: 'top', duration: 3, container: '#linkAlertContainer', type: 'danger', show: true});
				$scope.err = err;
			});
	}

	$scope.$watch('mediaId', function () {
		if ($scope.mediaId) $scope.addLinkRow({media: $scope.media, mediaId: $scope.mediaId});
	});
}]);

controllers.controller('MovieController', ['$scope', '$route', '$http', '$alert', '$sce', '$localStorage', function ($scope, $route, $http, $alert, $sce, $localStorage) {
	$scope.$storage = $localStorage;
	$scope.$route = $route;


	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}

	$scope.reportLink = function () {
		if ($scope.currentLink) {
			$http.put('/api/links/' + $scope.currentLink._id + '/flag')
				.success(function (data) {
					$alert({title: "Thank you !", content: "The link has been reported", placement: 'top', duration: 5, container: '#movieAlertContainer', type: 'info', show: true});
				})
				.error(function (data) {
					$alert({title: "Error !", content: data.msg, placement: 'top', duration: 5, container: '#movieAlertContainer', type: 'warning', show: true});
				})
		}
	}
	$scope.changeLink = function (link) {
		$scope.currentLink = link;
	}
	$scope.showLink = function (link) {
		if (link != $scope.currentLink) {
			//check if user has
			if ($scope.$storage.user && $scope.$storage.user.settings && $scope.$storage.user.settings.subtitles && link.language) {
				//three combos authorized (original language/ original language + allowed subs / user main language)

				//check original language

				//check user main language
				if ($scope.$storage.user.settings.language == link.language) return true;

				//check allowed subs
				if ($scope.$storage.user.settings.subtitles.indexOf(link.subtitles) != -1) return true;
			}
			else return true;
		}
		else return false;
	}

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
			$scope.currentLink = $scope.links[0];
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

	//prevents reloading when changing episode
    var lastRoute = $route.current;
    $scope.$on('$locationChangeSuccess', function(event) {
    	if ($route.current.media == 'shows' && $route.current.params.id === lastRoute.params.id) $route.current = lastRoute;
    });

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
			
			$scope.newLink = {media: 'episodes', mediaId: $scope.currentEpisode.ID};

			//change url path
			$location.path('/shows/' + $route.current.params.id + '/season/' + $scope.currentEpisode.season_nb + '/episode/' + $scope.currentEpisode.episode_nb);

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

	$route.current.title = '@' + $route.current.params.username;
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
	$scope.languages = [{code: 'en', name: '<img class="flag flag-us"></img> English'}, {code: 'es', name: '<img class="flag flag-es"></img> Spanish'}, {code: 'fr', name: '<img class="flag flag-fr"></img> French'}, {code: 'de', name: '<img class="flag flag-de"></img> German'}, {code: 'nl', name: '<img class="flag flag-nl"></img> Dutch'}];
	
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