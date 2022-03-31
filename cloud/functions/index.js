const functions = require("firebase-functions");
const speech = require('@google-cloud/speech');
const dialogflow = require('@google-cloud/dialogflow');
const fs = require('fs');

const client = new speech.SpeechClient({
    keyFilename: "./speech-key.json"
});

const sessionClient = new dialogflow.SessionsClient({
    keyFilename: "./dialogflow-key.json"
});

exports.helloWorld = functions.https.onRequest(async (request, response) => {
    //
    const filename = './sample.mp3';
    const encoding = 'MP3';
    const sampleRateHertz = 16000;
    const languageCode = 'vi-VN';

    const config = {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
    };

    const audio = {
        content: fs.readFileSync(filename).toString('base64'),
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
            console.log('[responses]');
            console.log(responses);
            console.log(responses[0].outputAudio);
            response.send(responses[0]);
        }
        response.end();
        return;
    }
    //
    response.send(`Transcription: ${transcription}\n`);
});