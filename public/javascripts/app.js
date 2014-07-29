(function(){
  
  var app = angular.module("JIRAVisual", ["ngRoute", "ui.bootstrap"]);
  
  app.config(function($routeProvider){
    $routeProvider
      .when("/demo", {
        templateUrl: "demo.html",
        controller: "MainController"
      })
      .otherwise({redirectTo: "/demo"})
  });
  


  
}());

