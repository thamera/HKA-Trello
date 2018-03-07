/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var ICON_HKA = 'https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2FHKA-Caret.jpg?1516074405408';
var ICON_FD = 'https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2Ffd.png?1516074405366';
var BLACK_ROCKET_ICON = 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421';
var CALENDAR_WARNING_ICON = 'https://cdn.glitch.com/9b7e2234-5f27-4a29-ad86-70aa1d3db4d3%2Fcalendar-warning.svg?1504481230707';
var CALENDAR_STAR_ICON = 'https://cdn.glitch.com/9b7e2234-5f27-4a29-ad86-70aa1d3db4d3%2Fcalendar-star.svg?1504481230561';
var MILESTONE_ICON = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2Fonebit_11.png?1516838702748";
var RISK_ICON = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2Fonebit_49.png?1516838690494";
var CHECK2CARD_ICON = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2F005.png?1516838750019";
var SECURITY_ICON = "https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2Fonebit_25.png?1520310634792";

var TRELLOKEY = '2aa92cafd38af541fd512aa516050986'

var boardButtonCallback = function(t){
  return t.get('member','private','token')
  .then(function(token){
    if (!token) {
     return t.modal({
       title: 'Authorize HKA Trello App',
       args: { apiKey: TRELLOKEY }, // Pass in API key to the iframe
       url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
       height: 500,
       fullscreen:true,
       accentColor: '#3A96A3'
     });
    } else {
        return t.modal({
              url: './boardapp.html', // The URL to load for the iframe
              args: { apiKey: TRELLOKEY, apiToken: token }, // Optional args to access later with t.arg('text') on './modal.html'
              accentColor: '#3A96A3', // Optional color for the modal header 
              height: 500, // Initial height for iframe; not used if fullscreen is true
              fullscreen: true, // Whether the modal should stretch to take up the whole screen
              callback: function() { console.log('Goodbye.'); }, // optional function called if user closes modal (via `X` or escape)
              title: 'HKA Board App', // Optional title for modal header
              // You can add up to 3 action buttons on the modal header - max 1 on the right side.
            })
      }
  })
}

var checklist2CardButtonCallback = function(t){
  return t.get('member','private','token')
  .then(function(token){
    if (!token) {
     return t.modal({
       title: 'Authorize HKA Trello App',
       args: { apiKey: TRELLOKEY }, // Pass in API key to the iframe
       url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
       height: 500,
       fullscreen:true,
       accentColor: '#3A96A3'
     });
    } else {
      return t.modal({
        title: "Checklist To Cards",
        args: { apiKey: TRELLOKEY, apiToken: token },
        accentColor: '#3A96A3',
        height: 500,
        fullscreen: true,
        callback: function() { console.log('Goodbye.'); },
        url: 'checklist2cards.html'
      });
    }
  })
}

var sendToFreshdeskButtonCallback = function(t){
  return Promise.all([
    t.get('member','private'),
    t.get('board', 'shared', 'hka_freshdeskurl'),
  ])
  .spread(function(creds,hka_freshdeskurl){
    if (!creds.freshdeskApiKey) {
       return t.popup({
         icon: ICON_FD,
         title: 'Freshdesk Authentication Required',
         url: './app/freshdesk/freshdeskauth.html',
         height: 500,
         args: { redirectUrl: 'freshdeskLink', freshdeskUrl: hka_freshdeskurl }
       });
     } else {
       return t.modal({
         icon: ICON_FD,
         title: 'Generate Freshdesk Ticket',
         accentColor: '#3A96A3',
         height: 500,
         //fullscreen: true,
         args: {apiKey: TRELLOKEY, apiToken: creds.token, freshdeskKey: creds.freshdeskApiKey, freshdeskUrl: hka_freshdeskurl },
         url: './app/freshdesk/freshdeskcreate.html'
       });
    }
  });
}

var milestoneCardButtonCallback = function(t){
  return t.popup({
	  title: "Milestone Data",
	  url: 'milestoneinfo.html',
    height: 500
	});
}

var riskCardButtonCallback = function(t){
  return t.popup({
	  title: "Risk Management",
	  url: './app/riskmgmt/riskmgmtform.html',
    height: 500
	});
}

