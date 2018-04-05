// api.js - api route module

var express = require('express');
var router = express.Router();
var riskLog = require('../controllers/riskLog');
var sprintReport = require('../controllers/sprintReport');
var securityLog = require('../controllers/securityLog');
var cardPrinter = require('../controllers/cardPrinter');
var meetingPrinter = require('../controllers/meetingPrinter');
var http = require('http');

// Require controller modules
//var sprint_report_controller = require('../controllers/sprintReport');

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

router.post('/riskLog', riskLog.postLog);
router.post('/sprintReport', sprintReport.postReport);
router.post('/securityLog', securityLog.postLog);
router.post('/meetingPrinter', meetingPrinter.postReport);
router.post('/cardPrinter', cardPrinter.postReport);

module.exports = router;