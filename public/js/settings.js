/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var dateformatSelector = document.getElementById('hka_dateformat');
var milestoneSelector = document.getElementById('hka_milestonelist');
var riskSelector = document.getElementById('hka_risklist');
var hka_freshdeskurl = document.getElementById('hka_freshdeskurl');

t.render(function(){
  return Promise.all([
    t.get('board', 'shared'),
    t.lists('id','name')
  ])
  .spread(function(boardProps,allLists){
    //console.dir(boardProps);
    allLists.forEach( function (item){
      var option = document.createElement("option");
      option.text = item.name
      option.value = item.id
      var option2 = document.createElement("option");
      option2.text = item.name
      option2.value = item.id
      milestoneSelector.add(option);
      riskSelector.add(option2);
    })
    if(boardProps.hka_dateformat && /[a-z]+/.test(boardProps.hka_dateformat)){
      dateformatSelector.value = boardProps.hka_dateformat;
    }
    if(boardProps.milestonelist && /[a-z]+/.test(boardProps.milestonelist)){
      milestoneSelector.value = boardProps.milestonelist;
    }
    if(boardProps.hka_risklist && /[a-z]+/.test(boardProps.hka_risklist)){
      riskSelector.value = boardProps.hka_risklist;
    }
    if(boardProps.hka_freshdeskurl && /[a-z]+/.test(boardProps.hka_freshdeskurl)){
      hka_freshdeskurl.value = boardProps.hka_freshdeskurl;
    }
  })
  .then(function(){
    t.sizeTo('#content')
    .done();
  })

});

document.getElementById('save').addEventListener('click',function(){
  return t.set('board', 'shared',{
    'hka_dateformat':dateformatSelector.value,
    'milestonelist':milestoneSelector.value,
    'hka_freshdeskurl':hka_freshdeskurl.value,
    'hka_risklist':riskSelector.value
  })
  .then(function(){
    t.closePopup();
  })
})