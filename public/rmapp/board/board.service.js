/* global angular, context, t, moment */

(function () {
    'use strict';

    angular
        .module('app')
        .service('boardService', boardService);

    boardService.$inject = ['trelloService','$q'];

    function boardService(trelloService, $q) {
      var service = {
        model:{},
        init: init,
        getMonthsArray: getMonthsArray
      }

      return service;

      // Initialization
      function init() {
        console.log("board.service>init");
        var deferred = $q.defer();
        
        console.log("get board plugin data...");
        t.get('board','shared')
        .then(function (boardData) {
          console.log("process board plugin data...");
          service.model = boardData;
          
          service.model.hka_targetstart = new Date(service.model.hka_targetstart );
          service.model.hka_targetfinish = new Date(service.model.hka_targetfinish );
          
          service.model.timeValues = getMonthsArray(service.model.hka_targetstart,service.model.hka_targetfinish);
          
          service.model.data = [];
          
          console.log("get resources...");
          var memberData =  Object.keys(service.model).filter(function(k){ return ~k.indexOf("hka_resource_") });
          
          for (var m = 0; m < memberData.length; m++) {
            service.model.data.push(service.model[memberData[m]]);
          }
          
          console.log("resolve init");
          deferred.resolve();
        });
        
        return deferred.promise;
      }
      
      function getMonthsArray(start,end){
        console.log("board.service>init");
        console.log(start,end);
        var timeValues = [];
        
        if(!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          var dateStart = moment(start);
          var dateEnd = moment(end);
          while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('MM-YYYY'));
            dateStart.add(1,'month');
          }
        }
        //var dateStart = moment(start);
        //var dateEnd = moment(end);
        //var timeValues = [];

        return timeValues
      }
           
    }
})();