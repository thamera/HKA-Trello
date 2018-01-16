/* global angular, context, t, moment */

(function () {
    'use strict';

    angular
        .module('app')
        .service('checklistService', checklistService);

    checklistService.$inject = ['trelloService','$q'];

    function checklistService(trelloService, $q) {
      var service = {
        model:{},
        init: init,
        //getBoards: getBoards,
        //  getLists: getLists,
        //  getCard: getCard,
        createCard: createCard
        //  updateChecklist: updateChecklist,
        //  model: {
        //      ready: false,
        //      error: null
        //  }
      }

      return service;

      // Initialization
      function init() {
        console.log("checklist.service>init");
        var deferred = $q.defer();

        trelloService.getBoard(context.board)
          .then(function (boardData) {
            $.extend(service.model, boardData);

          t.card('all')
            .then(function (data) {
              service.model["selectedCard"] = data;

              service.model.selectedCard["idLabels"] = $.grep(service.model.board.cards, function(card) { return card.id == data.id; })[0].idLabels
            
              updateCardChecklistLinks();

              console.log("resolve init");
              deferred.resolve();
            });
          });
        return deferred.promise;
      }

      // Gets plugin data value for our app, parses to an object and assigns to the card object as properties
      function updateCardChecklistLinks () {
        for (var i = 0; i < service.model.board.cards.length; i++) {
          for (var j = 0; j < service.model.board.cards[i].pluginData.length; j++) {
            if (service.model.board.cards[i].pluginData[j].idPlugin == service.model.board.hka_trello.id) {
              $.extend(service.model.board.cards[i], JSON.parse(service.model.board.cards[i].pluginData[j].value));
            }
          }
        }
      }
      
      function createCard(newCard,i,len) {
            var deferred = $q.defer();    
        
            var card = {
              name: newCard.name, 
              desc: newCard.desc, 
              idList: newCard.idList,
              idLabels: newCard.idLabels,
            }
            trelloService.postData('cards', card, function (data) {
              service.model.ready = trelloService.ready;
              service.model.error = trelloService.error;
              //console.dir(data);
              var newCardId = data.id;
              var newCardUrl = data.url
              
              var link = {
                name: 'CreatedFromChecklist',
                url: newCard.fromURL
              }
              
              trelloService.postData('cards/' + data.id + '/attachments',link,function(data) {
                //console.dir(data);
                t.set(newCardId,'shared',{ hka_fromCardId: newCard.fromCardId,hka_fromCard: newCard.fromCard, hka_fromChecklistId: newCard.fromChecklistId, hka_fromChecklist: newCard.fromChecklist})
                .then(function() {
                   trelloService.putData(
                     'cards/' + newCard.shortLink + '/checklist/' + newCard.fromChecklistCollection + '/checkItem/' + newCard.fromChecklistId,
                     { name: newCard.fromChecklist + "-->Converted to card on " + moment().format("MM/dd/YYYY h:mm a") + " (" + newCardUrl + ")--> " },
                     function (data) { //TODO:  need to convert date to readable date and add the url for the card to the end of this string
                       console.log(i + " of " + len); 
                       if (i == len - 1) {
                            deferred.resolve(true);
                        } else {
                            deferred.resolve(false);
                        }
                     });
                });
                //console.log("Attachement:");
                //console.dir(data);
                //  deferred.resolve(data);
                })
            });
            return deferred.promise;
        }
    }
})();