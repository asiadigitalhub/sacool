import {
    initializeApp
} from "firebase/app";
import {
    getAuth,
    signInAnonymously
} from "firebase/auth";
import {
    getStorage,
    ref,
    uploadString
} from "firebase/storage";
import Axios from "axios";
import configs from "./configs";
const pool = {
    audio: null,
    rec: null,
    blob: null
};

var firebase_apiKey ='';
var firebase_authDomain ='';
var firebase_databaseURL ='';
var firebase_projectId ='';
var firebase_storageBucket ='';
var firebase_messagingSenderId ='';
var firebase_appId ='';
var firebase_measurementId ='';
try {
  firebase_apiKey =  configs.feature("default_firebase_apiKey");
  firebase_authDomain =  configs.feature("default_firebase_authDomain");
  firebase_databaseURL =  configs.feature("default_firebase_databaseURL");
  firebase_projectId  =  configs.feature("default_firebase_projectId");
  firebase_storageBucket =  configs.feature("default_firebase_storageBucket");
  firebase_messagingSenderId =  configs.feature("default_firebase_messagingSenderId");
  firebase_appId =  configs.feature("default_firebase_appId");
  firebase_measurementId =  configs.feature("default_firebase_measurementId");
  console.log('firebase_apiKey' , firebase_apiKey);
} catch (error) {
}
  const firebaseConfig = {
  apiKey: firebase_apiKey,
  authDomain: firebase_authDomain,
  databaseURL: firebase_databaseURL,
  projectId:firebase_projectId,
  storageBucket: firebase_storageBucket,
  messagingSenderId:firebase_messagingSenderId,
  appId: firebase_appId,
  measurementId: firebase_measurementId
};

const app = initializeApp(firebaseConfig, "[NewMetaverse]");
const auth = getAuth(app);
const storage = getStorage(app);

export const start = (talk, stopTalk) => {
    let audio = pool.audio;
    if (!audio) {
        audio = document.createElement('audio');
        audio.style.display = 'none';
        document.body.appendChild(audio);
        pool.audio = audio;
    }
    console.log('request mic permiss');
    let audioChunks = [];
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({
                audio: true
            })
            .then(stream => {
                console.log('prepare recording');
                let rec = new MediaRecorder(stream);
                rec.addEventListener('dataavailable', e => {
                    console.log('rec.ondataavailable');
                    audioChunks.push(e.data);
                    if (rec.state == "inactive") {
                        let blob = new Blob(audioChunks, {
                            type: 'audio/mp3'
                        });
                        pool.blob = blob;
                        audio.src = URL.createObjectURL(blob);
                        audio.controls = true;
                        audio.autoplay = true;
                        audio.volume = 0;
                    }
                });
                pool.rec = rec;
                rec.addEventListener('start', e => {
                    console.log('rec.onstart');
                    console.log(e);
                })
                console.log('start');
                rec.start();
                setTimeout(() => {
                    stop();
                    setTimeout(() => {
                        ask(talk, stopTalk).then(res => resolve(res));
                    }, 100);
                }, 4500);
            });
    });
}

export const stop = () => {
    console.log('stop recording');
    pool.rec.stop();
}

export const blobToBase64 = async blob => {
    console.log(blob);
    const reader = new FileReader();
    return new Promise(resolve => {
        reader.addEventListener('loadend', () => {
            const result = reader.result;
            resolve(result);
        });
        reader.readAsDataURL(blob);
    });
}

export const ask = async (talk, stopTalk) => {
    // bot first response
    const languageCode = APP.store.state.preferences.locale || 'en';
    const preText = {
        vi: 'Để tôi suy nghĩ cái rồi tôi trả lời bạn nha.',
        en: 'Let me thing...'
    }
    let timeoutID = setTimeout(() => {
        textToSpeech(preText[languageCode], languageCode, talk, stopTalk);
    }, 5000);
    // upload mp3 file to server
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    const base64 = await blobToBase64(pool.blob);
    const path = `${auth.currentUser.uid}-${new Date() - 0}.mp3`;
    const storageRef = ref(storage, path);
    const result = await uploadString(storageRef, base64, 'data_url');
    if (result && result.ref) {
        console.log(result);
        const url = `gs://${firebaseConfig.storageBucket}/${path}`;
        // call cloud func api to ask bot
        return new Promise(resolve => {
            Axios({
                url: `https://us-central1-forward-camera-345608.cloudfunctions.net/translate?audio=${encodeURIComponent(url)}&languageCode=${languageCode}`,
                method: 'GET',
            }).then(res => {
                clearTimeout(timeoutID);
                console.log(res.data);
                resolve(res.data);
                // return bot response
                if (res.data.answer) {
                    textToSpeech(res.data.answer, languageCode, talk, stopTalk);
                }
            });
        })
    }
}

export const textToSpeech = (text, languageCode, talk, stopTalk) => {
    const url = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyDdLLiYv-72_ZLHcp7Pk5xZGiGgJDrkhdU'
    const data = {
        'input': {
            'text': text
        },
        'voice': {
            'languageCode': languageCode || 'vi-VN',
            'ssmlGender': 'FEMALE'
        },
        'audioConfig': {
            'audioEncoding': 'MP3'
        }
    };
    const otherparam = {
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data),
        method: "POST"
    };
    fetch(url, otherparam)
        .then(data => {
            return data.json();
        })
        .then(res => {
            const audio = document.createElement('audio');
            audio.src = `data:audio/mpeg;base64,${res.audioContent}`;
            audio.onended = () => {
                stopTalk && stopTalk();
            };
            audio.play();
            talk && talk();
        })
}

window.AI = {
    startAsk: start,
    stopAsk: stop,
    askBot: ask,
    textToSpeech: textToSpeech,
    pool: pool
}