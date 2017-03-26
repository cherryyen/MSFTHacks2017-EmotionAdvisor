var restify = require('restify');
var builder = require('botbuilder');
var request = require('request'); 
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
var attachmentUrl = ""
bot.dialog('/', 
    //function (session) {
    //session.send("Hello World");
    /*
    session.send("You can easily send pictures to a user...");
        var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
            }]);
        session.endDialog(msg);
    */    
    function(session) {
        var msg = session.message; 
        if (msg.attachments.length) {
            var attachmentUrl = msg.attachments[0].contentUrl;
            if (attachmentUrl.match(/localhost/)) {
                attachmentUrl = 'http://www.marcandangel.com/images/9-not-need-happy.jpg';
            }
            console.log(attachmentUrl); 
            var request = require('request');
            
            request({
                method: 'POST',
                url: 'https://api.projectoxford.ai/emotion/v1.0/recognize',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': 'eb400f39f23a4a4aadd248358e98f3e7'
                },
                body: JSON.stringify({
                    //url: 'http://www.marcandangel.com/images/9-not-need-happy.jpg'
                    url: attachmentUrl
                })
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var object = JSON.parse(body);
                    console.dir(object, {depth: null, colors: true})
                }
            }, function(success) {
                console.log("yay it worked")
            }
               
            ); 
            /*var resend = new builder.Message(session)
                .attachments([{
                    contentType: "image/jpeg",
                    contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
                }]);
            */
            //session.endDialog(msg);
        } else {
            session.send("you said " + session.message.text); 

        }
    }
);


//=========================================================
// Emotion API
//=========================================================
/*
request({
    method: 'POST',
    url: 'https://api.projectoxford.ai/emotion/v1.0/recognize',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': 'eb400f39f23a4a4aadd248358e98f3e7'
    },
    body: JSON.stringify({
        //url: 'http://www.marcandangel.com/images/9-not-need-happy.jpg'
        url: attachmentUrl
    })
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var object = JSON.parse(body);
        console.dir(object, {depth: null, colors: true})
    }
}, function(success) {
    console.log("yay it worked")
}
   
); 
*/