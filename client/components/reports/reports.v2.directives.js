'use strict';

var app = angular.module('myApp.reports.v2.directives', []);

app.factory('Locations', [function() {
  return { current: '', all: '' };
}]);

app.directive('reportsHeader', ['Report', '$routeParams', '$location', 'Location', '$q', '$window', 'Locations', '$timeout', '$cookies', '$route', 'gettextCatalog', function(Report, $routeParams,$location, Location, $q, $window, Locations, $timeout, $cookies, $route, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    scope.period = $routeParams.period || '7d';

    var cid = $cookies.get('_ctlid');
    if (cid) {
      cid = JSON.parse(cid);
    }

    scope.location_name = $routeParams.location_name;
    scope.selectedItem  = scope.location_name;

    function querySearch (query) {
      var deferred = $q.defer();
      Location.query({q: query}).$promise.then(function(results) {
        deferred.resolve(results.locations);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        hash.location_id   = item.id;
        hash.location_name = item.location_name;
        $location.search(hash);
        $route.reload();
      }, 250);
    }

    scope.querySearch        = querySearch;
    scope.selectedItemChange = selectedItemChange;
    scope.searchTextChange   = searchTextChange;

    scope.updatePeriod = function(period) {
      var hash = $location.search();
      hash.period = period;
      $location.search(hash);
      $route.reload();
    };

  };

  return {
    link: link,
    require: '^analytics',
    scope: {
      loading: '=',
    },
    templateUrl: 'components/reports/_header.html'
  };

}]);

