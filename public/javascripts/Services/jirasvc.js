(function(){

    var jiraSvc = function($q, $timeout, $http, $exceptionHandler) {

        var metrics = {
            bugs: 0,
            reopens: 0,
            features: 0,
            extraHrs: 0,
            qaScore: 0
        };


        var getBugsFound = function(startDate, endDate, projectId) {

            return $http.get('/bugsFound' + '?project_id=' + projectId + '&fromDate=' + startDate + '&toDate=' + endDate + '&fields=id')
                .then(function(response){
                    var data = response.data

                    if(data !== undefined)
                    {
                        metrics.bugs = data.total;
                        return data;
                    }
                    else
                    {
                        return $q.reject("Could not find data.");
                    }

                });
        };


        var getReopens = function(startDate, endDate, projectId){

            return $http.get('/reopens' + '?project_id=' + projectId + '&fromDate=' + startDate + '&toDate=' + endDate + '&fields=id')
                .then(function(response){

                    var data = response.data;
                    if(data !== undefined)
                    {
                        metrics.reopens = data.total;
                        return data;
                    }
                    else
                    {
                        return $q.reject("Could not find data.");
                    }

                });
        };

        function convertUTC(date){
            return new Date(date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) +  '-' + date.getUTCDate())
        }

        function isEqual(startDate, endDate) {
            return endDate.valueOf() == startDate.valueOf();
        }

        var getFeatures = function(startDate, endDate, projectId){

            return $http.get('/features' + '?project_id=' + projectId + '&fromDate=' + startDate + '&toDate=' + endDate + '&fields=id')
                .then(function(response){

                    var data = response.data;
                    if(data !== undefined)
                    {
                        metrics.features = data.total;
                        return data;
                    }
                    else
                    {
                        return $q.reject("Could not find data.");
                    }

                });
        };

        var workingDaysBetweenDates = function(startD, endD) {

            startD = convertUTC(startD);
            endD = convertUTC(endD);
            // Validate input
            if (endD < startD)
                return 0;

            // Calculate days between dates
            var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
            var startDiff = convertUTC(startD).setHours(0,0,0,1);  // Start just after midnight
            var endDiff = convertUTC(endD).setHours(23,59,59,999);  // End just before midnight
            var diff = endDiff - startDiff;  // Milliseconds between datetime objects
            var days = Math.ceil(diff / millisecondsPerDay);

            // Subtract two weekend days for every week in between
            var weeks = Math.floor(days / 7);
            days = days - (weeks * 2);

            // Handle special cases
            var startDay = startD.getDay();
            var endDay = endD.getDay();

            // Remove weekend not previously removed.
            if (startDay - endDay > 1)
                days = days - 2;

            // holiday array list
            var holidays = [new Date("05 26 2014"), new Date("07 04 2014"), new Date("09 01 2014"), new Date("09 01 2014"),
                new Date("11 27 2014"), new Date("11 28 2014"), new Date("12 24 2014"), new Date("12 25 2014"),
                new Date("12 31 2014"), new Date("01 01 2015") ];

            for (var i = 0; i < holidays.length; i++)
            {
                if (holidays[i] >= startD && holidays[i] <= endD)
                {
                    days = days - 1;
                }
            }

            // Remove start day if span starts on Sunday but ends before Saturday
            if (startDay === 0 && endDay != 6)
                days = days - 1;

            // Remove end day if span ends on Saturday but starts after Sunday
            if (endDay === 6 && startDay !== 0)
                days = days - 1;

            return days;
        };

        var getExtraHrs = function() {
            metrics.extraHrs = metrics.bugs + (metrics.reopens * 2);
            return metrics.extraHrs;
        };

        var getQAScore = function() {
            if(metrics.features !== 0){
                metrics.qaScore =( (metrics.bugs / 2) + metrics.reopens ) / metrics.features;
            }
            else {
                metrics.qaScore = 0;
            }
            return metrics.qaScore;
        };


        return {
            getBugsFound: getBugsFound,
            getReopens: getReopens,
            getFeatures: getFeatures,
            getExtraHrs: getExtraHrs,
            getQAScore: getQAScore,
            workingDaysBetweenDates: workingDaysBetweenDates
        };
    };

    var module = angular.module("JIRAVisual");
    module.factory("jiraSvc", jiraSvc);

}());