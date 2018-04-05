/* global angular, context, t, moment */

(function () {
    'use strict';

    angular
        .module('app')
        .service('teamService', teamService);

    teamService.$inject = ['trelloService','$q'];

    function teamService(trelloService, $q) {
      var service = {
        model:{},
        init: init,
        getMonthsArray: getMonthsArray
      }

      return service;

      // Initialization
      function init() {
        console.log("team.service>init");
        var deferred = $q.defer();
        
        t.organization('all')
        .then(function (orgData) {
          console.dir(orgData);
          trelloService.getData('organizations/' + orgData.id + "", {boards:"open",board_fields:"all",board_pluginData:"true"}, function (orgBoards) {
            console.dir(orgBoards);
          });
        });
        
        t.getAll().then(function(allData) { console.dir(allData); });
        
        t.get('board','shared')
        .then(function (boardData) {
          //console.dir(boardData);
          service.model = boardData;
          
          service.model.hka_targetstart = new Date(service.model.hka_targetstart );
          service.model.hka_targetfinish = new Date(service.model.hka_targetfinish );
          
          service.model.timeValues = getMonthsArray(service.model.hka_targetstart,service.model.hka_targetfinish);
          
          service.model.data = [];
          
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
        var dateStart = moment(start);
        var dateEnd = moment(end);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
           timeValues.push(dateStart.format('MM-YYYY'));
           dateStart.add(1,'month');
        }
        return timeValues
      }
           
    }
})();