angular.module("app")
.filter('groupByLabel', ['filterStabilize', function (stabilize) {
    return stabilize(function (data, key) {
        if (!(data)) return;
        var result = {};
        for (var i = 0; i < data.length; i++) {
            //console.dir(data[i]);
            var name = "";
            if (data[i].labels.length > 0) name = data[i].labels[0].name
            if (!result[name])
                result[name] = [];
            result[name].push(data[i])
        }
        return result;
    });
}])
.filter('dateFilter', function ($filter) {
    return function (input, key) {
        if (input == null || input == "") { return ""; }
        var tempDate = new Date(input);
        if (tempDate !== "Invalid Date" && !isNaN(tempDate)) {
            var _date = $filter('date')(tempDate, key);
            return _date;
        } else {
            return input;
        }
        
    };
})
.factory('filterStabilize', [
  'memoize',
  function (memoize) {

      function service(fn) {

          function filter() {
              var args = [].slice.call(arguments);
              // always pass a copy of the args so that the original input can't be modified
              args = angular.copy(args);
              // return the `fn` return value or input reference (makes `fn` return optional)
              var filtered = fn.apply(this, args) || args[0];
              return filtered;
          }

          var memoized = memoize(filter);

          return memoized;

      }

      return service;

  }
])
.factory('memoize', [
  function () {

      function service() {
          return memoizeFactory.apply(this, arguments);
      }

      function memoizeFactory(fn) {

          var cache = {};

          function memoized() {

              var args = [].slice.call(arguments);

              var key = JSON.stringify(args);

              if (cache.hasOwnProperty(key)) {
                  return cache[key];
              }
              cache[key] = fn.apply(this, arguments);
              return cache[key];
          }
          return memoized;
      }
      return service;
  }
]);