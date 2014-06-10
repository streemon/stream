var app = angular.module('myapp', ['ngRoute', 'ngStorage', 'myapp.controllers', 'myapp.directives']);

app.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
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
		.when('/shows/:hashtag', {
			templateUrl: '/partials/show',
			controller: 'ShowController',
			media: 'shows'
		})
		.when('/shows/:hashtag/season/:season/episode/:episode', {
			templateUrl: '/partials/show',
			controller: 'ShowController',
			media: 'shows'
		})
		.when('/links', {
			templateUrl: '/partials/links',
			controller: 'LinksController'
		})
		.when('/settings', {
			templateUrl: '/partials/settings',
			controller: 'SettingsController'
		})
		.when('/settings', {
			templateUrl: '/moderate',
			controller: 'ModerateController'
		})
		.otherwise({
			redirectTo: '/'
		});

	$locationProvider.html5Mode(true);
});
