/* global angular, context, t, saveAs */

(function () {
    'use strict';

    angular
        .module('app')
        .service('sprintreportService', sprintreportService);

    sprintreportService.$inject = ['trelloService', '$q','$http'];

    function sprintreportService(trelloService, $q, $http) {
        var service = {
            settings: {
                //lists: {},
                //custom: { checklists: { list: { checkItems: [] } } }
            },
            model: {},
            init: init, 
            formatMilestones: formatMilestones, 
            getReportLogo: getReportLogo,
          getReport: getReport
        }

        return service;

// Initialization
        function init() {
            console.log("sprintreport.service>init");
            var deferred = $q.defer();

            trelloService.getBoard(context.board)
            .then(function (boardData) {
                $.extend(service.settings, boardData);
                
                console.log("resolve init");
                deferred.resolve();

            });
            return deferred.promise;
        }

// Public Methods
        //Check for the milestone card and get milestones
        function formatMilestones() {
          console.log("sprintreport.service>formatMilestones - Reformatting milestones...");
          for (var i = 0; i < service.settings.board.cards.length; i++) {
            for(var j = 0; j < service.settings.board.cards[i].pluginData.length; j++) {
              var value = JSON.parse(service.settings.board.cards[i].pluginData[j].value);
              
              if('milestone_status' in value) {
                service.settings.board.cards[i]["isMilestone"] = true;
                service.settings.board.cards[i]["milestone_status"] = value.milestone_status;
                service.settings.board.cards[i]["milestone_start"] = value.milestone_start;
                service.settings.board.cards[i]["milestone_anticipated"] = value.milestone_anticipated;
                service.settings.board.cards[i]["milestone_actual"] = value.milestone_actual;
                if (value.milestone_actual == "") {
                  service.settings.board.cards[i]["milestone_state"] = "Pending";
                } else {
                  service.settings.board.cards[i]["milestone_state"] = "Complete";
                }
              }
            }
          }
        }

        function getReportLogo() {
            console.log("sprintreport.service>getReportLogo - getting logo...");
            var deferred = $q.defer();
            var cardName = "Link to PMWeb Site"; //////////////// Make this a setting!
            for (var i = 0; i < service.settings.board.cards.length; i++) {
                if (service.settings.board.cards[i]["name"] === cardName) {
                    trelloService.getData('cards/' + service.settings.board.cards[i].id + "/attachments/" + service.settings.board.cards[i].idAttachmentCover, {}, function (data) {
                        var url = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2FHKA.png?1516074405379";
                        //if (data.url) {
                        //    url = data.url;
                        //}
                        deferred.resolve(url);
                    });
                }
            }
            return deferred.promise;
        }
      
      function getReport(report) {
        //var today = new Date();
        //var sprint = vm.report.board.hka_sprintnumber || "0";
        console.dir(report);
        $http({
          method: "POST",
          url: 'https://hka-trello.glitch.me/api/sprintReport',
          data: report,
          responseType: 'arraybuffer'
        })
        .then(function(rs){
          saveAs(new Blob([rs.data], {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}), '-SprintReport.docx');
        });
      }
// End Public Methods

//Private Methods

    
    }
})();