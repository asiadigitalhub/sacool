const functions = require("firebase-functions");
const speech = require('@google-cloud/speech');
const dialogflow = require('@google-cloud/dialogflow');
// const fs = require('fs');

const client = new speech.SpeechClient({
    keyFilename: "./speech-key.json"
});

const sessionClient = new dialogflow.SessionsClient({
    keyFilename: "./dialogflow-key.json"
});

exports.shareVideo = functions.https.onRequest((request, response) => {
    const src = request.query.src;
    functions.logger.log('Video src', src);
    response.set('Content-Type', 'text/html');// eslint-disable-line
    response.send('<!DOCTYPE html>'+
    '<html>'+
      '<head>'+
       ' <meta property="og:image" content="https://i.ytimg.com/vi/IHFmCA9AVtc/maxresdefault.jpg">'+
        '<link itemprop="thumbnailUrl" href="https://i.ytimg.com/vi/IHFmCA9AVtc/maxresdefault.jpg">'+
        '<meta property="og:image:width" content="1280">'+
       ' <meta property="og:image:height" content="720">'+
        '<meta property="og:url" content="https://developers.zalo.me/" />'+
        '<meta property="og:title" content="My Video" />'+
    
        '<meta property="og:video" content="'+src+'" />'+
        '<meta property="og:description" content="Trang thông tin về Zalo dành cho cộng đồng lập trình viên" /> '+
        '<meta charset="utf-8">'+
       ' <meta name="viewport" content="width=device-width, initial-scale=1">'+
        '<title>Welcome to Firebase Hosting</title>'+
    
        '<style media="screen">'+
          'body { background: #ECEFF1; color: rgba(0,0,0,0.87); font-family: Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }'+
          '#message { background: white; max-width: 360px; margin: 100px auto 16px; padding: 32px 24px; border-radius: 3px; }'+
         ' #message h2 { color: #ffa100; font-weight: bold; font-size: 16px; margin: 0 0 8px; }'+
        '  #message h1 { font-size: 22px; font-weight: 300; color: rgba(0,0,0,0.6); margin: 0 0 16px;}'+
         ' #message p { line-height: 140%; margin: 16px 0 24px; font-size: 14px; }'+
         ' #message a { display: block; text-align: center; background: #039be5; text-transform: uppercase; text-decoration: none; color: white; padding: 16px; border-radius: 4px; }'+
         ' #message, #message a { box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); }'+
         ' #load { color: rgba(0,0,0,0.4); text-align: center; font-size: 13px; }'+
         ' @media (max-width: 600px) {'+
            'body, #message { margin-top: 0; background: white; box-shadow: none; }'+
            'body { border-top: 16px solid #ffa100; }'+
         ' }'+
       ' </style>'+
      '</head>'+
      '<body>'+
       ' <div id="message">'+
        '  <h2>Welcome</h2>'+
          '<video width="400" controls>'+
           ' <source src="'+src+'" type="video/mp4">'+
         ' </video>'+
          
        '</div>'+
       
     ' </body>'+
    '</html>'
    ); // eslint-disable-line
  });
  

exports.helloWorld = functions.https.onRequest(async (request, response) => {
    // const filename = './sample.mp3';
    const encoding = 'MP3';
    // const sampleRateHertz = 16000;
    const languageCode = request.query.languageCode || 'vi-VN';

    const config = {
        encoding: encoding,
        // sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
    };

    const audio = {
        // content: fs.readFileSync(filename).toString('base64'),
        uri: decodeURIComponent(request.query.audio)
    };

    const rq = {
        config: config,
        audio: audio,
    };

    const [operation] = await client.longRunningRecognize(rq);

    // Get a Promise representation of the final result of the job
    const [res] = await operation.promise();
    const transcription = res.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log(`Transcription: ${transcription}`);
    console.log(res);
    //
    if (transcription) {
        const sessionPath = sessionClient.projectAgentSessionPath('fir-virtual-meeting', '696969');
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: transcription,
                    languageCode: languageCode,
                },
            },
        };
        const responses = await sessionClient.detectIntent(request);
        if (responses) {
            const text = responses[0].queryResult.fulfillmentText;
            console.log(text);
            return response.send({
                ask: transcription,
                answer: text
            });
        }
    }
    //
    return response.send({
        ask: transcription,
        answer: null
    });
});