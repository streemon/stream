var controllers = angular.module('myapp.controllers', []);

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

controllers.controller('MainController', ['$scope','$route', '$http', '$location', '$localStorage', '$translate', function($scope, $route, $http, $location, $localStorage, $translate) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
	$scope.languages = languagesAllowed;

	//init
	if (typeof $scope.$storage.watchedRecently === 'undefined') {
		$scope.$storage.watchedRecently = {
			movies: {name: "LIST_WATCHEDRECENTLY", url: "recent", media: "movies", items: [], itemsIds: []},
			shows: {name: "LIST_WATCHEDRECENTLY", url: "recent", media: "shows", items: [], itemsIds: []}
		}
	}

	$scope.$watch("$storage.language", function () {
		if (!$scope.$storage.language) $scope.$storage.language = window.navigator.language;
		$translate.use($scope.$storage.language);
	})

	$scope.search = function () {
		var query = this.q;
		if (!$route.current.media) {
			$route.current.media = 'movies';
			$scope.$storage.tryShows = true;
		}

		$location.path('/search/' + $route.current.media + '/' + query);
	}

	if ($scope.$storage.user && $scope.$storage.user.auth) {
		$http.get('/api/account/notifications')
			.success(function (data) {
				$scope.notifications = data;
			})
	}
}]);

controllers.controller('IndexController', ['$scope', '$route', '$http', '$localStorage', function($scope, $route, $http, $localStorage) {
	$scope.$storage = $localStorage;
	var listIds = ["54ac554592514163430016c9", "54408e79929fb858d1000052", "509faf68760ee347d2000736"];
	$scope.lists = [];
	$scope.calledAddMore = false;

	//Add special lists (watchedRecently, lastAdded)
	$scope.lists.push($scope.$storage.watchedRecently.shows);
	$scope.lists.push($scope.$storage.watchedRecently.movies);

	for (var i=0; i < listIds.length; i++) {
		theMovieDb.lists.getById(
			{"id": listIds[i], "language": $scope.$storage.language }, 
			function (data) {
				$scope.$apply(function () {
					var list = JSON.parse(data);
					//TODO add option for shuffle
					list.items = shuffle(list.items);
					$scope.lists.push(list);
				})
			},
			function (err) {
				console.log(err);
			}
		)
	}
	$scope.addMoreLists = function () {
		if ($scope.lists && !$scope.calledAddMore) {
			$scope.calledAddMore = true;
			/*
			$http.get('/api/lists/random').success(function (data) {
				$scope.lists = $scope.lists.concat(data);
				$scope.calledAddMore = false;
			}) */
		}
	}
}]);


