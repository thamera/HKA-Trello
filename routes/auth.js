// auth.js - auth route module

var express = require('express');
var router = express.Router();
var g2m = require('../controllers/g2m');
var go2meet = require('../controllers/go2meet');
var http = require('http');

router.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

router.get('/g2m', g2m.authorize);
router.get('/g2mcode', go2meet.getUri);
router.get('/g2mtoken', go2meet.getToken);

module.exports = router;