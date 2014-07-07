var app = angular.module('myapp', ['pascalprecht.translate', 'mgcrea.ngStrap', 'ngSanitize', 'ngRoute', 'ngStorage', 'myapp.controllers', 'myapp.directives']);

app.config(function ($routeProvider, $locationProvider, $translateProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			title: 'Home'
		})
		.when('/movies', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			media: 'movies',
			title: 'Movies'
		})
		.when('/shows', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			media: 'shows',
			title: 'TV Shows'
		})
		.when('/search/movies/:q', {
			templateUrl: '/partials/search',
			controller: 'SearchController',
			media: 'movies',
			title: 'Search Movies'
		})
		.when('/search/shows/:q', {
			templateUrl: '/partials/search',
			controller: 'SearchController',
			media: 'shows',
			title: 'Search TV Shows'
		})
		.when('/lists/:id/:media?', {
			templateUrl: '/partials/list',
			controller: 'ListController',
			title: 'Playlist'
		})
		.when('/login', {
			templateUrl: '/partials/login',
			controller: 'LoginController',
			title: 'Log In'
		})
		.when('/logout', {
			templateUrl: '/partials/message',
			controller: 'LogoutController',
			title: 'Log Out'
		})
		.when('/movies/:id', {
			templateUrl: '/partials/movie',
			controller: 'MovieController',
			media: 'movies'
		})
		.when('/shows/:id', {
			templateUrl: '/partials/show',
			controller: 'ShowController',
			media: 'shows'
		})
		.when('/shows/:id/season/:season', {
			templateUrl: '/partials/show',
			controller: 'ShowController',
			media: 'shows'
		})
		.when('/shows/:id/season/:season/episode/:episode', {
			templateUrl: '/partials/show',
			controller: 'ShowController',
			media: 'shows'
		})
		.when('/users/@:username', {
			templateUrl: '/partials/profile',
			controller: 'ProfileController'
		})
		.when('/links', {
			templateUrl: '/userpartials/links',
			controller: 'LinksController',
			title: 'Manage Links'
		})
		.when('/settings', {
			templateUrl: '/userpartials/settings',
			controller: 'SettingsController',
			title: 'Settings'
		})
		.when('/moderate', {
			templateUrl: '/protected/moderate',
			title: 'Moderate'
		})
		.otherwise({
			redirectTo: '/'
		});

	$locationProvider.html5Mode(true);

	$translateProvider.translations('en', {
		COMMENT_PLACEHOLDER: 'Comment..',
		COMMENT_POSTEDON: 'Posted on',
		MENU_SETTINGS: 'Settings',
		MENU_LINKS: 'My Links',
		MENU_MODERATE: 'Moderate',
		MOVIES: 'Movies',
		SHOWS: 'TV Shows',
		EDITOR: 'Editor',
		LOGIN: 'Log In',
		LOGOUT: 'Log Out',
		SIGNUP: 'Sign Up',
		USERNAME: 'Username',
		PASSWORD: 'Password',
		SEARCH_RESULTSCOUNT: "{{count}} results for '{{query}}' in {{media | uppercase | translate}}"
	});
	$translateProvider.translations('fr', {
		COMMENT_PLACEHOLDER: 'Commenter..',
		COMMENT_POSTEDON: 'Publié le',
		MENU_SETTINGS: 'Préférences',
		MENU_LINKS: 'Mes Liens',
		MENU_MODERATE: 'Modérer',
		MOVIES: 'Films',
		SHOWS: 'Séries TV',
		EDITOR: 'Editeur',
		LOGIN: 'Connexion',
		LOGOUT: 'Déconnexion',
		SIGNUP: 'Inscription',
		USERNAME: "Nom d'utilisateur",
		PASSWORD: "Mot de passe",
		SEARCH_RESULTSCOUNT: "{{count}} résultats pour '{{query}}' dans les {{media | uppercase | translate}}"
	});
	$translateProvider.preferredLanguage('fr');
});
