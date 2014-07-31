/**
 * Created by aalanis on 7/30/2014.
 */
(function(){
    var app = angular.module("JIRAVisual");
    var LoginController = function($scope, $rootScope, $http, $location) {
        // This object will be filled by the form
        $scope.user = {};

        // Register the login() function
        $scope.login = function () {
            $http.post('/login', {
                username: $scope.user.username,
                password: $scope.user.password,
                domain: $scope.user.domain
            })
                .success(function (user) {
                    // No error: authentication OK
                    $rootScope.message = 'Authentication successful!';
                    $location.url('/jira');
                })
                .error(function () {
                    // Error: authentication failed
                    $rootScope.message = 'Authentication failed.';
                    $location.url('/login');
                });
        };
    }
    app.controller("LoginController", ["$scope", "$rootScope", "$http","$location", LoginController]);
}());