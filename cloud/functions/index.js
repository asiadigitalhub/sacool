const functions = require('firebase-functions')
const speech = require('@google-cloud/speech')
const dialogflow = require('@google-cloud/dialogflow')
const axios = require('axios')
const { defineString } = require('firebase-functions/params')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

initializeApp()

const db = getFirestore()
const gptAPIKey = defineString('GPT_API_KEY')

// const fs = require('fs');
const cors = require('cors')({
  origin: true
})

const client = new speech.SpeechClient({
  keyFilename: './speech-key.json'
})

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: './speech-key.json'
})

exports.shareVideo = functions.https.onRequest((request, response) => {
  //https://asiahubmeta-assets.asiahubmeta.com/files/e21248e5-dcfd-425d-96f5-48e59278abc6.mp4?token=191e38bae940e96d00a3c12ebe31087e
  const token = request.query.token
  const videoSrc = request.query.videoSrc

  // const src = 'https://asiahubmeta-assets.asiahubmeta.com/files/'+videoSrc+'?token='+token;

  const src = request.query.src
  functions.logger.log('Video src', src)
  response.set('Content-Type', 'text/html') // eslint-disable-line
  response.send(
    '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      ' <meta property="og:image" content="https://asiahubmeta-assets.asiahubmeta.com/files/3172f11e-0f89-4a34-9a19-bf8193e21f56.jpg">' +
      '<link itemprop="thumbnailUrl" href="https://asiahubmeta-assets.asiahubmeta.com/files/554af03f-6b76-48be-bb95-6c7c56262079.jpg">' +
      '<meta property="og:image:width" content="1280">' +
      ' <meta property="og:image:height" content="720">' +
      '<meta property="og:url" content="https://metaverse.asiadigitalhub.net/metabar" />' +
      '<meta property="og:title" content="Metabar" />' +
      '<meta property="og:video" content="' +
      src +
      '" />' +
      '<meta property="og:description" content="Metabar description" /> ' +
      '<meta charset="utf-8">' +
      ' <meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Metabar</title>' +
      ' <style media="screen">' +
      'body { background: #2e2e2e; color: rgba(0,0,0,0.87); font-family: Roboto, Helvetica, Arial, sans-serif;  }' +
      '.center {' +
      'text-align: center;' +
      '}' +
      'video.center {' +
      'display: block;' +
      'width: 100%;' +
      'margin-left: auto;' +
      'margin-right: auto;' +
      '}' +
      '</style>' +
      '</head>' +
      '<body>' +
      ' <div class="center">' +
      '<video  class="center" controls>' +
      ' <source src="' +
      src +
      '" type="video/mp4">' +
      ' </video>' +
      '</div>' +
      ' </body>' +
      '</html>'
  ) // eslint-disable-line
})

exports.translate = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    // const filename = './sample.mp3';
    const encoding = 'MP3'
    // const sampleRateHertz = 16000;
    const languageCode = request.query.languageCode || 'vi-VN'

    const config = {
      encoding: encoding,
      // sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    }

    const audio = {
      // content: fs.readFileSync(filename).toString('base64'),
      uri: decodeURIComponent(request.query.audio)
    }

    const rq = {
      config: config,
      audio: audio
    }

    const [operation] = await client.longRunningRecognize(rq)

    // Get a Promise representation of the final result of the job
    const [res] = await operation.promise()
    const transcription = res.results.map(result => result.alternatives[0].transcript).join('\n')
    console.log(`Transcription: ${transcription}`)
    console.log(res)
    //
    if (transcription) {
      const sessionPath = sessionClient.projectAgentSessionPath('forward-camera-345608', '696969')
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: transcription,
            languageCode: languageCode
          }
        }
      }
      const responses = await sessionClient.detectIntent(request)
      if (responses) {
        const text = responses[0].queryResult.fulfillmentText
        console.log(text)
        return response.send({
          ask: transcription,
          raw: responses,
          answer: text
        })
      }
    }
    //
    return response.send({
      ask: transcription,
      answer: null
    })
  })
})

exports.translateOnly = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    // const filename = './sample.mp3';
    const encoding = 'MP3'
    // const sampleRateHertz = 16000;
    const languageCode = request.query.languageCode || 'vi-VN'

    const config = {
      encoding: encoding,
      // sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    }

    const audio = {
      // content: fs.readFileSync(filename).toString('base64'),
      uri: decodeURIComponent(request.query.audio)
    }

    const rq = {
      config: config,
      audio: audio
    }

    const [operation] = await client.longRunningRecognize(rq)

    // Get a Promise representation of the final result of the job
    const [res] = await operation.promise()
    const transcription = res.results.map(result => result.alternatives[0].transcript).join('\n')
    console.log(`Transcription: ${transcription}`)
    console.log(res)
    //
    return response.send({
      ask: transcription,
      answer: null
    })
  })
})

exports.gentext = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const usage = db.collection('usage').doc('data')
    const doc = await usage.get()
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      let usageData = doc.data()
      if (usageData['current'] >= usageData['limit']) {
        return response.send({ message: 'limit usage' });
      }
      await db
        .collection('usage')
        .doc('data')
        .set({
          current: usageData['current'] + 1,
          limit: usageData['limit']
        })
      const instance = axios.create({
        baseURL: 'https://api.openai.com'
      })
      // Alter defaults after instance has been created
      instance.defaults.headers.common['Authorization'] = 'Bearer ' + gptAPIKey.value()
      instance.defaults.timeout = 30000

      console.log('request.query.text')
      console.log(request.body.text)
      var model = 'davinci:ft-personal-2023-02-22-10-51-16';
      if(request.body.model){
        model = request.body.model;
      }
      var maxToken = 200;
      if(request.body.maxToken){
        maxToken = request.body.maxToken;
      }
      var temperature = 0.66;
      if(request.body.temperature){
        temperature = request.body.temperature;
      }

      var startDate = new Date();

      const resultPredictions = await instance
        .post('/v1/completions', {
          prompt: request.body.text,
          max_tokens: maxToken,
          model:model,
          top_p: 1,
          presence_penalty: 0.6,
          frequency_penalty: 0,
          best_of: 1,
          temperature: temperature,
          stop: 'Human:'
        })
        .then(function (response) {
          console.log('response.data')
          console.log(response.data)
          return response.data
        })
        .catch(error => {
          console.log('console.error(error);')
          console.log(error)
        })

      var endDate = new Date();
      var diff = endDate - startDate; //milliseconds interval

      resultPredictions["chatgpt_time_milisecond"] = diff

      return response.send(resultPredictions)
    }
    return response.send({ message: 'limit usage' })
  })
})
