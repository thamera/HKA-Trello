/* global angular, context, t */

(function () {
    'use strict';

    angular
        .module('app')
        .service('securityreqService', securityreqService);

    securityreqService.$inject = ['trelloService','$q'];

    function securityreqService(trelloService, $q) {
      var service = {
        model:{},
        init: init,
        saveSecurityGroup: saveSecurityGroup
      }

      return service;

      // Initialization
      function init() {
        console.log("sequrityreq.service>init");
        var deferred = $q.defer();

        trelloService.getBoard(context.board)
          .then(function (boardData) {
            $.extend(service.model, boardData);
            
            t.get('card','shared')
              .then(function (data) {
                console.log(JSON.stringify(data, null, 2));
                service.model["cardSettings"] = data  
              
                console.log("resolve init");
                deferred.resolve();
              });
              
          });
        return deferred.promise;
      }
      
      function saveSecurityGroup(item) {
        console.dir(item);
      }


    }
})();