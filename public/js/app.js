var app = angular.module('myapp', ['pascalprecht.translate', 'mgcrea.ngStrap', 'ngSanitize', 'ngRoute', 'ngStorage', 'infinite-scroll', 'myapp.controllers', 'myapp.directives', 'ngImgCrop']);

app.config(function ($routeProvider, $locationProvider, $translateProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			title: 'TITLE_HOME'
		})
		.when('/movies', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			media: 'movies',
			title: 'MOVIES'
		})
		.when('/shows', {
			templateUrl: '/partials/lists',
			controller: 'IndexController',
			media: 'shows',
			title: 'SHOWS'
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
			title: 'TITLE_LIST'
		})
		.when('/login', {
			templateUrl: '/partials/login',
			controller: 'LoginController',
			title: 'LOGIN'
		})
		.when('/logout', {
			templateUrl: '/partials/message',
			controller: 'LogoutController',
			title: 'LOGOUT'
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
			controller: 'ProfileController',
			media: 'users',
			title: 'TITLE_PROFILE'
		})
		.when('/links', {
			templateUrl: '/userpartials/links',
			controller: 'LinksController',
			title: 'MENU_LINKS'
		})
		.when('/lists', {
			templateUrl: '/userpartials/lists',
			controller: 'ListsController',
			title: 'MENU_LISTS'
		})
		.when('/settings', {
			templateUrl: '/userpartials/settings',
			controller: 'SettingsController',
			title: 'MENU_SETTINGS'
		})
		.when('/moderate', {
			templateUrl: '/protected/moderate',
			title: 'MENU_MODERATE'
		})
		.otherwise({
			redirectTo: '/'
		});

	$locationProvider.html5Mode(true);

	$translateProvider.translations('en', translation_en).translations('fr', translation_fr).fallbackLanguage("en");
	$translateProvider.preferredLanguage(window.localStorage['ngStorage-language'] || window.navigator.language || "en");
});
