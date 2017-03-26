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

//=========================================================
// Bots Initial Message
//========================================================
bot.on('conversationalUpdate', function(session) {
    session.send("Hello. I'm your emotion advisor. Please show me a picture, so I could you some advice.");
}); 

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
var attachmentUrl = ""
bot.dialog('/',

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
                    url: attachmentUrl
                })
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var object = JSON.parse(body);
                    console.dir(object, { depth: null, colors: true })
                    var highEmotion = highProbability(object); 
                    var advice = giveAdvice(highEmotion); 
                    //session.send("You seem to rem " + highEmotion + ". I suggest you " + advice);
                    session.send(new builder.Message(session).attachments([advice]));
                }
            }
            );

        } else if (session.message.text.match(/hi/i) || session.message.text.match(/hello/i)){
            session.send("Hello. I'm your emotion advisor. Please show me a picture, so I could you some advice.");

        } else {
            session.send("Did you not hear me. I want a picture."); 
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
    return highestVal;
}

function giveAdvice(emotion) { 
    switch (emotion) {
        case 'anger': 
            return angerAdvice(); 
             break; 
        case 'contempt':
            return contemptAdvice(); 
            break;
        case 'disgust':
            return disgustAdvice(); 
            break;
        case 'fear': 
            return fearAdvice(); 
            break;
        case 'happiness':
            return happinessAdvice();           
            break; 
        case 'neutral':
            return neutralAdvice(); 
            break;
        case 'sadness': 
            return sadnessAdvice(); 
            break; 
        case 'surprise': 
            return surpriseAdvice(); 
            break; 
    }
}

function angerAdvice() {
    var card = new builder.ThumbnailCard()
        .title("Angry card")
        .text("You seem to be angry. I suggest you relieve some stress by pressing this button.")
    return card; 
}
function contemptAdvice() {
var card = new builder.HeroCard()
        .text("You seem contempt... I suggest you go out for a walk and enjoy the rest of the world.")
        .images([
            builder.CardImage.create("pity face", "https://refreshinglyrandom.files.wordpress.com/2015/05/cat-pity-face.jpg")
        ]);
    return card;
}
function disgustAdvice() {
    var card = new builder.HeroCard()
        .text("You seem to be disgusted. Haha.")
    return card;
}
function fearAdvice() {
    var card = new builder.HeroCard()
        .text("I seem to be scared. Take a deep breath and relax. Or would you like to call someone.")
    return card;
} 
function happinessAdvice() {
    var card = new builder.AnimationCard()
        .title("Happy Card")
        .text('You seem to be happy. Watch some cat videos! :D')
        .media([{
            profile: "cat",
            url: "http://25.media.tumblr.com/tumblr_m6kg3pMhpw1r2h6ioo1_400.gif"
        }]);
    return card;
}
function neutralAdvice() {
    var card = new builder.HeroCard()
        .title("Neutral Card")
        .text("You seem to be neutral. Smile some more please. :c")
        .images([
            builder.CardImage.create("flat face", "http://img00.deviantart.net/f591/i/2008/183/f/9/blank_face____hidden_feelngs___by_50500.jpg")
        ]);
    return card;
}
function sadnessAdvice() {
    var card = new builder.AudioCard()
        .title('Cat In the Kettle at the Peking Moon')
        .text('You seem to be sad. Just be happy. Watch some funny cat videos! Cheer up! ;D')
        .media([{url: 'http://www.wavlist.com/humor/003/chinese.wav'}
            ]);
        return card;
}

function surpriseAdvice() {
    var surprisingFacts = [
        "Did you know that the color of a hippo's sweat is pink?",
        "Did you know that mosquitoes have 47 teeth?",
        "A chameleon turns white when it is shocked.",
        "Koala's appendix is about 2 meters long.",
        "A squid has three hearts.",
        "An ostrich's brain is smaller than its eye, so it quickly forgets what it just learned."
    ]
    var randomPhrase = surprisingFacts[Math.floor(Math.random() * surprisingFacts.length)];

    var card = new builder.HeroCard()
        .title("Surprise Card")
        .text("You seem surprised. Let me share something surprising. " + randomPhrase)
        .images([
            builder.CardImage.create("flat face", "http://misccp3.cnu.edu.tw/myblog/201504/5841.png")
        ]);
    return card;
}
