var app = angular.module('myapp', ['ngRoute', 'myapp.controllers', 'myapp.directives']);

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
