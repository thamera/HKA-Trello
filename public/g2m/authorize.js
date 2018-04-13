var t = window.TrelloPowerUp.iframe();

t.render(function() {
  return t.sizeTo('#content');
})

var oauthUrl = 'https://api.getgo.com/oauth/v2/authorize?client_id=' + t.arg('go2Key') + '&response_type=code';

var authBtn = document.getElementById('authorize');
authBtn.addEventListener('click', function() {
  t.authorize(oauthUrl)
  .then(function(token) {
    console.log(token);
    return t.set('member', 'private', 'g2m_token', token)
  })
  .then(function() {
    return t.closePopup();
  });
});