/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
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
  return t.get('card','shared')
  .then(function (data) {
    window.milestoneStatus.value = data.milestone_status;
    window.startDate.value = data.milestone_start;
    window.anticipatedDate.value = data.milestone_anticipated;
    window.actualDate.value = data.milestone_actual;
  })
  .then(function(){
    t.sizeTo('#milestoneForm').done();
  })
  
});