/* global angular, t */

(function () {
    'use strict';

    angular
        .module('app', [
          // Angular modules    
          //'ngRoute',
          'ngSanitize',
          
          // Custom modules

          // 3rd Party Modules

        ])
        .config(compileProvider)
        .controller('g2mCtrlAs', g2mCtrlAs)

  
  compileProvider.$inject = ['$compileProvider'];
  
  function compileProvider($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob):|data:image\/)/);
    }
  
  g2mCtrlAs.$inject = ['$http'];

  function g2mCtrlAs($http) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'HKA - GoToMeeting Trello Tools';
    
    activate();
      
    function activate() {
      //$http({
      //    method: "GET",
      //    url: 'https://hka-trello.glitch.me/auth/g2m',
      //    //data: params,
      //    //responseType: 'arraybuffer'
      //  })
      //  .then(function(rs){
      //    console.log(rs);
      //  });
      
      //t.authorize('https://api.getgo.com/oauth/v2/authorize?client_id={consumerKey}&response_type=code',{ height: 680, width: 580 });
      
      t.authorize('https://hka-trello.glitch.me/auth/g2mcode', { height: 680, width: 580})
      .then(function(token){ //, validToken: tokenLooksValid , windowCallback: authorized
        console.log(token);
      });
    }
    
    var tokenLooksValid = function(token){
      console.log(token);
      return /^[0-9a-f]{64}$/.test(token);
    }
    
    var authorized = function(authorizeWindow) {
      console.dir(authorizeWindow);
      window.addEventListener('hashchange', function(evt) {  
        console.dir(evt);
        if (evt.key === 'token' && evt.newValue) {
          // Do something with the token here, then...
          authorizeWindow.close();
          window.removeEventListener('hashchange', this);
        }
      });
    }
  }
})();
