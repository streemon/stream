var app = angular.module('myapp', ['pascalprecht.translate', 'mgcrea.ngStrap', 'ngSanitize', 'ngRoute', 'ngStorage', 'myapp.controllers', 'myapp.directives']);
var languagesAllowed = [{code: 'en', name: '<img class="flag flag-us"></img> English'}, {code: 'es', name: '<img class="flag flag-es"></img> Spanish'}, {code: 'fr', name: '<img class="flag flag-fr"></img> French'}, {code: 'de', name: '<img class="flag flag-de"></img> German'}, {code: 'nl', name: '<img class="flag flag-nl"></img> Dutch'}];
	
var translation_en = {
	COMMENT_PLACEHOLDER: 'Comment..',
	COMMENT_POSTEDON: 'Posted on',
	MENU_SETTINGS: 'Settings',
	MENU_LINKS: 'My Links',
	MENU_MODERATE: 'Moderate',
	FLAG_en: '<img class="flag flag-us"></img> English',
	FLAG_fr: '<img class="flag flag-fr"></img> French',
	FLAG_de: '<img class="flag flag-de"></img> German',
	FLAG_nl: '<img class="flag flag-nl"></img> Dutch',
	FLAG_es: '<img class="flag flag-es"></img> Spanish',
	ADDLINKS_TITLE: 'Add Links',
	TITLE_HOME: 'Home',
	TITLE_PROFILE: 'Profile',
	TITLE_LIST: 'Playlist',
	MOVIES: 'Movies',
	MOVIES_SINGULAR: 'movie',
	SHOWS: 'TV Shows',
	SHOWS_SINGULAR: 'TV show',
	LINKS: 'Links',
	REPORT: 'Report',
	ADD: 'Add',
	EDITOR: 'Editor',
	LOGIN: 'Log In',
	LOGOUT: 'Log Out',
	SIGNUP: 'Sign Up',
	ALERT_NOLINK: '<strong>No link!</strong> Please <a href="#" title="Add link" data-toggle="modal" data-target="#formlinkModal">add one</a> or come back later...',
	ALERT_LOADING: '<strong>Loading!</strong> The movie will appear in a few seconds...',
	ALERT_LOGINTOCOMMENT: '<strong>Log In</strong> to send a comment !',
	FORM_USERNAME: 'Username',
	FORM_PASSWORD: 'Password',
	FORM_SUBTITLES: 'Subtitles',
	FORM_SAVE: 'Save changes',
	FORM_FOLLOW: 'Follow',
	FORM_MAINLANGUAGE: 'Main Language',
	LIST_MOSTWATCHED: "Most Watched {{media | uppercase | translate}}",
	LIST_WATCHEDRECENTLY: "{{media | uppercase | translate}} You Watched Recently",
	LIST_NEWRELEASES: "New Releases",
	SEARCH_RESULTSCOUNT: "{{count}} results for '{{query}}' in {{media | uppercase | translate}}"
}

var translation_fr = {
	COMMENT_PLACEHOLDER: 'Commenter..',
	COMMENT_POSTEDON: 'Publié le',
	MENU_SETTINGS: 'Préférences',
	MENU_LINKS: 'Mes Liens',
	MENU_MODERATE: 'Modérer',
	FLAG_en: '<img class="flag flag-us"></img> Anglais',
	FLAG_fr: '<img class="flag flag-fr"></img> Français',
	FLAG_de: '<img class="flag flag-de"></img> Allemand',
	FLAG_nl: '<img class="flag flag-nl"></img> Néerlandais',
	FLAG_es: '<img class="flag flag-es"></img> Espagnol',
	ADDLINKS_TITLE: 'Ajouter des liens',
	MOVIES: 'Films',
	MOVIES_SINGULAR: 'film',
	SHOWS: 'Séries TV',
	SHOWS_SINGULAR: 'série TV',
	LINKS: 'Liens',
	REPORT: 'Signaler',
	ADD: 'Ajouter',
	EDITOR: 'Editeur',
	LOGIN: 'Connexion',
	LOGOUT: 'Déconnexion',
	SIGNUP: 'Inscription',
	ALERT_NOLINK: '<strong>Aucun lien!</strong> Ajoutez-en un ou revenez plus tard…',
	ALERT_LOADING: '<strong>Chargement!</strong> Votre vidéo appraîtra dans quelques secondes…',
	FORM_USERNAME: "Nom d'utilisateur",
	FORM_PASSWORD: "Mot de passe",
	FORM_SUBTITLES: 'Sous-titres',
	FORM_SAVE: 'Enregistrer',
	SEARCH_RESULTSCOUNT: "{{count}} résultats pour '{{query}}' dans les {{media | uppercase | translate}}"
}

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
			title: 'TITLE_PROFILE'
		})
		.when('/links', {
			templateUrl: '/userpartials/links',
			controller: 'LinksController',
			title: 'MENU_LINKS'
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