var securityRequirementsButtonCallback = function(t){
  return t.get('member','private','token')
  .then(function(token){
    if (!token) {
     return t.modal({
       title: 'Authorize HKA Trello App',
       args: { apiKey: TRELLOKEY }, // Pass in API key to the iframe
       url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
       height: 500,
       fullscreen:true,
       accentColor: '#3A96A3'
     });
    } else {
      return t.modal({
        title: "Security Requirements",
        args: { apiKey: TRELLOKEY, apiToken: token },
        accentColor: '#3A96A3',
        height: 500,
        fullscreen: true,
        callback: function() { console.log('Goodbye.'); },
        url: 'securityreq.html',
      });
    }
  })
}

var cardDetailBadgesSetup = function(t, options){
  var promise = Promise.all([
      t.get('board', 'shared'),
      t.list('id','name'),
      t.get('card', 'shared')
    ])
    .spread(function(boardData,currentList,cardData){
      var badges = [];
      if (currentList.id == boardData.milestonelist){
        var statusColor;
        
        if (cardData.milestone_status != undefined) {
          switch (cardData.milestone_status) {
            case "On Track":
              statusColor = 'green';
              break;
            case "At Risk":
              statusColor = 'yellow';
              break;
            case "Behind Schedule":
              statusColor = 'red';
              break;
            case "Defered/On Hold":
              statusColor = 'light gray';
              break;
            default :
              statusColor = 'red'
          }
          
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Milestone Status",
            text: cardData.milestone_status,
            color: statusColor
          })    
        }
        if (cardData.milestone_start != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Planned Start",
            text: cardData.milestone_start,
            color: statusColor
          })    
        }  
        if (cardData.milestone_anticipated != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Anticipated Completion",
            text: cardData.milestone_anticipated,
            color: statusColor
          })    
        }  
        if (cardData.milestone_actual != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Actual Completion",
            text: cardData.milestone_actual,
            color: statusColor
          })    
        }  
      }
      if (currentList.id == boardData.hka_risklist) {
        //console.dir(cardData);
        if (cardData.hka_riskStatus != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Risk Status",
            text: cardData.hka_riskStatus,
            color: 'light gray'
          })    
        } 
        if (cardData.hka_riskStatus != undefined) {
          var Prob = Number(cardData.hka_riskProbability);
          var Impact = Number(cardData.hka_riskImpact);
          var score = Prob * Impact;
          
          var scoreData = getScoreColor(score);
          var probData = getScoreLabel(Prob);
          var impactData = getScoreLabel(Impact);
          
          badges.push({
              icon: impactData.badgeIcon + "?color=fff",
              title: "Probability",
              text: probData.text,
              color: probData.color
            },{
              icon: impactData.badgeIcon + "?color=fff",
              title: "Impact",
              text: impactData.text,
              color: impactData.color
            },{
              icon: scoreData.badgeIcon + "?color=fff",
              title: "Risk Score",
              text: score,
              color: scoreData.color
          })   
        }
        if (cardData.hka_riskImpactSchedule != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Schedule Impact",
            text: cardData.hka_riskImpactSchedule + ' days',
            color: 'light blue'
          })    
        } 
        if (cardData.hka_riskImpactCost != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Cost Impact",
            text: '$ ' + parseFloat(cardData.hka_riskImpactCost).toFixed(2),
            color: 'green'
          })    
        } 
        if (cardData.hka_riskResponse != undefined) {
          badges.push({
            //icon: BLACK_ROCKET_ICON,
            title: "Risk Response",
            text: cardData.hka_riskResponse,
            color: 'light gray'
          })    
        } 
      }
      return badges;
    })

    return promise;
}

