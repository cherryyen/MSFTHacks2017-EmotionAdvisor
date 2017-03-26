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
                    //url: 'http://www.marcandangel.com/images/9-not-need-happy.jpg'
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
// function createAudioCard(session) {
//     return new builder.AudioCard(session)
//         .title('I am your father')
//         .subtitle('Star Wars: Episode V - The Empire Strikes Back')
//         .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
//         .image(builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
//         .media([
//             { url: 'http://www.wavlist.com/movies/004/father.wav' }
//         ])
//         .buttons([
//             builder.CardAction.openUrl(session, 'https://en.wikipedia.org/wiki/The_Empire_Strikes_Back', 'Read More')
//         ]);
// }
function angerAdvice() {
    return "You seem to be angry. I suggest you relieve some stress by pressing this button.";
}
function contemptAdvice() {
    return "You seem contempt. I suggest you go out for a walk and enjoy the rest of the world.";
}
function disgustAdvice() {  
    return "You seem to be disgusted. Haha."
}
function fearAdvice() {
    return "I seem to be scared. Take a deep breath and relax. Or would you like to call someone."; 
} 
function happinessAdvice() {
    var card = new builder.HeroCard()
        .title("happy card")
        .text('You seem to be happy. Watch some cat videos! :D')
        .images([
            builder.CardImage.create("https://docs.botframework.com/images/demo_bot_image.png")
        ]);
    return card;
}
function neutralAdvice() {
    return "You seem to be neutral. Smile some more please. :c";
}
function sadnessAdvice() {
    return "You seem to be sad. Just be happy. Watch some funny cat videos! Cheer up! ;D";
}
function surpriseAdvice() {
    return "You seem surprised. Would you like to hear something surprising?";
}
