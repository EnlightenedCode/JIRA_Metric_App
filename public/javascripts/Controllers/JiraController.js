(function(){
    var app = angular.module("JIRAVisual");

    var JiraController = function($scope, jiraSvc,  $http , $log, $q, $timeout) {



        //============= helper functions
        function padStr(i){
            return (i < 10) ? "0" + i : "" + i;
        }
        //============= helper functions

        //============= variable initializations
        $scope.iterations = [];
        $scope.averages = {
            bugsFound: 0,
            reopens: 0,
            features: 0,
            extraHrs: 0,
            qaScore: 0,
            days: 0
        };
        var iterationCount = 0;
        var iterationToAdd = {
            iterationId: 0,
            startDate: undefined,
            endDate: undefined,
            bugs: 0,
            reopens: 0,
            features: 0,
            extraHrs: 0,
            qaScore: 0,
            days: 0
        };
        var bugsFoundSum = 0;
        var reopensSum = 0;
        var featuresSum = 0;
        var extraHrsSum = 0;
        var qaScoreSum = 0;
        var daysSum = 0;
        var stringStartDate;
        var stringEndDate;

        //============= variable initializations

        //============= datepicker configurations
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
        $scope.open2 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened2 = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        //$scope.alerts.push({msg: "BLAHHHH"});
        $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        //============= datepicker configurations




        $scope.submit = function() {
            jiraSvc.login();
        };

        var bugsComplete = function(data){
            //$log.info("Getting data: " + data.length);
            iterationToAdd.bugs = data.total;
            jiraSvc.getReopens(stringStartDate, stringEndDate, $scope.iteration.projectId).then(reopensComplete, onError);
        };

        var reopensComplete = function(data){
            //$log.info("Getting data: " + data[0].total);
            iterationToAdd.reopens = data.total;
            iterationToAdd.extraHrs = jiraSvc.getExtraHrs();
            jiraSvc.getFeatures(stringStartDate, stringEndDate, $scope.iteration.projectId).then(featuresComplete, onError);
        };

        var featuresComplete = function(data){
            //$log.info("Getting data: " + data.lengt;
            iterationToAdd.features = data.total;
            iterationToAdd.qaScore = jiraSvc.getQAScore();
            iterationToAdd.days = jiraSvc.workingDaysBetweenDates(new Date($scope.iteration.startDate),new Date($scope.iteration.endDate));

            bugsFoundSum += iterationToAdd.bugs;
            reopensSum += iterationToAdd.reopens;
            featuresSum += iterationToAdd.features;
            extraHrsSum += iterationToAdd.extraHrs;
            qaScoreSum += iterationToAdd.qaScore;
            daysSum += iterationToAdd.days;

            $scope.averages.bugsFound = bugsFoundSum / iterationCount;
            $scope.averages.reopens = reopensSum / iterationCount;
            $scope.averages.features = featuresSum / iterationCount;
            $scope.averages.extraHrs = extraHrsSum / iterationCount;
            $scope.averages.qaScore = qaScoreSum / iterationCount;
            $scope.averages.days = daysSum / iterationCount;

            $scope.iterations.push({
                iterationId: iterationCount,
                startDate: $scope.iteration.startDate,
                endDate: $scope.iteration.endDate,
                bugs: iterationToAdd.bugs,
                reopens: iterationToAdd.reopens,
                features: iterationToAdd.features,
                extraHrs: iterationToAdd.extraHrs,
                qaScore: iterationToAdd.qaScore,
                days: iterationToAdd.days
            });

        };

        var onError = function(reason) {
            console.log('ERROR', reason);
            $scope.alerts = [];
            $scope.alerts.push({msg: reason});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


        $scope.addIteration = function(){
            iterationCount += 1;
            stringStartDate = padStr($scope.iteration.startDate.getFullYear()) + '-' +
                padStr(1 + $scope.iteration.startDate.getMonth())  + '-' +
                padStr($scope.iteration.startDate.getDate());
            stringEndDate = padStr($scope.iteration.endDate.getFullYear()) + '-' +
                padStr(1 + $scope.iteration.endDate.getMonth())  + '-' +
                padStr($scope.iteration.endDate.getDate());
            jiraSvc.getBugsFound(stringStartDate, stringEndDate, $scope.iteration.projectId).then(bugsComplete, onError);
        };

        $scope.deleteIteration = function ( idx) {
            iterationCount -= 1;

            bugsFoundSum -= $scope.iterations[idx].bugs;
            reopensSum -= $scope.iterations[idx].reopens;
            featuresSum -= $scope.iterations[idx].features;
            extraHrsSum -= $scope.iterations[idx].extraHrs;
            qaScoreSum -= $scope.iterations[idx].qaScore;
            daysSum -= $scope.iterations[idx].days;

            $scope.averages.bugsFound = bugsFoundSum / iterationCount;
            $scope.averages.reopens = reopensSum / iterationCount;
            $scope.averages.features = featuresSum / iterationCount;
            $scope.averages.extraHrs = extraHrsSum / iterationCount;
            $scope.averages.qaScore = qaScoreSum / iterationCount;
            $scope.averages.days = daysSum / iterationCount;
            $scope.iterations.splice(idx, 1);
        };

    };

    app.controller("JiraController",["$scope","jiraSvc", "$http", "$log","$q", "$timeout", JiraController]);
}());