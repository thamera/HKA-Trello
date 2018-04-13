/* global angular, context */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('cardprinterCtrlAs', cardprinterCtrlAs)
        .filter('customArray', function ($filter) {
            return function (list, arrayFilter, element) {
                if (arrayFilter) {
                    return $filter("filter")(list, function (listItem) {
                        return arrayFilter.indexOf(listItem[element]) != -1;
                    });
                }
            };
        });

    cardprinterCtrlAs.$inject = ['cardprinterService', '$ocLazyLoad'];

    function cardprinterCtrlAs(cardprinterService, $ocLazyLoad) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Trello Card Printer';
        vm.exportWord = exportWord;
        vm.getCheckState = getCheckState;
        vm.getAttachmentImg = getAttachmentImg;
        vm.getImage = getImage;
      vm.getReport = getReport;

        activate();

        function activate() {
          console.log("carprinter.controller>activate");
          console.groupCollapsed("Initialize Printable Card");
          cardprinterService.init()
              .then(function (data) {
                  vm.report = cardprinterService.settings;
                  
                  if (context.card){
                    var thiscard = $.grep(vm.report.board.cards, function(card) { return card.id == context.card });
                    thiscard[0].print = true;
                    console.dir(thiscard);
                    console.dir(vm.report.board.cards);
                  }
                    
                  cardprinterService.getReportLogo().then(function (url) {
                      // Uncomment below to view data model
                      //console.dir(vm.report);
                      vm.report.board["hka_clientlogo"] = url;
                      console.groupEnd();
                  });
              });

          $ocLazyLoad.load({
              serie: true,
              files: ['lib/FileSaver.min.js', 'lib/jquery/jquery.wordexport.js', 'css/reporting.css']
          })
        }

        function exportWord() {
            console.log("carprinter.controller>exportWord");
            var today = new Date();
            $("#reportcontent").wordExport({ filename: "CardPrint-" + today.getFullYear() + today.getMonth() + today.getDate(), title: "Trello Card Print", stylesheet: "css/reporting.css" });
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

        function getAttachmentImg(path) {
            if (path) {
                return { 'background-image': 'url(' + path + ');' };
            } else {
                return {};
            }
        }

        function getImage(url) {
            console.log(url);
            return cardprinterService.convertToBase64(url);
        }
      
      function getReport(){
        cardprinterService.getReport(vm.report);
      }
    }
})();
