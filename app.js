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
    function (session) {
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
                    console.dir(object, { depth: null, colors: true })
                    var highEmotion = highProbability(object); 
                    var advice = giveAdvice(highEmotion); 
                    session.send("You are " + highEmotion + ". I suggest you " + advice);
                }
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
// Emotion Related Stuff
//=========================================================
function highProbability(scoreData) {
    var highest = 0;
    var anger = scoreData[0].scores['anger'];
    var contempt = scoreData[0].scores['contempt'];
    var disgust = scoreData[0].scores['disgust'];
    var fear = scoreData[0].scores['fear'];
    var happiness = scoreData[0].scores['happiness'];
    var neutral = scoreData[0].scores['neutral'];
    var sadness = scoreData[0].scores['sadness'];
    var surprise = scoreData[0].scores['surprise'];

    var emotionArray = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']

    var highest = Math.max(anger, contempt, disgust, fear, happiness, neutral, sadness, surprise);
    var highestVal = 0;
    for (var i = 0; i < emotionArray.length; i++) {
        if (highest == scoreData[0].scores[emotionArray[i]])
            highestVal = emotionArray[i];
    }
    //var highestVal = array.find(function(scoreData){return score.Data[0].scores == highest})
    //alert(highestVal);
    return highestVal
}

function giveAdvice(emotion) { 
    var adviceGiven; 
    switch (emotion) {
        case 'anger': 
             return "I suggest you relieve some stress.";
             break; 
        case 'contempt':
            return "lalalala be happy.";
            break;
        case 'disgust':
            return "I think you're disgusting."
            break;
        case 'fear': 
            return "Take a deep breath :D"; 
            break;
        case 'happiness':
            return 'Watch some cat videos'; 
            break; 
        case 'neutral':
            return "Smile some more please :c";
            break;
        case 'sadness': 
            return "Watch some funny cat videos ;D";
            break; 
        case 'surprise': 
            return "Let's party";
            break; 
    }
}