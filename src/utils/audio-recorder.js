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

const pool = {
    audio: null,
    rec: null,
    blob: null
};

const firebaseConfig = {
    apiKey: "AIzaSyDdLLiYv-72_ZLHcp7Pk5xZGiGgJDrkhdU",
    authDomain: "forward-camera-345608.firebaseapp.com",
    projectId: "forward-camera-345608",
    storageBucket: "forward-camera-345608.appspot.com",
    messagingSenderId: "949882238628",
    appId: "1:949882238628:web:53b3d7bbb93db13c579831",
    measurementId: "G-FJ41DDTBZH"
};

const app = initializeApp(firebaseConfig, "[NewMetaverse]");
const auth = getAuth(app);
const storage = getStorage(app);

export const start = () => {
    let audio = pool.audio;
    if (!audio) {
        audio = document.createElement('audio');
        audio.style.display = 'none';
        document.body.appendChild(audio);
        pool.audio = audio;
    }
    console.log('request mic permiss');
    let audioChunks = [];
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
                    ask();
                }, 100);
            }, 4500);
        })
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

export const ask = async () => {
    // bot first response
    let timeoutID = setTimeout(() => {
        textToSpeech('Để tôi suy nghĩ cái rồi tôi trả lời bạn nha.');
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
        Axios({
            url: `http://localhost:5001/forward-camera-345608/us-central1/helloWorld?audio=${encodeURIComponent(url)}`,
            method: 'GET'
        }).then(res => {
            clearTimeout(timeoutID);
            console.log(res.data);
            // return bot response
            if (res.data.answer) {
                textToSpeech(res.data.answer);
            }
        });
    }
}

export const textToSpeech = (text, languageCode) => {
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
            audio.play();
        })
}

window.AI = {
    startAsk: start,
    stopAsk: stop,
    askBot: ask,
    textToSpeech: textToSpeech,
    pool: pool
}