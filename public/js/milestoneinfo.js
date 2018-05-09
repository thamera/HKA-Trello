/* global angular, t, context, moment */

(function () {
  'use strict';

  angular
    .module('app', [
      // Angular modules    
      // Custom modules
      // 3rd Party Modules
    ])
    .config(compileProvider)
    .controller('milestoneCtrlAs', milestoneCtrlAs);

  compileProvider.$inject = ['$compileProvider'];
  milestoneCtrlAs.$inject = ['$scope', '$q','trelloService'];

  function compileProvider($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);

      $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob):|data:image\/)/);
  }
  
  function milestoneCtrlAs($scope, $q, trelloService) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'Milestone Info';
    vm.model = {card:{}};
    vm.save = save;
    
    activate();
      
    function activate() {
      console.log("milestones.controller>activate");
      
      //Promise.all([
      //  t.get('card','shared'),
      //  t.cards('all')
      //])
      //.spread(function(data,allCards){
      t.get('card','shared')
      .then(function (data) {        
        data.milestone_start = new Date(data.milestone_start);
        data.milestone_anticipated = new Date(data.milestone_anticipated);
        data.milestone_actual = new Date(data.milestone_actual);
        $.extend(vm.model.card, data);

        //console.dir(allCards);
        trelloService.getBoard(context.board)
        .then(function (boardData) {
          $.extend(vm.model, boardData);
          
          console.log("milestones.controller>activate - Reformatting milestones...");
          for (var i = 0; i < vm.model.board.cards.length; i++) {
            for(var j = 0; j < vm.model.board.cards[i].pluginData.length; j++) {
              var value = JSON.parse(vm.model.board.cards[i].pluginData[j].value);

              if('milestone_status' in value && vm.model.board.cards[i].id !== context.card) {
                vm.model.board.cards[i]["isMilestone"] = true;
              }
            }
          }
          //deferred.resolve();
          console.dir(vm.model);
        });
      })
      .then(function(){
        t.sizeTo('#milestoneForm').done();
      })
    }
    
    function save() {
      t.set('card','shared', {
        milestone_start: moment(vm.model.card.milestone_start).isValid() ? moment(vm.model.card.milestone_start).format('MM/DD/YYYY') : "", 
        milestone_anticipated: moment(vm.model.card.milestone_anticipated).isValid() ? moment(vm.model.card.milestone_anticipated).format('MM/DD/YYYY') : "",
        milestone_actual: moment(vm.model.card.milestone_actual).isValid() ? moment(vm.model.card.milestone_actual).format('MM/DD/YYYY') : "",
        milestone_status: vm.model.card.milestone_status,
        milestone_parent: vm.model.card.milestone_parent,
        milestone_predecessor: vm.model.card.milestone_predecessor
      })
      .then(function(){
        t.closePopup();
      });
    }
  }

})();