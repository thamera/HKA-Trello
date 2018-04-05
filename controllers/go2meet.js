var http = require('http');
var qs = require('querystring');
//var OAuth2 = require('oauth').OAuth2
var ClientOAuth2 = require('client-oauth2');

const g2mAuth = new ClientOAuth2({
  clientId: process.env.GOTOMEETINGKEY,
  clientSecret: process.env.GOTOMEETINGSECRET,
  accessTokenUri: 'https://api.getgo.com/oauth/v2/token',
  authorizationUri: 'https://api.getgo.com/oauth/v2/authorize',
  redirectUri: 'http://hka-trello.glitch.me/auth/g2mtoken',
  scopes: []
});

exports.getUri = function(request, response) {  
  var uri = g2mAuth.code.getUri()
  
  response.redirect(uri);
}

exports.getToken = function(request,response){
  console.log(request.originalUrl);
  g2mAuth.code.getToken(request.originalUrl)
  .then(function(data) {
    console.log(data);
    
    //refresh the data storage?
    
    //return response.send(data.data);
    response.redirect('http://hka-trello.glitch.me/g2m/authorized.html?access_token=' + data.data.access_token);
  });
}