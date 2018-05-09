/* global angular, context, t, moment */

(function () {
    'use strict';

    angular
        .module('app')
        .service('ganttService', ganttService);

    ganttService.$inject = ['trelloService','$q'];

    function ganttService(trelloService, $q) {
      var service = {
        model:{},
        init: init,
        setupGantt: setupGantt
      }

      return service;

      // Initialization
      function init() {
        console.log("gantt.service>init");
        var deferred = $q.defer();
        
        trelloService.getBoard(context.board)
        .then(function (boardData) {
          $.extend(service.model, boardData);

          console.log("resolve init");
          deferred.resolve();
        });

        return deferred.promise;
      }
      
      function setupGantt(){
        var milestones = [];
        
        for (var i = 0; i < service.model.board.cards.length; i++) {
          for(var j = 0; j < service.model.board.cards[i].pluginData.length; j++) {
            var value = JSON.parse(service.model.board.cards[i].pluginData[j].value);

            if('milestone_status' in value) {
              var milestone = { name: service.model.board.cards[i].name,
                cardId: service.model.board.cards[i].id,
                tasks:[
                  {id:service.model.board.cards[i].id,
                    name:service.model.board.cards[i].name,
                    color: statusColors(value.milestone_status), //'#9FC5F8',
                    from: new Date(value.milestone_start),
                    to: new Date(value.milestone_anticipated),
                    cardId: service.model.board.cards[i].id,
                    content: statusIcon(value.milestone_status) + value.milestone_status,
                    status: value.milestone_status,
                    dependencies: [],
                    groups: [],
                  }
                ],
                children: []
              }
              //console.dir(service.model.board.cards[i]);
              
              if( value.milestone_actual ) {
                milestone.tasks[0].to = new Date(value.milestone_anticipated);
                milestone.tasks[0].progress = { percent: 100, color: "#407bff"};
              }
              
              if( value.milestone_parent && value.milestone_parent !== '')
              {
                milestone.parent = value.milestone_parent;
              }
              
              if( value.milestone_predecessor && value.milestone_predecessor !== '')
              {
                milestone.tasks[0].dependencies.push({'from': value.milestone_predecessor});
              }
              
              milestones.push(milestone);
            }
          }
        }
        for (var m = 0; m < milestones.length; m++){
          if(milestones[m].parent) {
            for (var p = 0; p < milestones.length; p++) {
              if(milestones[p].cardId == milestones[m].parent) {
                milestones[p].children.push(milestones[m].name);
              }
            }
          }
        }
        //console.dir(milestones);
        return milestones;
      }
      
      function statusColors(status) {
        switch (status) {
                case "On Track":
                    return "#8dc38d";
                    break;
                case "At Risk":
                    return "#f1c976";
                    break;
                case "Behind Schedule":
                    return "#e88178";
                    break;
                default:
                    return "silver";
            }
      }
      function statusIcon(status) {
        switch (status) {
                case "On Track":
                    return '<i class="far fa-calendar-check"></i> ';
                    break;
                case "At Risk":
                    return '<i class="far fa-question-circle"></i> ';
                    break;
                case "Behind Schedule":
                    return '<i class="far fa-exclamation-triangle"></i> ';
                    break;
                default:
                    return '<i class="far fa-calendar"></i> Status Not Provided';
            }
      }
    }
})();