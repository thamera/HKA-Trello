/* global angular, context, t, saveAs */

(function () {
    'use strict';

    angular
        .module('app')
        .service('securitylogService', securitylogService);

    securitylogService.$inject = ['trelloService', '$q', '$http','jsonFilter'];

    function securitylogService(trelloService, $q, $http, jsonFilter) {
        var service = {
          model: {
            securityreqs: []
          },
          init: init,
          getReport: getReport,
        }

        return service;

        function init() {
            console.log("securitylogService.service>init");
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
              var cardData = JSON.parse(service.model.board.cards[i].pluginData[j].value);
              //console.dir(cardData);
              if(Object.keys(cardData).some(function(k){ return ~k.indexOf("hka_securityreq_") })){
                //console.dir(service.model.board.cards[i]);
                for (var req in cardData){
                  service.model.securityreqs.push({
                    idShort: service.model.board.cards[i].idShort,
                    shortUrl: service.model.board.cards[i].shortUrl,
                    name: service.model.board.cards[i].name,
                    groupProp: req,
                    group: cardData[req].name,
                    complete: cardData[req].complete || false,
                    full: cardData[req].full || false,
                    create: cardData[req].create || false,
                    edit: cardData[req].edit || false,
                    delete: cardData[req].delete || false,
                    view: cardData[req].view || false,
                    noaccess: cardData[req].noaccess || false,
                    note: cardData[req].note || ""
                  });
                }
              }
            }
          }
        }
      }
      
      function getReport(params) {
        console.dir(params);
        $http({
          method: "POST",
          url: 'https://hka-trello.glitch.me/api/securitylog',
          data: params,
          responseType: 'arraybuffer'
        })
        .then(function(rs){
          saveAs(new Blob([rs.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), params.board.name + '-SecurityLog.xlsx');
        });
      }
    }
})();