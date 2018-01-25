/* global angular, t */
/// <reference path="../../lib/FileSaver.min.js" />

(function () {
    'use strict';

    angular
        .module('app')
        .controller('sprintreportCtrlAs', sprintreportCtrlAs);

    sprintreportCtrlAs.$inject = ['sprintreportService', '$ocLazyLoad', '$injector'];

    function sprintreportCtrlAs(sprintreportService, $ocLazyLoad, $injector) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Sprint Reporting';
        vm.exportWord = exportWord;
        vm.postToTrello = postToTrello;
        vm.report = {};
        vm.customSettings = customSettings;
        vm.showSettings = false;
        vm.updateSetting = updateSetting;
        vm.settingsBtn = "Show";
        vm.addList = addList;
        vm.updateList = updateList;
        vm.reorderList = reorderList;
        vm.deleteList = deleteList;
        vm.statusColor = statusColor;
        vm.getCheckState = getCheckState;
      vm.resetLists = resetLists;
      vm.filterMilestone = filterMilestone;

        //vm.test = test;
        //function test() {
        //    console.dir(vm.report.custom.checklists);
        //};
        
        activate();

        function activate() {
            console.log("sprintreport.controller>activate");
            console.groupCollapsed("Initialize Sprint Reports"); // Start Initialize Console Group
            sprintreportService.init()
                .then(function (data) {
                    console.log("set ctrl settings");
                    sprintreportService.formatMilestones();
                    vm.report = sprintreportService.settings;
                    sprintreportService.getReportLogo().then(function (url) {
                        vm.report.board["hka_clientlogo"] = url;
                    });
                })
                .then(function () {        
                    //console.groupCollapsed("Get Lists"); // Start Get Lists Console Group
                    //sprintreportService.getLists();
                    //console.groupEnd();  // End Get Lists Console Group
                    vm.report.model = sprintreportService.model;

                    // Uncomment below to view data model
                    //console.log("final model");
                    //console.dir(vm.report);
                    console.groupEnd();  // End Initialize Console Group
                });
            $ocLazyLoad.load({
                    serie: true,    
                    files: ['lib/FileSaver.min.js', 'lib/jquery/jquery.wordexport.js', 'css/reporting.css']
                }).then(function() {
                    
                });
        }

        function exportWord() {
            console.log("sprintreport.controller>exportWord");
            var today = new Date();
            var sprint = vm.report.board.hka_sprintnumber || "0";
            $("#reportcontent").wordExport({ filename: "Sprint-Report-" + sprint + "-" + today.getFullYear() + today.getMonth() + today.getDate(), title: "PMWeb Sprint Report", stylesheet: "css/reporting.css"});
        }

        function postToTrello() {
            console.log("sprintreport.controller>postToTrello");
            console.log("Posting report to trello");
            for (var i = 0; i < vm.report.board.cards.length; i++) {
                if (vm.report.board.cards[i]["name"] === "Sprint Reviews") {
                    var today = new Date();
                    var sprint = vm.report.board.hka_sprintnumber || "0";
                    $("#reportcontent").wordExport({ filename: "Sprint-Report-" + sprint + "-" + today.getFullYear() + today.getMonth() + today.getDate(), title: "PMWeb Sprint Report", stylesheet: "css/reporting.css", action: { "type": "upload", "cardid": vm.report.board.cards[i].id } });
                    return;
                }
            }
            alert("No card named Sprint Reviews exists for this board.  Report posting cancelled.");
        }
        
        function customSettings() {
            console.log("sprintreport.controller>customSettings");
            if (vm.showSettings == true) {
                vm.showSettings = false;
                vm.settingsBtn = "Show";
            } else {
                vm.showSettings = true;
                vm.settingsBtn = "Hide";
            }
            
        }

        function updateSetting(settingName) {
          console.log("sprintreport.controller>settingName"); 
          t.set('board','shared',settingName,vm.report.board[settingName]);
        }

        function statusColor(status) {
            switch (status) {
                case "On Track":
                    return "green";
                    break;
                case "At Risk":
                    return "yellow";
                    break;
                case "Behind Schedule":
                    return "red";
                    break;
                default:
                    return "white";
            }
        }

        function getCheckState(state) {
            switch (state) {
                case "complete":
                    return true;
                    break;
                default:
                    return false;
            }

        }

        function addList(){
            console.log("sprintreport.controller>addList");
            //console.dir(vm.settings.addListSelection);
            //console.dir(vm.report.board.lists);
            var temp = vm.report.board.lists[vm.settings.addListSelection];
            
            var reportedListsLength = 0;
            if (vm.report.board.hka_reportedLists !== undefined) {
              reportedListsLength = vm.report.board.hka_reportedLists.length;
            } else {
              vm.report.board.hka_reportedLists = [];
            }
          
            var newItem = {
                name: temp.name,
                listName: temp.name,
                listId: temp.id,
                pos: reportedListsLength + 1
            }
            vm.report.board.hka_reportedLists.push(newItem);
            t.set('board','shared','reportedLists',vm.report.board.hka_reportedLists);         
        }
        
        function updateList(list) {
            console.log("sprintreport.controller>updateList");
          
          t.set('board','shared','reportedLists',vm.report.board.hka_reportedLists); 
        }

        function reorderList() {
            console.log("sprintreport.controller>reorderList");
            for (var i = 0; i < vm.report.board.hka_reportedLists.length; i++) {
                if (vm.report.board.hka_reportedLists[i].pos != i) {
                    vm.report.board.hka_reportedLists[i].pos = i;
                    t.set('board','shared','reportedLists',vm.report.board.hka_reportedLists); 
                }
            }
        }

        function deleteList(list) {
            console.log("sprintreport.controller>deleteList");

            var index = vm.report.board.hka_reportedLists.indexOf(list)
            vm.report.board.hka_reportedLists.splice(index, 1);
          t.set('board','shared','reportedLists',vm.report.board.hka_reportedLists); 
        }
      
      function resetLists() {
        console.log("sprintreport.controller>resetLists - Reported lists set to system defaults...");
        vm.report.board.hka_reportedLists = [];
                   
        t.set('board','shared','reportedLists',vm.report.board.hka_reportedLists);
      }
      
      function filterMilestone(card){
        var found = false;
        for(var i = 0; i < card.pluginData.length; i++) {
          var value = JSON.parse(card.pluginData[i].value)
          if('milestone_status' in value) {
            found = true;
         }
        }
        return found;
      }
    }

})();
