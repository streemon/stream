var directives = angular.module('myapp.directives', []);

directives.directive('comments', function () {
    return {
        restrict: 'E',
        controller: 'CommentsController',
        templateUrl: '/partials/comments',
        scope: {
            media: '@',
            mediaId: '@'
        }
    };
});
directives.directive('linkform', function () {
    return {
        restrict: 'E',
        scope: {
            media: '@',
            mediaId: '@',
            originalLanguage: '@',
            prevEpisode: '=',
            nextEpisode: '='
        },
        controller: 'LinkFormController',
        templateUrl: '/partials/linkform'
    };
});
directives.directive('listform', function () {
    return {
        restrict: 'E',
        scope: {
            media: '@',
            mediaId: '@',
        },
        controller: 'ListFormController',
        templateUrl: '/partials/listform'
    };
});