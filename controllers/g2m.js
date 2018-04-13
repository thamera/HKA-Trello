var http = require('http');
var qs = require('querystring');
var OAuth2 = require('oauth').OAuth2

const oauth2 = new OAuth2(process.env.GOTOMEETINGKEY,
  process.env.GOTOMEETINGSECRET,
  'https://api.getgo.com/oauth/',
  'v2/authorize',
  'v2/token',
  {
    Authorization: 'Basic ' + process.env.GOTOMEETINGAUTH,
    Accept:'application/json'
  }); /** Custom headaers */

exports.authorize = function(request, response) {  
  var p = request.url.split('/');
  var pLen = p.length;
  
  var authURL = oauth2.getAuthorizeUrl({
    response_type:'code',
    state: 'hka'
  });
  
  var body = '<a href="' + authURL + '" target="_top">Get Code </a>';

  if(pLen === 2 && p[1] === 'g2m') {
    console.log('Get Request Code');
    response.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/html' });
    response.end(body);
  } else if (pLen === 2 && p[1].indexOf('code') !== -1) {
    console.log('Use Request Code');
    var qsObj = {};
    
    var qsObj = qs.parse(p[1].split('?')[1]);

    oauth2.getOAuthAccessToken(
      qsObj.code,
      {'grant_type':'authorization_code',
       'code': qsObj.code//,
       //'redirect_uri': 'http%3A%2F%2Ftrelloapp.hka-tech.com%2Fg2m%2Fauthorized.html'
      },
      //'grant_type=authorization_code&code=' + qsObj.code + '&redirect_uri=http%3A%2F%2Ftrelloapp.hka-tech.com',
      function (e, access_token, refresh_token, results) {
        response.setHeader('Content-Type','application/json');
        if (e) {
          console.log(e);
          response.end(e);
        } else if (results.error) {
          console.log(results);
          response.end(JSON.stringify(results));
        } else {
          console.log('Obtained access_token: ', access_token);
          //console.log(results);
          //response.end( JSON.stringify(results) );
          response.json(results);
        }
      });
  } else {
    console.log('Unhandled url');
  }
  //res.redirect(`https://api.getgo.com/oauth/v2/token`
}