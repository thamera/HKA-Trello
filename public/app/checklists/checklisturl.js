var t = window.TrelloPowerUp.iframe();

// you can access arguments passed to your iframe like so
var arg = t.arg('arg');
var card = {};

t.render(function(){
  // make sure your rendering logic lives here, since we will
  // recall this method as the user adds and removes attachments
  // from your section
  t.card('attachments')
  .get('attachments')
  .filter(function(attachment){
    return attachment.name.indexOf('CreatedFromChecklist') == 0;
  })
  .then(function(checklistAttachment){
    var urls = checklistAttachment.map(function(a){ return a.url; });
    document.getElementById('hka_fromCard').href = urls.join(', ');
  })
  .then(function(){
   t.get('card','shared')
    .then(function(data){
      card = data;
     document.getElementById('hka_fromChecklist').innerHTML = data.hka_fromChecklist;
     document.getElementById('hka_cardName').innerHTML = data.hka_fromCard;
   });
  })
  .then(function(){
    return t.sizeTo('#content');
  });
});

function openChecklistCard() {
  t.showCard(card.hka_fromCardId);
}