controllers.controller('ListController', ['$scope', '$route', '$http', '$localStorage', function($scope, $route, $http, $localStorage) {
	$scope.$storage = $localStorage;

	theMovieDb.lists.getById(
		{"id": $route.current.params.id, "language": $scope.$storage.language }, 
		function (data) {
			$scope.$apply(function () {
				$scope.list = JSON.parse(data);
				//TODO add option for shuffle
				//list.items = shuffle(list.items);
			})
		},
		function (err) {
			console.log(err);
		}
	)
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
				
				if (data.user.settings && data.user.settings.language && data.user.settings.language != $scope.$storage.language) {
					$scope.$storage.language = data.user.settings.language;
				}

				$scope.$storage.user = data.user;

				return $location.path('/');
			})
			.error(function (data) {
				$alert({title: data.msg, placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
			});
	}

	$scope.signup = function () {
		var credentials = {
			email: this.email,
			username: this.username2,
			password: this.password2
		}

		$http.post('/api/signup', credentials)
			.success(function (data) {
				$scope.$storage = $localStorage;
				$scope.data = data;
				
				if (data.user.settings && data.user.settings.language && data.user.settings.language != $scope.$storage.language) {
					$scope.$storage.language = data.user.settings.language;
				}

				$scope.$storage.user = data.user;

				return $location.path('/');
			})
			.error(function (data) {
				$alert({title: data.msg, placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
			})
	}
}]);

controllers.controller('LogoutController', ['$scope', '$http', '$localStorage', function ($scope, $http, $localStorage) {
	//deleter user session 
	$scope.$storage.user = null;
	
	$http.get('/api/logout').success(function(data) {
		$scope.$storage = $localStorage;
		$scope.data = data;
	});
}]);

controllers.controller('SearchController', ['$scope', '$route', '$http', '$localStorage', '$location', function ($scope, $route, $http, $localStorage, $location) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;

	function searchTMDB () {
		if ($route.current.media == 'shows') var m = theMovieDb.search.getTv;
		else if ($route.current.media == 'movies') var m = theMovieDb.search.getMovie;

		if (m) {
			m(
				{"query": $route.current.params.q, "language": $scope.$storage.language}, 
				function (data) {
					$scope.$apply(function () {
						$scope.searchResults = JSON.parse(data);
						if ($scope.searchResults.total_results == 0 && $scope.$storage.tryShows == true) {
							$route.current.media = "shows";
							$location.path("/search/shows/" + $route.current.params.q);
						} 

						$scope.$storage.tryShows = false;
						$scope.searchResults.query = $route.current.params.q;
					});
				}, 
				function (err) {console.log(err)}
			);
		}
	}

	searchTMDB();
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

controllers.controller('LinkFormController', ['$scope', '$http', '$route', '$localStorage', '$alert', '$sce', function ($scope, $http, $route, $localStorage, $alert, $sce) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
	$scope.languages = languagesAllowed;
	$scope.sub_languages = languagesAllowed.slice();
	$scope.showAllLinks = false;
	$scope.formLinks = [];

	$scope.toggleLinks = function() { $scope.showAllLinks = !$scope.showAllLinks; }

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}

	$scope.reportLink = function (reason) {
		if ($scope.currentLink) {
			$http.put('/api/links/' + $scope.currentLink._id + '/flag', {reason: reason})
				.success(function (data) {
					$alert({title: "Thank you !", content: "The link has been reported", placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'info', show: true});
				})
				.error(function (data) {
					$alert({title: "Error !", content: data.msg, placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'warning', show: true});
				})
		}
	}
	$scope.changeLink = function (link) {
		$scope.currentLink = link;
	}
	$scope.showLink = function (link) {
		if (link != $scope.currentLink) {
			return true; //tmp
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

	$scope.addLinkRow = function (link) {
		function linkModel(link) {
			if (!link) var link = {};
			this.url = '';
			this.media = link.media || $scope.media;
			this.mediaId = link.mediaId || $scope.mediaId || $route.current.params.id;
			this.language = link.language|| '';
			this.subtitles = link.subtitles || '';
			return this;
		}

		if (link) {
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
				$scope.links.push(data);
				$scope.formLinks = [];
				$scope.addLinkRow();
			})
			.error(function (err) {
				$alert({title: err.msg, placement: 'top', duration: 3, container: '#linkAlertContainer', type: 'danger', show: true});
				$scope.err = err;
			});
	}

	$scope.deleteLink = function (link, isCurrentLink) {
		$http.delete('/api/links/' + link._id).success(function (data) {
			$scope.links.splice($scope.links.indexOf(link), 1);
			if (isCurrentLink && $scope.links[0]) {$scope.currentLink = $scope.links[0];
			}
			else $scope.currentLink = null;
		});
	}

	$scope.$watch('mediaId', function () {
		if ($scope.mediaId) {
			$scope.formLinks = [];
			$scope.addLinkRow({media: $scope.media, mediaId: $scope.mediaId});

			$http.get('/api/' + $scope.media + '/' + $scope.mediaId + '/links')
				.success(function (data) {
					$scope.links = data;
					$scope.currentLink = $scope.links[0];
				})
				.error(function (err) {
					$scope.err = err;
				});
		}
	});

}]);

controllers.controller('MovieController', ['$scope', '$route', '$http', '$alert', '$localStorage', function ($scope, $route, $http, $alert, $localStorage) {
	$scope.$storage = $localStorage;
	$scope.$route = $route;

	theMovieDb.movies.getById(
		{"id": $route.current.params.id, "language": $scope.$storage.language, "append_to_response": "credits"}, 
		function (data) {
			$scope.$apply(function () {
				$scope.movie = JSON.parse(data);
				if ($scope.movie.poster_path) $scope.movie.poster_path = 'http://image.tmdb.org/t/p/w342' + $scope.movie.poster_path;
				$route.current.title = $scope.movie.title;

				var index = $scope.$storage.watchedRecently.movies.itemsIds.indexOf($scope.movie.id);
				if (index > -1) {
					$scope.$storage.watchedRecently.movies.items.splice(index,1);
					$scope.$storage.watchedRecently.movies.itemsIds.splice(index,1);
				}
				$scope.$storage.watchedRecently.movies.itemsIds.unshift($scope.movie.id)
				$scope.$storage.watchedRecently.movies.items.unshift($scope.movie);
			});
		}, 
		function (err) {console.log(err)}
	);
}]);

controllers.controller('ShowController', ['$scope', '$route', '$http', '$location', '$localStorage', function($scope, $route, $http, $location, $localStorage) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
	$scope.seasons = [];
	$scope.currentEpisode = {}
	$scope.currentEpisode.season_number = parseInt($route.current.params.season) || 1;
	$scope.currentEpisode.episode_number = parseInt($route.current.params.episode) || 1;

	theMovieDb.tv.getById(
		{"id": $route.current.params.id, "language": $scope.$storage.language, "append_to_response": "credits"}, 
		function (data) {
			$scope.$apply(function () {
				$scope.show = JSON.parse(data);
				$scope.show.poster_path = 'http://image.tmdb.org/t/p/w342' + $scope.show.poster_path;
				$route.current.title = $scope.show.name;

				var index = $scope.$storage.watchedRecently.shows.itemsIds.indexOf($scope.show.id);
				if (index > -1) {
					$scope.$storage.watchedRecently.shows.items.splice(index,1);
					$scope.$storage.watchedRecently.shows.itemsIds.splice(index,1);
				}
				$scope.$storage.watchedRecently.shows.itemsIds.unshift($scope.show.id)
				$scope.$storage.watchedRecently.shows.items.unshift($scope.show);
			});
		}, 
		function (err) {console.log(err)}
	);

	//prevents reloading when changing episode
    var lastRoute = $route.current;
    $scope.$on('$locationChangeSuccess', function(event) {
    	if ($route.current.media == 'shows' && $route.current.params.id === lastRoute.params.id) $route.current = lastRoute;
    });

	$scope.changeSeason = function (season_number) {
		$scope.currentEpisode.season_number = season_number;
	}
	$scope.changeEpisode = function (episode) {
		$scope.currentEpisode = episode;
	}

	$scope.prevEpisode = function () {
		if ($scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number - 2]) $scope.currentEpisode = $scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number - 2];
		else if ($scope.seasons[$scope.currentEpisode.season_number - 1]) {
			console.log("b");
			var s = $scope.currentEpisode.season_number - 1;
			var e = $scope.seasons[s].episodes.length;
			$scope.currentEpisode = $scope.seasons[s].episodes[e];
		}
		else {
			console.log("c");
			$scope.currentEpisode.season_number = $scope.currentEpisode.season_number - 1;
			$scope.currentEpisode.episode_last = true;
		}
	}
	$scope.nextEpisode = function () {
		if ($scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number]) $scope.currentEpisode = $scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number];
		else if ($scope.currentEpisode.season_number + 1 < $scope.show.seasons.length) {
			$scope.currentEpisode.season_number = $scope.currentEpisode.season_number + 1;
			$scope.currentEpisode.episode_number = 1;
		}
	}

	$scope.$watch('currentEpisode', function() {
		if (typeof $scope.currentEpisode !== 'undefined' &&typeof $scope.currentEpisode.season_number !== 'undefined' && typeof $scope.currentEpisode.episode_number !== 'undefined') {
			//load season if not already done
			if (typeof $scope.seasons[$scope.currentEpisode.season_number] === 'undefined') {
				theMovieDb.tvSeasons.getById(
					{"id": $route.current.params.id, "season_number": $scope.currentEpisode.season_number, "language": $scope.$storage.language}, 
					function (seasonData) {
						$scope.$apply(function () {
							seasonData = JSON.parse(seasonData);
							if (seasonData && seasonData.episodes.length) {
								$scope.seasons[seasonData.episodes[0].season_number] = seasonData;


								console.log("a")
								if ($scope.currentEpisode.episode_last) {
									var e = $scope.seasons[$scope.currentEpisode.season_number].episodes.length - 1;
									$scope.currentEpisode = $scope.seasons[$scope.currentEpisode.season_number].episodes[e];
									$scope.currentEpisode.episode_last = false;
								}
								else if ($scope.seasons[$scope.currentEpisode.season_number] && $scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number - 1]) {
									$scope.currentEpisode = $scope.seasons[$scope.currentEpisode.season_number].episodes[$scope.currentEpisode.episode_number - 1];
								}
							}
						})
					},
					function (err) {
						console.log(err);
					}
				)
			}
			
			//change url path
			$location.path('/shows/' + $route.current.params.id + '/season/' + $scope.currentEpisode.season_number + '/episode/' + $scope.currentEpisode.episode_number);
			//change title
			if ($scope.show) $route.current.title = $scope.show.name + " S" + $scope.currentEpisode.season_number + "E" + $scope.currentEpisode.episode_number;
		}
	}, true);

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
	$scope.$storage = $localStorage;
	$scope.languages = languagesAllowed;
	
	//if user is not identified
	if (!$scope.$storage.user || !$scope.$storage.user.auth) return $location.path('/');

	$scope.form = {};
	if ($scope.$storage.user.settings) $scope.form.settings = $scope.$storage.user.settings;

	$scope.saveSettings = function () {
		$http.put('/api/account', $scope.form)
			.success(function (data) {
				$scope.$storage.language = $localStorage.user.settings.language;

				$alert({title: data.msg, placement: 'top', duration: 4, container: '#alertContainer', type: 'success', show: true});
			})
			.error (function (data) {
				$alert({title: data.msg, placement: 'top', duration: 4, container: '#alertContainer', type: 'danger', show: true});
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