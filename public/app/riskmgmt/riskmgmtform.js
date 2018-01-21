/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

window.riskForm.addEventListener('submit', function(event){
  event.preventDefault();
  return t.set('card', 'shared', {
    hka_riskStatus: document.getElementById('riskStatus').value,
    hka_riskCategory: document.getElementById('riskCategory').value,
    hka_riskProbability: document.getElementById('riskProbability').value,
    hka_riskImpact: document.getElementById('riskImpact').value,
    hka_riskResponse: document.getElementById('riskResponse').value,
    hka_riskImpactSchedule: document.getElementById('riskImpactSchedule').value,
    hka_riskImpactCost: document.getElementById('riskImpactCost').value
  })
  .then(function(){
    t.closePopup();
  });
});

t.render(function(){
  return t.get('card','shared')
  .then(function(cardData){
    window.riskStatus.value = cardData.hka_riskStatus;
    window.riskCategory.value = cardData.hka_riskCategory;
    window.riskProbability.value = cardData.hka_riskProbability;
    window.riskImpact.value = cardData.hka_riskImpact;
    window.riskResponse.value = cardData.hka_riskResponse;
    window.riskImpactSchedule.value = Number(cardData.hka_riskImpactSchedule);
    window.riskImpactCost.value = Number(cardData.hka_riskImpactCost);
  })
  .then(function() {
    t.sizeTo('#riskForm').done();
  });  
});