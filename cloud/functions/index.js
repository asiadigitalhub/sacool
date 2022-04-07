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
    //https://asiahubmeta-assets.asiahubmeta.com/files/e21248e5-dcfd-425d-96f5-48e59278abc6.mp4?token=191e38bae940e96d00a3c12ebe31087e
    const token = request.query.token;
    const videoSrc = request.query.videoSrc;


    // const src = 'https://asiahubmeta-assets.asiahubmeta.com/files/'+videoSrc+'?token='+token;

    const src = request.query.src
    functions.logger.log('Video src', src);
    response.set('Content-Type', 'text/html');// eslint-disable-line
    response.send('<!DOCTYPE html>'+
    '<html>'+
      '<head>'+
       ' <meta property="og:image" content="https://asiahubmeta-assets.asiahubmeta.com/files/3172f11e-0f89-4a34-9a19-bf8193e21f56.jpg">'+
        '<link itemprop="thumbnailUrl" href="https://asiahubmeta-assets.asiahubmeta.com/files/554af03f-6b76-48be-bb95-6c7c56262079.jpg">'+
        '<meta property="og:image:width" content="1280">'+
       ' <meta property="og:image:height" content="720">'+
        '<meta property="og:url" content="https://metaverse.asiadigitalhub.net/metabar" />'+
        '<meta property="og:title" content="Metabar" />'+
    
        '<meta property="og:video" content="'+src+'" />'+
        '<meta property="og:description" content="Metabar description" /> '+
        '<meta charset="utf-8">'+
       ' <meta name="viewport" content="width=device-width, initial-scale=1">'+
        '<title>Metabar</title>'+
    
       ' <style media="screen">'+
            'body { background: #2e2e2e; color: rgba(0,0,0,0.87); font-family: Roboto, Helvetica, Arial, sans-serif;  }'+
            '.center {'+
                'text-align: center;'+
                '}'+
            'video.center {'+
                'display: block;'+
                'margin-left: auto;'+
                'margin-right: auto;'+
            '}'+

        '</style>'+
      '</head>'+
      '<body>'+
       ' <div class="center">'+
          '<video  class="center" controls>'+
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