/* global angular, context, t, moment */

(function () {
  'use strict';

  angular
      .module('app')
      .service('teamService', teamService);

  teamService.$inject = ['trelloService','$q'];

  function teamService(trelloService, $q) {
    var service = {
      model:{
        hka_reportingstart: new Date(),
        hka_reportingfinish: moment().add(6,'months') //new Date()
      },
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
        trelloService.getPluginId(context.board )
        .then(function(pluginId){ 
          service.model["hka_trello"] = pluginId;
          //console.log(service.model["hka_trello"]);
        
          trelloService.getData('organizations/' + orgData.id + "", {boards:"open",board_fields:"all",board_pluginData:"true"}, function (orgBoards) {
            var boards = orgBoards.boards
            var promises = [];
            var boardData = [];

            while (boards.length > 0) {
              var chunk = boards.splice(0,10);

              var url = ""
              for (var b = 0; b < chunk.length; b++){
                url += ",/boards/" + chunk[b].id + "?pluginData=true"
              }
              var promise = get10boards(url.substring(1));

              promises.push(promise);
            }

            $q.all(promises)
            .then(function(data){
              service.model.timeValues = getMonthsArray(service.model.hka_reportingstart,service.model.hka_reportingfinish);

              service.model.data = [];

              for (var i = 0; i < data.length; i++) {
                angular.forEach(data[i], function(value,key){
                  for (var j = 0; j < value["200"].pluginData.length; j++) {
                    if ( value["200"].pluginData[j].idPlugin === service.model.hka_trello.id){
                      var pluginData = JSON.parse(value["200"].pluginData[j].value);
                      
                      var memberData =  Object.keys(pluginData).filter(function(k){ return ~k.indexOf("hka_resource_") });
        
                      for (var m = 0; m < memberData.length; m++) {
                        var resource = pluginData[memberData[m]];
                        
                        resource["boardId"] = value["200"].id;
                        resource["boardName"] = value["200"].name;
                        resource["shortUrl"] = value["200"].shortUrl;

                        service.model.data.push(resource);
                      }
                      
                    }
                  }
                });
              }

              console.log("resolve init");
              deferred.resolve();
            });
          });
        });
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
    
    function get10boards(url){
      var defer = $q.defer();
            
      trelloService.getData('batch/',{urls:url},function (tenBoards) {
        //console.dir(tenBoards);
        defer.resolve(tenBoards);
      });
      
      return defer.promise;
    }
         
  }
})();