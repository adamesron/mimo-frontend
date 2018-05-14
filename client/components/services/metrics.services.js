'use strict';

var app = angular.module('myApp.metrics.services', ['ngResource',]);

app.factory('Metric', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    var token;
    if ($localStorage && $localStorage.mimo_user && $localStorage.mimo_user.api_token) {
      token = $localStorage.mimo_user.api_token;
    }
    return $resource(API_END_POINT + '/metrics',
      {
        'access_token': token
      },
      {
      clientstats: {
        method:'GET',
        isArray: false,
      },
    });
  }]);

// Remove this once we've moved the lambda into python...

// app.factory('MetricLambda', ['$resource', '$localStorage', 'API_END_POINT_V2',
//   function($resource, $localStorage, API_END_POINT_V2){
//     var token;
//     if ($localStorage && $localStorage.mimo_user && $localStorage.mimo_user.api_token) {
//       token = $localStorage.mimo_user.api_token;
//     }
//     return $resource(API_END_POINT_V2 + '/metrics',
//       {
//         'access_token': token
//       },
//       {
//       clientstats: {
//         method:'GET',
//         isArray: false,
//       },
//     });
//   }]);
