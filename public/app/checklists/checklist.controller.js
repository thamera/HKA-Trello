/* global angular */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('checklistCtrlAs', checklistCtrlAs);

    checklistCtrlAs.$inject = ['$scope', '$q', 'checklistService'];

    function checklistCtrlAs($scope, $q, checklistService) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Checklists To Cards';
      vm.model = {
            ready: false,
            selection: {
                toList: {},
                card: {}
            },
            numberSelected: 0
      };
      
      // UI Grid (Checklist Grid)
      vm.checklistGridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: true,
            showGridFooter: true,
            rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-disabled\': row.entity.isExported  }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
            columnDefs: [
                { name: 'name' },
                { name: 'checklist', grouping: { groupPriority: 0 } }
            ],
            isRowSelectable: function (row) {
                var name = "";
                name += row.entity.name;
                if (row.entity.isExported) {
                    return false;
                } else {
                    return true;
                }
            },
            data: vm.model.checklistData
      }
      
      vm.checklistGridOptions.onRegisterApi = registerGrid;
      vm.selectionChanged = selectionChanged;
      vm.getSelected = getSelected;
      
      activate();
      
      function activate() {
        checklistService.init()
        .then(function (data) {
          console.log("set ctrl model");
          vm.model = checklistService.model;
          
          formatChecklists();

          vm.model.ready = true;
          
          // Uncomment next too lines to view data model
          //console.log("final model");
          //console.dir(vm.model);
        });
      }
      
      function formatChecklists() {
        // Get selected card checklists
          for (var i = 0; i < vm.model.board.cards.length; i++) {
            if ( vm.model.board.cards[i].id == vm.model.selectedCard.id ) {
              for (var j = 0; j < vm.model.board.cards[i].checklists.length; j++) {
                var checklist = vm.model.board.cards[i].checklists[j].checkItems;
                for (var k = 0; k < checklist.length; k++) {
                  checklist[k].checklistId = vm.model.board.cards[i].checklists[j].id;
                  checklist[k].checklist = vm.model.board.cards[i].checklists[j].name;
                  checklist[k].isExported = false;
                  
                  if ($.grep(vm.model.board.cards, function(card) { return card.hka_fromChecklistId == checklist[k].id; }).length > 0) {
                    checklist[k].isExported = true;
                  }
                  
                  vm.checklistGridOptions.data.push(checklist[k]);
                  
                }
              }
           }
          }
      }
      
      function registerGrid(gridApi) {
            vm.myGridApi = gridApi;
            vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
      }
      
      function selectionChanged(rowChanged) {
            if (!vm.myGridApi.selection.getSelectedRows().length) { vm.model.numberSelected = 0; }
            else {
                vm.model.numberSelected = vm.myGridApi.selection.getSelectedRows().length;
            }
        }
      
      function getSelected() {
        var selection = vm.myGridApi.selection.getSelectedRows();
        
        // Make sure everything is ready
        if (!vm.model.selection.tolist || vm.model.selection.tolist == "") {
            alert("A list had not been identified to send new checlist cards to.  Please select a list and try again.");
            return;
        }
        if (selection.length == 0) {
            alert("please select the checklist items to be converted to cards.  Selected items will have a check mark to the left.");
            return;
        }
        
        for (var i = 0; i < selection.length; i++) {
          // Create Cards
          vm.model.ready = false;
          var list = $.grep(vm.model.board.lists, function (list) { return list.id == vm.model.selectedCard.idList })[0];
          var newCard = {
            name: selection[i].name,
            desc: "",
            idList: vm.model.selection.tolist,
            labels: vm.model.selectedCard.idLabels.join(),
            fromCardId: vm.model.selectedCard.id,
            fromCard: vm.model.selectedCard.name,
            fromChecklistId: selection[i].id,
            fromChecklist: selection[i].name,
            fromURL: vm.model.selectedCard.url,
            shortLink: vm.model.selectedCard.shortLink,
            fromChecklistCollection: selection[i].checklistId
          }
          checklistService.createCard(newCard,i,selection.length)
          .then(function(isLast){
            if(isLast) {
             finishChecklistCreation(selection.length); 
            }
          });
        }
      }
      
      function finishChecklistCreation(count) {
            vm.myGridApi.selection.clearSelectedRows();
            vm.checklistGridOptions.data.length = 0;
            activate();
            alert("HKA Trello App successfully created " + count + " cards from checklists.  You're welcome.");
        }

    }
})();
