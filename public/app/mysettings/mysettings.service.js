/* global angular, context, t */

(function () {
    'use strict';

    angular
        .module('app')
        .service('mysettingsService', mysettingsService);

    mysettingsService.$inject = ['trelloService', '$q'];

    function mysettingsService(trelloService, $q) {
        var service = {
          settings: {
          },
          init: init,
          forgetTrello: forgetTrello,
        }

        return service;

        function init() {
          console.log("mysettingsService.service>init");
          var deferred = $q.defer();
            
          trelloService.getBoard(context.board)
          .then(function (boardData) {
            $.extend(service.settings, boardData);
            
            t.get('member','private')
            .then(function (member) {
              service.settings.member = member;
              console.log("resolve init");
              deferred.resolve();
            });
          });

          return deferred.promise;
        }

        function forgetTrello() {
          trelloService.forget();
        }

// Private Functions

    }
})();