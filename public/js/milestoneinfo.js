/* global angular, t, context */

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
    vm.model = {};
    
    activate();
      
    function activate() {
      console.log("milestones.controller>activate");
      
      trelloService.getBoard(context.board)
      .then(function (boardData) {
        $.extend(vm.model, boardData);

        //deferred.resolve();
        console.dir(vm.model);
      });

    }
  }

})();

/* global TrelloPowerUp, Trello */

//var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

window.milestoneForm.addEventListener('submit', function(event){
  event.preventDefault();
  //console.log(document.getElementById('startDate').value);
  return t.set('card','shared',{
    milestone_start: document.getElementById('startDate').value, 
    milestone_anticipated: document.getElementById('anticipatedDate').value,
    milestone_actual:document.getElementById('actualDate').value,
    milestone_status:document.getElementById('milestoneStatus').value
  
  }) 
  .then(function(){
    t.closePopup();
  });
});

t.render(function(){
  return Promise.all([
    t.get('card','shared'),
    t.cards('all')
  ])
  .spread(function(data,allCards){
  //return t.get('card','shared')
  //.then(function (data) {
    window.milestoneStatus.value = data.milestone_status;
    window.startDate.value = data.milestone_start;
    window.anticipatedDate.value = data.milestone_anticipated;
    window.actualDate.value = data.milestone_actual;
    
    console.dir(allCards);
  })
  .then(function(){
    t.sizeTo('#milestoneForm').done();
  })
  
});