app.directive('wirelessReports', ['Report', '$routeParams', '$location', 'Location', '$q', 'Locations', '$cookies', function(Report, $routeParams,$location,Location, $q, Locations, $cookies) {

  var link = function( scope, element, attrs ) {

    var params;
    var cid = $cookies.get('_ctlid');
    var lid = $routeParams.location_id;

    function init() {
      if (lid) {
        Location.current  = { id: lid };
        params = {id: lid, location_name: $routeParams.location_name};
        var json = JSON.stringify(params);
        $cookies.put('_ctlid', json);
      } else if (cid) {
        cid = JSON.parse(cid);
        params = {location_id: cid.id, location_name: cid.location_name};
        Location.current = { id: cid.id };
        $location.search(params);
      } else {
        getLocations();
      }
    }

    function getLocations() {
      Location.favourites({per: 15}).$promise.then(function(results) {
        Locations.all     = results.locations;
        if (!$routeParams.location_id) {
          Location.current  = results.locations[0];
          $location.search({location_id: Location.current.id, location_name: results.locations[0].location_name});
        }
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    }

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/_wireless.html'
  };

}]);

app.directive('radiusReports', ['Report', '$routeParams', '$location', 'Location', '$q', 'Locations', function(Report, $routeParams,$location,Location, $q, Locations) {

  var link = function( scope, element, attrs ) {

    Location.all = '';
    Location.current = '';

    function init() {
      Location.favourites({per: 15}).$promise.then(function(results) {
        Locations.all = results.locations;
        if ($routeParams.location_id) {
          Location.current  = { id: $routeParams.location_id };
        } else {
          Location.current  = results.locations[0];
        }
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    }

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/_radius.html'
  };

}]);

app.directive('analytics', ['Report', '$routeParams', '$location', 'Location', '$q', '$route', '$cookies', 'menu', 'gettextCatalog', function(Report, $routeParams,$location,Location, $q, $route, $cookies, menu, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 3) {
        return ($location.path().split('/')[2] === path);
      } else if (path === 'dashboard') {
        return true;
      }
    };
  };

  var controller = function($scope) {

    $scope.$on('changeLocation', function(evt, data) {
    });

    this.locationSearch = function(val) {
      return Location.query({q: val, size: 10}).$promise.then(function (res) {
      });
    };

    this.selectLocation = function(item) {
      $scope.updatePage(item);
    };

    var init = function(params) {
      var deferred = $q.defer();
      params.v2 = true;
      Report.get(params).$promise.then(function(results) {
        deferred.resolve(results);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };

    this.get = function(params) {
      return init(params);
    };

    this.clearLocations = function() {
      $scope.updatePage();
    };

    this.updateRange = function(msg) {
      $scope.updatePage(msg);
    };

    this.clearQuery = function() {
      $scope.clearQuery();
    };

    this.setInterval = function(period) {
      var interval;
      switch(period) {
        case '5m':
          interval = '10s';
          break;
        case '30m':
          interval = '1m';
          break;
        case '1d':
          interval = '30m';
          break;
        case '6h':
          interval = '180s';
          break;
        case '7d':
          interval = '1h';
          break;
        case '14d':
          interval = '1h';
          break;
        case '30d':
          interval = '1h';
          break;
        case '1yr':
          interval = '1yr';
          break;
        default:
          interval = '60s';
      }
      return interval;
    };

    this.options = {
      height: 350,
      colors: ['#009688', '#009688', '#FF5722', '#03A9F4', '#FF5722', '#607D8B'],
      series: {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        },
        2: {
          targetAxisIndex: 1
        }
      },
      vAxes: {
        0: {
          textPosition: 'none'
        },
        1: {
        },
      },
      legend: {
        position: 'none'
      },
      lineWidth: 1.5,
      hAxis: {
        // format: 'dd MMM'
      },
      crosshair: {
        trigger: 'both',
        orientation: 'vertical'
      },
      chartArea: {
        left: '2%',
        top: '3%',
        height: '84%',
        width: '92%'
      },
      explorer: {
        maxZoomOut:2,
        keepInBounds: true,
        axis: 'horizontal',
        actions: [ 'dragToZoom', 'rightClickToReset'],
      }
    };

    this.$scope = $scope;

  };

  return {
    link: link,
    controller: controller,
    scope: {}
  };

}]);

app.directive('reportsPie', ['Report', '$routeParams', '$location', 'Location', '$timeout', 'Shortener', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, Shortener, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, json;

    var period, location_id;

    var drawChart = function() {

      var options = {};

      $timeout.cancel(timer);

      options.colors = ['#16ac5b', '#225566', '#EF476F', '#FFD166', '#0088bb'];
      options.chartArea = { left: '3%', top: '3%', height: '84%', width: '90%' };
      options.legend = { position: attrs.legend || 'bottom' };
      options.height = '350';
      options.sliceVisibilityThreshold = 0;
      options.pieHole = '0.8';
      options.pieSliceText = 'none';

      var len = json.length;
      var data = new window.google.visualization.DataTable();

      data.addColumn('string', 'Column');
      data.addColumn('number', 'Populartiy');

      var empty = 0;
      var term;
      for(var i = 0; i < len; i++) {
        term = json[i].term;
        var val = json[i].count;
        if (val === 0) {
          empty++;
        } else {
          data.addRow([term, val]);
        }
      }

      if (empty === 2) {
        data.addRow([term, 0.000001]);
      }

      if (empty === 2 || len === 1) {
        options.colors = ['#009688'];
      }

      if (scope.type === 'popular' ) {
        options.pieSliceText = 'value';
      }

      var chart = new window.google.visualization.PieChart(document.getElementById(scope.render));

      if (attrs.tooltip) {
        options.tooltip = { trigger: 'selection' };

        chart.setAction({
          id: 'record',
          text: gettextCatalog.getString('View ') + attrs.tooltip,
          action: function() {
            var selection = chart.getSelection();
            shortener(json[selection[0].row].short);
          }
        });

      }
      chart.draw(data, options);
    };

    function shortener (code) {
      Shortener.get({short: code}).$promise.then(function(results) {
        $location.path(results.url);
        $location.search({});
      }, function() {
        $location.search({});
      });
    }

    var init = function() {

      var params = {
        type: scope.type,
        resource: attrs.resource,
        location_id: location_id,
        start: $routeParams.start || (Math.floor(new Date() / 1000) - 604800),
        end: $routeParams.end || Math.floor(new Date() / 1000)
      };

      var data;
      controller.get(params).then(function(results) {
        data = results;
        if (scope.type === 'splash_data') {
          var a = [];
          a.push({ count: data.stats.inbound.total / (1000*1000), term: 'Inbound'});
          a.push({ count: data.stats.outbound.total / (1000*1000), term: 'Outbound'});
          data.stats = a;
        }
      }, function() {
        var a = [];
        a.push({ count: 0.00001, term: 'No data' });
        data = { stats: a };
      });
      timer = $timeout(function() {
        json = data.stats;
        drawChart();
      },2000);
      scope.loading       = undefined;
    };

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.title     = attrs.title;
        scope.type      = attrs.type;
        scope.subhead   = attrs.subhead;
        scope.render    = attrs.render;
        // period          = $routeParams.period   || '7d';
        location_id     = $routeParams.id;
        init();
      }
    });
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    templateUrl: 'components/reports/_pie_charts.html',
  };

}]);

