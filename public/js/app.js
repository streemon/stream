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
	        media: 'movies',
	        title: 'Movies'
	    })
	    .when('/shows/:id', {
	        templateUrl: '/partials/show',
	        controller: 'ShowController',
	        media: 'shows'
	    })
	    .otherwise({
	        redirectTo: '/'
	    });

    $locationProvider.html5Mode(true);
});