var cardBadgesSetup = function(t, options){
  var promise = Promise.all([
    t.get('board', 'shared'),
    t.list('id','name'),
    t.get('card', 'shared'),
    t.card('attachments')
  ])
  .spread(function(boardData,currentList,cardData,card){
    var badges = [];
    //alert(JSON.stringify(cardData));
    if (currentList.id == boardData.milestonelist){
      var statusColor = 'light gray';
      var badgeText = 'Milestone Undefined';
      var badgeIcon = CALENDAR_STAR_ICON;

      switch (cardData.milestone_status) {
        case "On Track":
          statusColor = 'green';
          break;
        case "At Risk":
          statusColor = 'yellow';
          badgeIcon = CALENDAR_WARNING_ICON;
          break;
        case "Behind Schedule":
          statusColor = 'red';
          badgeIcon = CALENDAR_WARNING_ICON;
          break;
        case "Defered/On Hold":
          statusColor = 'light gray';
          break;
        default :
          statusColor = 'red'
      }
      
      if (cardData.milestone_actual != undefined && cardData.milestone_actual != ""){
        badgeText = cardData.milestone_actual;
      } else {
        if(cardData.milestone_anticipated != undefined && cardData.milestone_anticipated != "" ) {
          badgeText = cardData.milestone_anticipated;
        }
      }

      badges.push({
        //icon: BLACK_ROCKET_ICON,
        title: "Milestone Status",
        text: badgeText,
        icon: badgeIcon + "?color=fff",
        color: statusColor
      })    
    } 
    if (currentList.id == boardData.hka_risklist) {
      var statusColor = 'light gray';
      var badgeText = 'Risk Score: ';
      var badgeIcon = CALENDAR_STAR_ICON;
      
      var score = Number(cardData.hka_riskProbability) * Number(cardData.hka_riskImpact);
      
      var scoreData = getScoreColor(score);
      
      if (cardData.hka_riskStatus === "Closed") {
                    badgeText = "Closed Risk";
                    statusColor = 'light gray';
      } else if (isNaN(score) || score === ""){
        badgeText = "Risk Not Scored";
      } else {
          badgeText += score;
      }

      badges.push({
        title: "Risk Score",
        text: badgeText,
        icon: scoreData.badgeIcon + "?color=fff",
        color: scoreData.color
      })       
   }
    
    // If card has freshdesk attachments
    if (card.attachments.length > 1){
      var attachments = card.attachments.filter(attch => (attch.url.indexOf('freshdesk.com') != -1)).length;
      if (attachments > 0 ) {
        badges.push({
          title: "Freshdesk Tickets",
          text: attachments,
          icon: ICON_FD
        })
      }
    }
    
    // If card has security requirements
    var securityReqsCount = 0;
    var completedSecurityReqs = 0;
    var hasSecurityReqs = false;
    for (var property in cardData) {
      if (cardData[property].isSecurityReq) {
        hasSecurityReqs = true;
        securityReqsCount++;
        if (cardData[property].complete == false) { completedSecurityReqs++; }
      }
    }
    if (hasSecurityReqs){
      badges.push({
        title: "Security Requirements",
        text: completedSecurityReqs + ' of ' + securityReqsCount,
        icon: SECURITY_ICON
      })
    }
    
    return badges;
  })
  

  return promise;
}

function getScoreColor(score) {
  switch (true) {
        case (score < 3):
          return {color: 'yellow',badgeIcon : CALENDAR_WARNING_ICON};
          break;
        case (score > 2 && score < 6):
          return {color: 'orange',badgeIcon : CALENDAR_WARNING_ICON};
          break;
        case (score > 5):
          return {color: 'red',badgeIcon : CALENDAR_WARNING_ICON};
          break;
        default :
          return {color: 'green',badgeIcon : CALENDAR_WARNING_ICON};
      }
}

function getScoreLabel(value){
   switch (value) {
        case 1: 
            return {text:'Low',color: 'yellow',badgeIcon : CALENDAR_WARNING_ICON}
            break;
        case 2: 
            return {text:'Medium',color: 'orange',badgeIcon : CALENDAR_WARNING_ICON}
            break;
        case 3: 
            return {text:'High',color: 'red',badgeIcon : CALENDAR_WARNING_ICON}
            break;
        default:
            return {text:'',color: 'light gray',badgeIcon : CALENDAR_WARNING_ICON}
            break;
    }
}

