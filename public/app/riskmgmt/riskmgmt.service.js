/* global angular, context, t, saveAs */

(function () {
    'use strict';

    angular
        .module('app')
        .service('riskmgmtService', riskmgmtService);

    riskmgmtService.$inject = ['trelloService', '$q', '$http','jsonFilter'];

    function riskmgmtService(trelloService, $q, $http, jsonFilter) {
        var service = {
          model: {
          },
          init: init,
          getReport: getReport,
        }

        return service;

        function init() {
            console.log("riskmgmtService.service>init");
            var deferred = $q.defer();

            trelloService.getBoard(context.board)
            .then(function (boardData) {
              $.extend(service.model, boardData);
              
              updatePluginData();

              console.log("resolve init");
              deferred.resolve();

            });

            return deferred.promise;
        }
      
      function updatePluginData () {
        for (var i = 0; i < service.model.board.cards.length; i++) {
          for (var j = 0; j < service.model.board.cards[i].pluginData.length; j++) {
            if (service.model.board.cards[i].pluginData[j].idPlugin == service.model.board.hka_trello.id) {
              $.extend(service.model.board.cards[i], JSON.parse(service.model.board.cards[i].pluginData[j].value));
              
              service.model.board.cards[i].hka_riskImpactSchedule = Number(service.model.board.cards[i].hka_riskImpactSchedule);
              service.model.board.cards[i].hka_riskImpactCost = Number(service.model.board.cards[i].hka_riskImpactCost);
              service.model.board.cards[i].hka_riskProbability = Number(service.model.board.cards[i].hka_riskProbability);
              service.model.board.cards[i].hka_riskImpact = Number(service.model.board.cards[i].hka_riskImpact);
              service.model.board.cards[i]['hka_riskScore'] = service.model.board.cards[i].hka_riskProbability * service.model.board.cards[i].hka_riskImpact ;
            }
          }
        }
      }
      
      function getReport(params) {
        console.dir(params);
        $http({
          method: "POST",
          url: 'https://hka-trello.glitch.me/api/risklog',
          data: params,
          responseType: 'arraybuffer'
        })
        .then(function(rs){
          saveAs(new Blob([rs.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), params.board.name + '-RiskRegister.xlsx');
        });
      }
    }
})();