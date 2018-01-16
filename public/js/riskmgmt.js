/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

window.riskForm.addEventListener('submit', function(event){
  event.preventDefault();
  
    t.closePopup();

});

t.render(function(){
  
    t.sizeTo('#riskForm').done();
  
});