var services = angular.module('myapp.services', []);

services.factory('UserService', [function() {
	var factory = {}

	var defaults = {
		auth: false,
		username: '',
		avatar: ''
	};

	factory.data = defaults;

	factory.logIn = function (userData) {
		factory.data = userData;
	}

	factory.logOut = function () {
		factory.data = defaults;
	}

	return factory;
}])