app.directive('radiusTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', '$rootScope', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json, stats, start;
    var options = controller.options;

    scope.period      = $routeParams.period   || '7d';
    scope.fill        = $routeParams.fill     || '0';
    scope.location_id = $routeParams.id;
    scope.type        = $routeParams.type;
    scope.start       = $routeParams.start || (Math.floor(new Date() / 1000) - 604800);
    scope.end         = $routeParams.end || Math.floor(new Date() / 1000);
    scope.interval = 'day';

    // smaller intervals when stats period is less than 48hrs
    if (scope.end - scope.start < 60 * 60 * 48) {
      scope.interval = 'hour';
    }

    options.curveType = 'function';
    options.colors = ['#16ac5b','#225566'];
    options.lineWidth = '2';
    options.vAxis = {
      viewWindow: {
        min: 0
      }
    }

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    var drawChart = function() {

      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.uniques)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {
          drawUsage(data);
        } else {
          drawClients(data);
        }

        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var drawUsage = function(data) {
      data.addColumn('number', 'Inbound');
      data.addColumn('number', 'Outbound');

      stats = json.timeline.stats;

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].inbound / (1000*1000) , stats[i].outbound / (-1000*1000) ]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: '#Gb'
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { suffix: 'Gb', pattern: '#,##0.00;'}
      );
      formatter.format(data,3);
      formatter.format(data,2);

    };

    var drawClients = function(data) {
      data.addColumn('number', scope.title);

      stats = json.timeline.stats;
      start = new Date(json._stats.start * 1000);

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].count]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: ''
        }
      };

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: 'MMM dd, yyyy'
      });
      date_formatter.format(data,0);

    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      var hash        = $location.search();
      hash.type       = t;
      scope.type      = t;
      hash.interval   = scope.interval;
      $location.search(hash);
      init();
    };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = gettextCatalog.getString('Radius Usage');
          break;
        case 'impressions':
          scope.title = gettextCatalog.getString('Splash Views');
          break;
        case 'uniques':
          scope.title = gettextCatalog.getString('Radius Uniques');
          break;
        default:
          scope.title = gettextCatalog.getString('Radius Sessions');
      }
    };

    scope.init = function() {
      init();
    };

    var init = function() {
      createTitle();
      var params = {
        resource:       'splash',
        type:           scope.type,
        start:          scope.start,
        end:            scope.end,
        interval:       scope.interval,
        fill:           scope.fill,
        location_id:    scope.location_id
      };

      controller.get(params).then(function(results) {
        json = results;
        timer = $timeout(function() {
          drawChart();
        },1000);
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
    });

  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    templateUrl: 'components/reports/_radius_timeline.html',
  };

}]);

