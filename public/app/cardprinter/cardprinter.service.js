/* global angular, context */

(function () {
    'use strict';

    angular
        .module('app')
        .service('cardprinterService', cardprinterService);

    cardprinterService.$inject = ['trelloService', '$q'];

    function cardprinterService(trelloService, $q) {
        var service = {
            settings: {
            },
            init: init,
            getReportLogo: getReportLogo,
            convertToBase64: convertToBase64
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
                    var url = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2FHKA.png?1516074405379";
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

// Private Functions

    }
})();