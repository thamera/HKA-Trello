/* global Trello, angular, apiKey, token */
//console.log(token);
Trello.setKey(apiKey);
Trello.setToken(token);

(function () {
    'use strict';

    angular
        .module('app')
        .factory('trelloService', trelloService);

    trelloService.$inject = ['$http', '$q'];

    function trelloService($http, $q) {
        var service = {
            ready: false,
            //rest services
            getData: getData,
            postData: postData,
            putData: putData,
            deleteData: deleteData,
            postDataPromise: postDataPromise,
            //trello helpers
            //boardFromPath: boardFromPath,
            getBoard: getBoard,
            forget:forget,
            error: null
        };

        return service;

        function getData(apiCommand, dataSets, onDataSuccess) {
          Trello.get(apiCommand,dataSets, function (data) {
            onGetSuccess(data);
          }, function (data) {
            onGetSuccess(data);
          });

            var onGetSuccess = function (data) {
                if (onDataSuccess) {
                    console.log('successful trello get...');
                    service.ready = true;
                    onDataSuccess(data);
                } else {
                    service.ready = false;
                    service.error = "Error Getting Data...";
                }
            }
        }

        function postData(apiCommand, dataSets, onDataSuccess) {
          console.log("Initializing trello post");
          Trello.post(apiCommand,dataSets, function (data) {
            onPostSuccess(data);
          }, function (data) {
            onPostSuccess(data);
          });
          
          
            var onPostSuccess = function (data) {
                if (onDataSuccess) {
                    service.ready = true;
                    onDataSuccess(data);
                } else {
                    service.ready = false;
                    service.error = "Error Posting Data...";
                    onDataSuccess("Error Posting Data...");
                }
            };

            //reteun
        }

        function postDataPromise(apiCommand, dataSets, onDataSuccess) {
          var deferred = $q.defer();
          
          console.log("Initializing trello post");
          Trello.post(apiCommand,dataSets, function (data) {
            onPostSuccess(data);
          }, function (data) {
            onPostSuccess(data);
          }); 

            var onPostSuccess = function (data) {
                if (onDataSuccess) {
                    service.ready = true;
                    //onDataSuccess(data);
                    deferred.resolve(data);
                } else {
                    service.ready = false;
                    service.error = "Error Posting Data...";
                    //onDataSuccess(chrome.runtime.lastError);
                    deferred.resolve("Error Posting Data...");
                }
            };

            return deferred.promise;
        }

        function putData(apiCommand, dataSets, onDataSuccess) {
          Trello.put(apiCommand, dataSets, function (data) {
            onPutSuccess(data);
          }, function (data) {
            onPutSuccess(data);
          });

            var onPutSuccess = function (data) {

                if (onDataSuccess) {
                    console.log('successful trello put...');
                    service.ready = true;
                    onDataSuccess(data);
                } else {
                    service.ready = false;
                    service.error = "Error Putting Data...";
                    onDataSuccess("Error Putting Data...");
                }
            };
        }

        function deleteData(apiCommand, dataSets, onDataSuccess) {
          Trello.delete(apiCommand, dataSets, function (data) {
            onDeleteSuccess(data);
          }, function (data) {
            onDeleteSuccess(data);
          });
        
            var onDeleteSuccess = function (data) {

                if (onDataSuccess) {
                    console.log('successful trello delete...');
                    service.ready = true;
                    onDataSuccess(data);
                } else {
                    service.ready = false;
                    service.error = "Error Deleting Data...";
                    onDataSuccess("Error Deleting Data...");
                }
            };
        }

        function getBoard(id, getComments, options) {
            var deferred = $q.defer();
            var boardOptions = { lists: 'open', cards: 'all', pluginData: 'true', card_pluginData: 'true', card_checklists: 'all' };
            if (!$.isEmptyObject(options)) {
                boardOptions = $.extend(boardOptions, options);
            }
            getData('boards/' + id, boardOptions, function (board) {  
              var data = { board: board };
              getData('boards/' + id + '/plugins', {},function (plugins) {
                for (var j = 0; j < plugins.length; j++){
                  if ( plugins[j].name = "HKA Trello App" ) {
                    data.board["hka_trello"] = plugins[j];
                  }
                }
                for (var i = 0; i < data.board.pluginData.length; i++){
                  if ( data.board.pluginData[i].idPlugin == data.board.hka_trello.id) {
                    var value = JSON.parse(data.board.pluginData[i].value);

                    data.board["hka_dateformat"] = value.hka_dateformat;
                    data.board["hka_freshdeskurl"] = value.hka_freshdeskurl;
                    data.board["hka_reportedLists"] = value.reportedLists;
                    data.board["hka_sprintnumber"] = value.hka_sprintnumber;
                    data.board["hka_sprintstart"] = new Date(value.hka_sprintstart);
                    data.board["hka_sprintend"] = new Date(value.hka_sprintend);
                  }
                }

                  if (getComments || getComments == undefined) {
                      getData('boards/' + id + '/actions', { filter: 'commentCard', limit: '1000' }, function (boardComments) {
                          data["comments"] = boardComments;
                          deferred.resolve(data);
                      });
                  } else {
                      deferred.resolve(data);
                  }
              });
            });

            return deferred.promise;
        }
      
        function forget() {
          Trello.deauthorize();
        }
    }
})();