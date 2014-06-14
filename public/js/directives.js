var directives = angular.module('myapp.directives', []);

directives.directive('comments', function () {
    return {
        restrict: 'E',
        controller: 'CommentsController',
        templateUrl: '/partials/comments'
    };
});