app.directive('splashBarChart', ['Social', 'Email', 'Guest', 'Order', '$routeParams', '$location', '$q', 'Location', '$timeout', '$rootScope', 'gettextCatalog', function(Social, Email, Guest, Order, $routeParams, $location, $q, Location, $timeout, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, json, c, stats, start;
    var options = controller.options;
    scope.bar_type = $routeParams.bar_type;

    // lists three weeks ago; two weeks ago; last week; current week
    // all monday 00:00 - sunday 23:59, aside from current week which is up to current moment
    var weeks = [
      {
        start: moment().utc().day(-20).startOf('day').toDate().getTime() / 1000,
        end: Math.floor(moment().utc().day(-14).endOf('day').toDate().getTime() / 1000)
      },
      {
        start: moment().utc().day(-13).startOf('day').toDate().getTime() / 1000,
        end: Math.floor(moment().utc().day(-7).endOf('day').toDate().getTime() / 1000)
      },
      {
        start: moment().utc().day(-6).startOf('day').toDate().getTime() / 1000,
        end: Math.floor(moment().utc().day(0).endOf('day').toDate().getTime() / 1000)
      },
      {
        start: moment().utc().day(1).startOf('day').toDate().getTime() / 1000,
        end: Math.floor(new Date() / 1000)
      }
    ];

    var locationSearch = function() {
      var deferred = $q.defer();
      Location.get({id: $routeParams.id}, function(data) {
        deferred.resolve(data);
      }, function(){
        deferred.reject();
      });
      return deferred.promise;
    };

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    var drawChart = function() {

      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();

      if (json[0] && (json[0].count || json[1].count || json[2].count || json[3].count)) {

        scope.noData = undefined;
        scope.loading = undefined;

        data.addColumn('string', 'Week');
        data.addColumn('number', scope.title);

        var weekStart;
        var weekEnd;

        for(var i = 0; i < json.length; i++) {
          weekStart = moment.unix(json[i].start).format('DD/MM');
          weekEnd = moment.unix(json[i].end).format('DD/MM');
          data.addRow([weekStart + ' - ' + weekEnd, json[i].count]);
        }
        c = new window.google.visualization.ColumnChart(document.getElementById('splash_bar'));

        c.draw(data, options);
      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }

    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      var hash        = $location.search();
      hash.bar_type       = t;
      scope.bar_type      = t;
      // hash.interval   = scope.interval;
      $location.search(hash);
      init();
    };

    var createTitle = function() {
      switch(scope.bar_type) {
        case 'guests':
          scope.title = gettextCatalog.getString('Guests');
          scope.service = Guest;
          break;
        case 'social':
          scope.title = gettextCatalog.getString('Social');
          scope.service = Social;
          break;
        case 'orders':
          scope.title = gettextCatalog.getString('Sales');
          scope.service = Order;
          break;
        default:
          scope.title = gettextCatalog.getString('Emails');
          scope.service = Email;
      }
    };

    var setJson = function(results) {
      var obj = {
        count: results._links.total_entries,
        start: results._links.start,
        end:   results._links.end
      };
      var distance = Math.round(new Date() / 1000) - results._links.start;
      if (distance < 604800) {
        json[3] = obj;
      } else if (distance < 604800 * 2) {
        json[2] = obj;
      } else if (distance < 604800 * 3) {
        json[1] = obj;
      } else {
        json[0] = obj;
      }
    };

    var getCaptureCounts = function() {
      json = [];
      var distance;
      for(var i = 0; i < weeks.length; i++) {
        var params = {
          start: weeks[i].start,
          end: weeks[i].end,
          location_id: scope.location.id
        };
        scope.service.get(params).$promise.then(function(results) {
          setJson(results);
        }, function(err) {
          console.log(err);
        });
      }
    };

    scope.init = function() {
      init();
    };

    var init = function() {
      locationSearch().then(function(data) {
        scope.location = data;
        createTitle();
        getCaptureCounts();
        timer = $timeout(function() {
          drawChart();
        },2000);
        scope.loading = undefined;
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
    });

    scope.init();

  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    templateUrl: 'components/reports/_splash_bar_chart.html',
  };

}]);

