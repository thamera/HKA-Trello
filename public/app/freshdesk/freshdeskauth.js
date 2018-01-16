/* global TrelloPowerUp, Freshdesk */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

Freshdesk.setEndpoint(t.arg('freshdeskUrl'));

window.freshdesk_auth.addEventListener('submit', function(event){
  event.preventDefault();
  
  var apiKey = document.getElementById('apiKey').value;
  Freshdesk.setKey(apiKey);
  
  Freshdesk.get('settings/helpdesk',{}, false, function (data) {
    onGetSuccess(data, apiKey);
  }, function (data) {
    onGetFailure(data);
  });
  
});

var onGetSuccess = function (data, key) {
  //console.dir(data); 
  return t.set('member', 'private', 'freshdeskApiKey', key)
  .then( function() {
    //window.location.reload(false);
    //parent.location.reload();
    document.getElementById('submitBtn').disabled = true; 
    document.getElementById('apiKey').readOnly = true;
    document.getElementById('apiKey_success').innerHTML = "Key validated and saved to Trello.  Please refresh the page to continue."
  });
}

var onGetFailure = function (data) {
  document.getElementById('apiKey_error').innerHTML = "Error " + data.responseJSON.code //+ " | " + data.responseJSON.message;
}

t.render(function(){
  t.sizeTo('#freshdesk_auth').done();  
});