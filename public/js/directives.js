var directives = angular.module('myapp.directives', []);

directives.directive('comments', function () {
    return {
        restrict: 'E',
        controller: 'CommentsController',
        templateUrl: '/partials/comments'
    };
});
directives.directive('linkform', function () {
    return {
        restrict: 'E',
        scope: {
        	media: '@',
        	mediaId: '@'
        },
        controller: 'LinkFormController',
        templateUrl: '/partials/linkform'
    };
});