TrelloPowerUp.initialize({
  // Start adding handlers for your capabilities here!
  'attachment-sections': function(t, options){
    return Promise.all([
      t.get('member','private'),
      t.get('board', 'shared', 'hka_freshdeskurl'),
    ])
    .spread(function(creds,hka_freshdeskurl){
      var claimed = options.entries.filter(function (attachment) {
        return attachment.name.indexOf('CreatedFromChecklist') === 0;
      });
      var freshdeskClaim = options.entries.filter(function (attachment) {
        return attachment.url.indexOf('.freshdesk.com/') != -1 && attachment.url.indexOf('/tickets/') != -1;
      });

      var sections = [];

      // Setup Checklist to Card Attachments
      if (claimed && claimed.length > 0) {
        sections.push({
          id: 'ChecklistLink',
          claimed: claimed,
          icon: CHECK2CARD_ICON,
          title: 'Created From Checklist',
          content: {
            type: 'iframe',
            url: t.signUrl('./app/checklists/checklisturl.html', {
                arg: 'checklistLink'
            })
          }
        });
      }

      // Setup Freshdesk Attachments
      if (freshdeskClaim && freshdeskClaim.length > 0 ) {
         if (!creds.freshdeskApiKey) {
           sections.push({
             id: 'FreshdeskLink',
              claimed: freshdeskClaim,
              icon: ICON_FD,
              title: 'Freshdesk Authentication Required',
              content: {
                type: 'iframe',
                url: t.signUrl('./app/freshdesk/freshdeskauth.html', {
                    freshdeskUrl: hka_freshdeskurl
                })
              }
            });
         } else {
          sections.push({
              id: 'FreshdeskLink',
              claimed: freshdeskClaim,
              icon: ICON_FD,
              title: 'Freshdesk Ticket',
              content: {
                type: 'iframe',
                url: t.signUrl('./app/freshdesk/freshdeskurl.html', {
                    apiKey: creds.freshdeskApiKey, freshdeskUrl: hka_freshdeskurl
                })
              }
            });
         }
      }

      return sections;
    });
  },
  'board-buttons': function(t, options){
    return [{
      icon: ICON_HKA ,
      text: 'HKA Trello App',
      callback: boardButtonCallback
    }]
  },
  'card-buttons': function(t, options) {
    var promise = Promise.all([
      t.get('board', 'shared'),
      t.list('id','name')
    ])
    .spread(function(boardProps,currentList){
      var buttons = [{
        icon: CHECK2CARD_ICON,
        text: "Checklist to Cards",
        callback: checklist2CardButtonCallback
      },
       {
         icon: ICON_FD,
         text: "Send To Freshdesk",
         callback: sendToFreshdeskButtonCallback
       },
       {
         icon: SECURITY_ICON,
         text: "Security Requirements",
         callback: securityRequirementsButtonCallback
       }];
      if (currentList.id == boardProps.milestonelist){
        buttons.push({
          icon: MILESTONE_ICON,
          text: "Milestone Info",
          callback: milestoneCardButtonCallback
        })         
      } else if (currentList.id == boardProps.hka_risklist){
        buttons.push({
          icon: RISK_ICON,
          text: "Risk Management",
          callback: riskCardButtonCallback
        }) 
      }
      return buttons;
    })

    return promise;
  },
  'card-badges': function(t, options) {
    var badges = cardBadgesSetup(t, options);
    return badges;
  },
  'card-detail-badges': function(t, options) {
    var detailBadges = cardDetailBadgesSetup(t,options);

    return detailBadges;
  },
  'show-settings': function(t, options){
    return t.popup({
      title: 'HKA-Trello Settings',
      url: './settings.html',
      height: 184
    })
  },
  'authorization-status': function(t, options){
    return t.get('member', 'private', 'token')
    .then(function(token){
      if(token){
        return { authorized: true };
      }
      return { authorized: false };
    });
  },
  'show-authorization': function(t, options){
    if (TRELLOKEY) {
      return t.popup({
        title: 'Authorize HKA Trello App',
        args: { apiKey: TRELLOKEY }, // Pass in API key to the iframe
        url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
        height: 140,
      });
    } else {
      console.log("🙈 Looks like you need to add your API key to the project!");
    }
  }
});