app.directive('wirelessTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', '$rootScope', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json, stats, start;
    var options = controller.options;

    // scope.period      = $routeParams.period   || '7d';
    scope.interval    = $routeParams.interval || 'hour';
    scope.fill        = $routeParams.fill     || '0';
    scope.location_id = $routeParams.id;
    scope.start       = $routeParams.start || (Math.floor(new Date() / 1000) - 604800);
    scope.end         = $routeParams.end || Math.floor(new Date() / 1000);
    scope.type        = $routeParams.type;

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    var drawChart = function() {

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.inbound)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {
          drawUsage(data);
        } else {
          drawUniques(data);
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: 'MMM dd, yyyy'
        });
        date_formatter.format(data,0);

        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var drawUsage = function(data) {
      data.addColumn('number', 'Inbound');
      data.addColumn('number', 'Outbound');

      for(var i = 0; i < json.timeline.inbound.length; i++) {
        var time = new Date(json.timeline.inbound[i].time / (1000*1000));
        data.addRow([time, null, json.timeline.inbound[i].value / (1000*1000*1000) , json.timeline.outbound[i].value / (1000*1000*1000) ]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: '#Gb'
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { suffix: 'Gb', pattern: '#,##0.00;'}
      );
      formatter.format(data,3);
      formatter.format(data,2);

    };

    var drawUniques = function(data) {
      data.addColumn('number', scope.title);

      stats = json.timeline.stats;
      start = new Date(json._stats.start * 1000);

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].count]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: ''
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { pattern: '#,##0;'}
      );

      formatter.format(data,2);
    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      var hash        = $location.search();
      hash.type       = t;
      scope.type      = t;
      // scope.interval  = controller.setInterval(scope.period);
      hash.interval   = scope.interval;
      $location.search(hash);
      init();
    };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = gettextCatalog.getString('Wireless Usage');
          break;
        default:
          scope.title = gettextCatalog.getString('Unique Clients');
      }
    };

    scope.init = function() {
      init();
    };

    var init = function() {
      createTitle();
      var params = {
        resource:       'device',
        type:           scope.type,
        start:          scope.start,
        end:            scope.end,
        interval:       scope.interval,
        fill:           scope.fill,
        location_id:    scope.location_id
      };

      controller.get(params).then(function(results) {
        json = results;
        timer = $timeout(function() {
          drawChart();
        },500);
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
    });
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    templateUrl: 'components/reports/_wireless_timeline.html',
  };

}]);

app.directive('wirelessStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var init = function() {

      scope.stats = {};
      var period = $routeParams.period || '7d';
      scope.start       = $routeParams.start || (Math.floor(new Date() / 1000) - 604800);
      scope.end         = $routeParams.end || Math.floor(new Date() / 1000);

      var params = {
        // interval: '7d',
        resource: 'client',
        type: 'wireless_stats',
        location_id: $routeParams.id,
        // period: period
        start: scope.start,
        end: scope.end
      };

      controller.get(params).then(function(results) {
        scope.uniques = 0;
        scope.stats = results.stats;
        if (scope.stats && scope.stats.uniques && scope.stats.uniques.length > 0) {
          for(var i = 0; i < scope.stats.uniques.length; i++) {
            scope.uniques += scope.stats.uniques[i].val;
          }
        }
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    templateUrl: 'components/reports/_wireless_stats.html',
  };

}]);

// app.directive('radiusStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {
//
//   var link = function( scope, element, attrs, controller ) {
//
//     var init = function() {
//
//       scope.stats = {};
//       scope.start = $routeParams.start || (Math.floor(new Date() / 1000) - 604800);
//       scope.end   = $routeParams.end || Math.floor(new Date() / 1000);
//
//       var params = {
//         resource: 'splash',
//         type: 'splash_stats',
//         interval: 'hour',
//         location_id: $routeParams.id,
//         start: scope.start,
//         end: scope.end
//         // period: $routeParams.period || '7d'
//       };
//
//       // Get the splash stats
//       controller.get(params).then(function(results) {
//         scope.stats.splash = results.stats;
//
//         // Get the voucher stats
//         params.type = 'voucher_stats';
//         controller.get(params).then(function(results) {
//           scope.stats.vouchers = results.stats;
//         });
//       });
//     };
//
//     init();
//   };
//
//   return {
//     link: link,
//     scope: {
//       type: '@',
//       title: '@',
//       render: '@',
//       subhead: '@'
//     },
//     require: '^analytics',
//     templateUrl: 'components/reports/_radius_stats.html',
//   };
//
// }]);
