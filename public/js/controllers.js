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
		if ($scope.$storage) {
			//alert($scope.$storage.language + " " + window.navigator.language)
			if (!$scope.$storage.language) $scope.$storage.language = window.navigator.language.substring(0,2);
			$translate.use($scope.$storage.language);
		}
	})

	$scope.search = function () {
		var query = this.q;
		if (!$route.current.media) {
			$route.current.media = 'movies';
			$scope.$storage.tryShows = true;
		}

		$location.path('/search/' + $route.current.media + '/' + query);
	}

	/*
	//Get notifications
	if ($scope.$storage.user && $scope.$storage.user.auth) {
		$http.get('/api/account/notifications')
			.success(function (data) {
				$scope.notifications = data;
			})
	} */
}]);

controllers.controller('IndexController', ['$scope', '$route', '$http', '$localStorage', '$q', function($scope, $route, $http, $localStorage, $q) {
	$scope.$storage = $localStorage;
	$scope.media = $route.current.media;
	$scope.lists = [];
	$scope.calledAddMore = false;
	$scope.moreLists = [{id: "5509cad5b3014e412c171246", media:"shows"}, {id: "51dcfe13760ee376102ae388", source: "tmdb"}, {id: "5399f3e50e0a260c0400030c", source: "tmdb"}, {id: "54cee1a287394cd9048889fe", media: "movies"}, {id: "509faf68760ee347d2000736", source: "tmdb"}, {id: "54408e79929fb858d1000052", source: "tmdb"},{"id":"5509cad5b3014e412c171246","media":"shows"},{"id":"55032336f991fa9215421e01","media":"shows"},{"id":"509ec17b19c2950a0600050d","media":"movies","source":"tmdb"},{"id":"5509cd32b3014e412c17125d","media":"shows"},{"id":"5509cc67b3014e412c171255","media":"shows"},{"id":"5094147819c2955e4c00006a","media":"movies","source":"tmdb"},{"id":"55086b4bb3014e412c1711d9","media":"shows"},{"id":"51224e42760ee3297424a1e0","media":"movies","source":"tmdb"},{"id":"55086d13b3014e412c1711eb","media":"shows"},{"id":"50a510fb760ee34f2c001574","media":"shows","source":"tmdb"},{"id":"5508695cb3014e412c1711ca","media":"shows"},{"id":"55086f63b3014e412c171207","media":"shows"},{"id":"55086bfdb3014e412c1711de","media":"shows"},{"id":"55086ed2b3014e412c1711ff","media":"shows"}]
			

	var listsToLoadFirst = [{id: "newReleases", media: "movies"}, {id: "newReleases", media: "shows"}, {id: "54db383f007f9fd68b2754b6", media: "shows"},{id: "54ac554592514163430016c9", source: "tmdb"}];

	//Add special lists (watchedRecently, lastAdded)
	if ($scope.$storage.watchedRecently.shows.items[0]) $scope.lists.push($scope.$storage.watchedRecently.shows);
	if ($scope.$storage.watchedRecently.movies.items[0]) $scope.lists.push($scope.$storage.watchedRecently.movies);

	loadList(listsToLoadFirst);

	function loadList (loadList) {
		for (var i=0; i < loadList.length; i++) {
			if (loadList[i].source == "tmdb") {
				theMovieDb.lists.getById(
					{"id": loadList[i].id, "language": $scope.$storage.language }, 
					function (data) {
						$scope.$apply(function () {
							var list = JSON.parse(data);
							list.media = "movies";
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
			else {
				var url = '/api/lists/' + loadList[i].id;
				if (loadList[i].media) url += '/' + loadList[i].media;

				$http.get(url)
				.success(function (data) {
					var items = [];
					var hardLimit = 6;
					//TODO async foreach
					for (var h = 0; h < data.items.length; h++) {
						//hard limit of 6 items per list
						if (h >= hardLimit) break;

						var promise = addItems(data.items[h]);

						promise.then(function(media) {
							items.push(media)

							//dirty check if last item has been processed
							if (items.length == data.items.length || items.length == hardLimit) {
								data.items = items;
								$scope.lists.push(data);
							}
						}, function(err) {
						  console.log('Failed: ' + err);
						});

					}
				})
			}
		}		
	}

	function addItems(item) {
	  var deferred = $q.defer();

		if (item.media == "shows") var tmdb = theMovieDb.tv;
		else var tmdb = theMovieDb.movies;

		tmdb.getById(
			{"id": item.mediaId, "language": $scope.$storage.language}, 
			function (doc) {
				if (doc) {
					var doc = JSON.parse(doc);
					doc.media = item.media;
					deferred.resolve(doc);
				}
			}, 
			function (err) {console.log(err)}
		);

	  return deferred.promise;
	}


	$scope.addMoreLists = function () {
		if ($scope.lists && !$scope.calledAddMore) {
			if ($scope.moreLists[0]) {
				$scope.calledAddMore = true;
				$scope.moreLists = shuffle($scope.moreLists);
				loadList($scope.moreLists.splice(0,3))
			}
			$scope.calledAddMore = false;
		}
	}
}]);


controllers.controller('ListController', ['$scope', '$route', '$http', '$localStorage', function($scope, $route, $http, $localStorage) {
	$scope.$storage = $localStorage;
	$scope.list = {};
	$scope.items = [];

	$http.get('/api/lists/' + $route.current.params.id)
		.success(function (data) {
			$scope.list = data;
		})
		.error(function (err) {
			//if not found on our db, we look at tmdb
			if (err.code == 1) {
				theMovieDb.lists.getById(
					{"id": $route.current.params.id, "language": $scope.$storage.language}, 
					function (data) {
						$scope.$apply(function () {
							$scope.list = JSON.parse(data);
							//TODO add option for shuffle
						})
					},
					function (err) {
						console.log(err);
					}
				)
			}
		})

	$scope.removeFromList = function (item) {
		if ($scope.list._authorId == $scope.$storage.user._id) {

			$http.delete("/api/lists/" + $scope.list._id + "/" + item._itemId)
				.success (function (data) {
					$scope.items.splice($scope.items.indexOf(item), 1);

				})
				.error( function(err) {

				})
		}
	}

	$scope.$watch("list", function() {
		if ($scope.list.items) {
			for (var i = 0; i < $scope.list.items.length; i++) {
				if ($scope.list.items[i].media == "shows") var tmdb = theMovieDb.tv;
				else var tmdb = theMovieDb.movies;

				var itemId = $scope.list.items[i]._id;
				var media = $scope.list.items[i].media;

				tmdb.getById(
					{"id": $scope.list.items[i].mediaId || $scope.list.items[i].id, "language": $scope.$storage.language, "append_to_response": "credits"}, 
					function (data) {
						$scope.$apply(function () {
							data = JSON.parse(data);
							data.media = media;
							data._itemId = itemId;

							$scope.items.push(data);
						});
					}, 
					function (err) {console.log(err)}
				);
			}
		}
	})
}]);

controllers.controller('LoginController', ['$scope', '$http', '$route', '$localStorage', '$location', '$alert', '$translate', function($scope, $http, $route, $localStorage, $location, $alert, $translate) {
	$scope.$storage = $localStorage;
	$scope.$route = $route;

	if ($scope.$route.current.params && $scope.$route.current.params.token) $scope.token = $scope.$route.current.params.token;

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
				$alert({title: $translate.instant(data.msg), placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
			});
	}

	$scope.signup = function () {
		var credentials = {
			email: this.email,
			username: this.username2,
			password: this.password2,
			language: $scope.$storage.language
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
				console.log(data);
				["username", "email", "password"].forEach(function (field) {
					if (data.errors && data.errors[field]) {
						$alert({title: $translate.instant(data.errors[field].message), placement: 'top', duration: 3, container: '#alertContainer', type: 'danger', show: true});
					}
				})
			})
	}

	$scope.resetPassword = function () {
		if ($scope.token && this.newPassword) {
			$http.post('/api/tokens', {token: $scope.token, newPassword: this.newPassword})
				.success (function (data)  {
					$alert({title: $translate.instant(data.msg), placement: 'top', duration: 10, container: '#alertContainer', type: 'success', show: true});
				})
				.error (function (err) {
					$alert({title: $translate.instant(err.msg), placement: 'top', duration: 6, container: '#alertContainer', type: 'danger', show: true});
				})
		}
	}
	$scope.generateToken = function () {
		if (this.email) {
			$http.get('/api/tokens/' + this.email)
				.success (function (data) {
					$alert({title: $translate.instant(data.msg), placement: 'top', duration: 6, container: '#alertContainer', type: 'info', show: true});
				})
				.error (function (err) {
					$alert({title: $translate.instant(err.msg), placement: 'top', duration: 6, container: '#alertContainer', type: 'danger', show: true});
				})
		}
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

controllers.controller('SearchController', ['$scope', '$route', '$http', '$localStorage', '$location', '$alert', function ($scope, $route, $http, $localStorage, $location, $alert) {
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
				function (err) {
					$scope.err = err;
					$alert({title: "Query error", content: err.status_message, placement: 'top', duration: 20, container: '#searchAlertContainer', type: 'danger', show: true});
				}
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

	$scope.$watch("mediaId", function () {	
		if($scope.mediaId) {
			$http.get('/api/'+ $scope.media +'/' + $scope.mediaId + '/comments')
			.success(function(data) {
				$scope.comments = data;
			})
			.error(function(err) {
				$scope.err = err;
			})
		}
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
			media: $scope.media,
			mediaId: $scope.mediaId
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
controllers.controller('ListFormController', ['$scope', '$http', '$route', '$localStorage', '$alert', '$sce', function ($scope, $http, $route, $localStorage, $alert, $sce) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
	$scope.inList = [];
	$scope.userLists = {items: []};

	$scope.addNewList = function (listTitle) {
		//creates new list
		$http.post('/api/lists', {title: listTitle, media: $scope.media, mediaId: $route.current.params.id})
			.success(function (data) {
				$scope.newList = "";
				$scope.userLists.items.push(data);
			})
			.error(function (data) {

			})
	}

	$scope.toggleItemList = function (listIndex) {
		//adds or remove item to/from list
		if ($scope.inList[listIndex]) {
			$http.delete('/api/lists/' + $scope.userLists.items[listIndex]._id + '/' + $scope.inList[listIndex])
			.success (function (data) {
				//$scope.$apply(function () {
					$scope.userLists.items[listIndex] = data;
				//})
			})
			.error(function (err) {
				$alert({title: $translate.instant("ALERT_ERROR"), content: err, placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'warning', show: true});
			})
		}
		else {
			//adds a media to a list
			$http.put('/api/lists/' + $scope.userLists.items[listIndex]._id, {media: $scope.listMedia || $scope.media, mediaId: $scope.listMediaId || $scope.mediaId})
			.success(function (data) {
				$scope.userLists.items[listIndex] = data;
			})
			.error(function (err) {
				$alert({title: $translate.instant("ALERT_ERROR"), content: err, placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'warning', show: true});
			})
		}
	}

	$scope.$watch("userLists", function () {
		if ($scope.userLists.items) {
			for (var i=0; i < $scope.userLists.items.length; i++) {
		        var val = false;
		        angular.forEach($scope.userLists.items[i].items, function (item) {
		        	if (item.media == $scope.media && item.mediaId == parseInt($route.current.params.id)) {
		            	val = item._id;
		            }
		        });
		        $scope.inList[i] = val;
			}
		}
    }, true)

	if ($scope.$storage.user) {
		$http.get('/api/account/lists')
			.success (function (data) {
				$scope.userLists = data;
			})
			.error (function (err) {
				$scope.err = err;
			})
	}
	
}])
controllers.controller('LinkFormController', ['$scope', '$http', '$route', '$localStorage', '$alert', '$sce', '$translate', function ($scope, $http, $route, $localStorage, $alert, $sce, $translate) {
	$scope.$route = $route;
	$scope.$storage = $localStorage;
	$scope.languages = languagesAllowed;
	$scope.sub_languages = languagesAllowed.slice();
	$scope.showAllLinks = false;
	$scope.loaded = false;
	$scope.formLinks = [];
	$scope.toggleLinks = function() { $scope.showAllLinks = !$scope.showAllLinks; }

	$scope.getCurrentLink = function () {
		for (var i=0; i<$scope.links.length; i++) {
			if ($scope.showLink($scope.links[i])) return $scope.links[i];
		}
		return false;
	}

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}

	$scope.reportLink = function (reason) {
		if ($scope.currentLink) {
			$http.put('/api/links/' + $scope.currentLink._id + '/flag', {reason: reason})
				.success(function (data) {
					$alert({title: $translate.instant("ALERT_THANKYOU"), content: $translate.instant("ALERT_LINKREPORTED"), placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'info', show: true});
				})
				.error(function (data) {
					$alert({title: $translate.instant("ALERT_ERROR"), content: data.msg, placement: 'top', duration: 5, container: '#reportAlertContainer', type: 'warning', show: true});
				})
		}
	}
	$scope.changeLink = function (link, $event) {
		$event.preventDefault()
		$scope.currentLink = link;
	}
	$scope.showLink = function (link) {
			//check if user has
			if ($scope.$storage.user && $scope.$storage.user.settings && $scope.$storage.user.settings.subtitles && link.language) {
				//three combos authorized (original language/ original language + allowed subs / user main language)

				//check original language
				if ($scope.originalLanguage == link.language) return true;

				//check user main language
				if ($scope.$storage.user.settings.language == link.language) return true;

				//check allowed subs
				if ($scope.$storage.user.settings.subtitles.indexOf(link.subtitles) != -1 && $scope.originalLanguage == link.language) return true;
			}
			else return true;
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
				$alert({title: data.length + $translate.instant("ALERT_LINKSADDED"), container: "body", duration: 3, container: '#linkAlertContainer',animation: "am-fade-and-slide-top", placement: 'top', type: 'success', show: true});
				$scope.links.push(data);
				$scope.formLinks = [];
				$scope.addLinkRow();
			})
			.error(function (err) {
				console.log(err);
				err.errors.forEach(function (error) {
					$alert({title: $translate.instant(error.err), placement: 'top', duration: 3, container: '#linkAlertContainer', type: 'danger', show: true});
				})
			});
	}

	$scope.deleteLink = function (link, isCurrentLink) {
		$http.delete('/api/links/' + link._id).success(function (data) {
			$scope.links.splice($scope.links.indexOf(link), 1);
			if (isCurrentLink && $scope.links[0]) {$scope.currentLink = $scope.getCurrentLink();
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
					$scope.currentLink = $scope.getCurrentLink();
					$scope.loaded = true;
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
				if ($scope.movie.poster_path) $scope.movie.poster_path = 'https://image.tmdb.org/t/p/w342' + $scope.movie.poster_path;
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
				$scope.show.poster_path = 'https://image.tmdb.org/t/p/w342' + $scope.show.poster_path;
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
			$route.current.id = data.id;
		})
		.error(function (err) {
			$scope.err = err;
		});
}]);

controllers.controller('SettingsController', ['$scope', '$http', '$route', '$localStorage', '$location', '$alert', '$translate', function ($scope, $http, $route, $localStorage, $location, $alert, $translate) {
	$scope.$storage = $localStorage;
	$scope.$route = $route;
	$scope.languages = languagesAllowed;
    $scope.myImage= $scope.$storage.user.avatar || '';
    $scope.myCroppedImage = '';
	
	//if user is not identified
	if (!$scope.$storage.user || !$scope.$storage.user.auth) return $location.path('/');

	$scope.form = {};
	if ($scope.$storage.user.settings) $scope.form.settings = $scope.$storage.user.settings;


    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
        	console.log(evt.target.result);

         	$scope.myImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };

    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

    $scope.uploadImage = function () {
    	if ($scope.myCroppedImage) {
	    	$http.post('/api/account/upload', {avatar: $scope.myCroppedImage})
	    		.success( function (data) {
	    			console.log(data);

	    			$scope.$storage.user.avatar = data.src;

	     			$alert({title: $translate.instant(data.msg), placement: 'top', duration: 4, container: '#alertContainer', type: 'success', show: true});
			
	    		})
	    }
	    else {
	    	alert("No image !");
	    }
    }

	$scope.saveSettings = function () {
		$http.put('/api/account', $scope.form)
			.success(function (data) {
				$scope.$storage.language = $localStorage.user.settings.language;

				$alert({title: $translate.instant(data.msg), placement: 'top', duration: 4, container: '#alertContainer', type: 'success', show: true});
			})
			.error (function (data) {
				$alert({title: $translate.instant(data.msg), placement: 'top', duration: 4, container: '#alertContainer', type: 'danger', show: true});
			})
	}

}]);

controllers.controller('LinksController', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {
	$scope.$storage = $localStorage;
	var pagesBuffer = 3;
	var url = '/api/account/links';

	$scope.deleteLink = function(link) {
		$http.delete('/api/links/' + link._id).success(function (data) {
			$scope.links.items.splice($scope.links.items.indexOf(link), 1);
		});
	}

	//if user is not identified
	if (!$scope.$storage.user || !$scope.$storage.user.auth) return $location.path('/');

	$http.get(url, {params: {p: $location.search().page}})
		.success(function (data) {
			$scope.links = data;
			$scope.nbOfPages = Math.ceil(data.count / data.limit);
			$scope.pages = new Array($scope.nbOfPages);
		})
		.error(function (err) {
			$scope.err = err;
		})

}]);

controllers.controller('ListsController', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {
	$scope.$storage = $localStorage;

	$scope.deleteList = function(list) {
		$http.delete('/api/lists/' + list._id).success(function (data) {
			$scope.lists.items.splice($scope.lists.items.indexOf(list), 1);
		});
	}

	//if user is not identified
	if (!$scope.$storage.user || !$scope.$storage.user.auth) return $location.path('/');

	$http.get('/api/account/lists')
		.success(function (data) {
			$scope.lists = data;
			$scope.nbOfPages = Math.ceil(data.count / data.limit);
			$scope.pages = new Array($scope.nbOfPages);
		})
		.error(function (err) {
			$scope.err = err;
		})

}]);
