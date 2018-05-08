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
      createCard: createCard
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
        name: newCard.cardData.name,
        desc: "",
        idList: newCard.cardData.TargetList.id,
      }
      if (newCard.cardData.Labels && newCard.cardData.Labels.length > 0) {
        card.idLabels = newCard.cardData.Labels.map(e => e.id).join(",");
      }
      if (newCard.cardData.Members && newCard.cardData.Members.length > 0) {
        card.idMembers = newCard.cardData.Members.map(e => e.id).join(",");
      }
      if (newCard.cardData.due) { card.due = newCard.cardData.due; }
      //console.dir(createCard);
          /*var card = {
            name: newCard.name, 
            desc: newCard.desc, 
            idList: newCard.idList,
            idLabels: newCard.idLabels,
          }*/

          console.log('checklist.service>creating card...');
          trelloService.postData('cards', card, function (data) {
            service.model.ready = trelloService.ready;
            service.model.error = trelloService.error;
            //console.dir(data);
            var newCardId = data.id;
            var newCardUrl = data.url
            console.log('checklist.service>new card id: ' + newCardId);
            var link = {
              name: 'CreatedFromChecklist',
              url: newCard.fromURL
            }
            console.log('checklist.service>creating link to original card...');
            trelloService.postData('cards/' + data.id + '/attachments',link,function(data) {
                console.log('checklist.service>put new card refence on checklist item...'); 
                trelloService.putData(
                   'cards/' + newCard.shortLink + '/checklist/' + newCard.fromChecklistCollection + '/checkItem/' + newCard.fromChecklistId,
                   { name: newCard.fromChecklist + "-->Converted to card on " + moment().format("MM/dd/YYYY h:mm a") + " (" + newCardUrl + ")--> " },
                   function (data) { //TODO:  need to convert date to readable date and add the url for the card to the end of this string
                    deferred.resolve(newCardId);
                   });
                        
              })
          });
          return deferred.promise;
      }
  }
})();