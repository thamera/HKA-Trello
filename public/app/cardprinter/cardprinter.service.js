/* global angular, context, saveAs */

(function () {
    'use strict';

    angular
        .module('app')
        .service('cardprinterService', cardprinterService);

    cardprinterService.$inject = ['trelloService', '$q','$http'];

    function cardprinterService(trelloService, $q,$http) {
        var service = {
            settings: {
            },
            init: init,
            getReportLogo: getReportLogo,
            convertToBase64: convertToBase64,
          getReport:getReport
        }

        return service;

        function init() {
            console.log("cardprinterService.service>init");
            var deferred = $q.defer();
            
            trelloService.getBoard(context.board)
            .then(function (boardData) {
                $.extend(service.settings, boardData);

              console.log("resolve init");
                    deferred.resolve();
            });

            return deferred.promise;
        }

        function getReportLogo() {
            console.log("cardprinterService.service>getReportLogo - getting logo...");
            var deferred = $q.defer();
            var cardName = "Link to PMWeb Site";
            for (var i = 0; i < service.settings.board.cards.length; i++) {
                if (service.settings.board.cards[i]["name"] === cardName) {
                    var coverId = service.settings.board.cards[i].idAttachmentCover;
                    var url = "https://trelloapp.hka-tech.com/images/HKA.png";
                    //if (coverId) {
                    //    for (var j = 0; j < service.settings.board.cards[i].attachments.length; j++) {
                    //        if (service.settings.board.cards[i].attachments[j].id = coverId) {
                    //            url = service.settings.board.cards[i].attachments[j].url;
                    //        }
                    //    }
                    //}

                    convertToBase64(url).then(function (result) {
                        deferred.resolve(result);
                    });
                }
            }
            return deferred.promise;
        }

        function convertToBase64(url) {
            var deferred = $q.defer();

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                    //console.dir(reader.result);
                    deferred.resolve(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.send();

            return deferred.promise;
        }
      
      function getReport(report) {
        //var today = new Date();
        //var sprint = vm.report.board.hka_sprintnumber || "0";
        console.dir(report);
        $http({
          method: "POST",
          url: 'https://trelloapp.hka-tech.com/api/cardPrinter',
          data: report,
          responseType: 'arraybuffer'
        })
        .then(function(rs){
          saveAs(new Blob([rs.data], {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}), '-CardPrint.docx');
        });
      }

// Private Functions

    }
})();