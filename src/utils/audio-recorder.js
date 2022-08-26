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

var firebase_apiKey = '';
var firebase_authDomain = '';
var firebase_databaseURL = '';
var firebase_projectId = '';
var firebase_storageBucket = '';
var firebase_messagingSenderId = '';
var firebase_appId = '';
var firebase_measurementId = '';
try {
    firebase_apiKey = configs.feature("default_firebase_apiKey");
    firebase_authDomain = configs.feature("default_firebase_authDomain");
    firebase_databaseURL = configs.feature("default_firebase_databaseURL");
    firebase_projectId = configs.feature("default_firebase_projectId");
    firebase_storageBucket = configs.feature("default_firebase_storageBucket");
    firebase_messagingSenderId = configs.feature("default_firebase_messagingSenderId");
    firebase_appId = configs.feature("default_firebase_appId");
    firebase_measurementId = configs.feature("default_firebase_measurementId");
    console.log('firebase_apiKey', firebase_apiKey);
} catch (error) {}
const firebaseConfig = {
    apiKey: firebase_apiKey,
    authDomain: firebase_authDomain,
    databaseURL: firebase_databaseURL,
    projectId: firebase_projectId,
    storageBucket: firebase_storageBucket,
    messagingSenderId: firebase_messagingSenderId,
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
        // textToSpeech(preText[languageCode], languageCode, talk, stopTalk);
        talkWithLipSync(preText[languageCode], 1, languageCode, talk, stopTalk);
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
                    // textToSpeech(res.data.answer, languageCode, talk, stopTalk);
                    talkWithLipSync(res.data.answer, 1, languageCode, talk, stopTalk);
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
            'name': 'en-US-Wavenet-B',
            'ssmlGender': 'MALE'
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
                if (stopTalk) {
                    stopTalk();
                } else {
                    if (window.AI.stopLipsSync) {
                        window.AI.stopLipsSync();
                    }
                }
            };
            audio.play();
            if (talk) {
                talk();
            } else {
                if (window.AI.startLipsSync) {
                    window.AI.startLipsSync();
                }
            }
        })
}

const stringToNumber = s => {
    const numMap = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
    if (s == 0) return numMap[0]
    if (~~s > 0) return numMap[~~s]
    return ''
}

const dictionary = {
    aa: 'a á à ả ã ạ ă ắ ằ ẳ ẵ ặ â ấ ầ ẩ ẫ ậ',
    E: 'e é è ẻ ẽ ẹ ê ế ề ể ễ ệ',
    I: 'i í ì ỉ ĩ ị l y',
    O: 'o ó ò ỏ õ ọ ô ố ồ ổ ỗ ộ ơ ớ ờ ở ỡ ợ',
    U: 'u ú ù ủ ũ ụ ư ứ ừ ử ữ ự v w q',
    PP: 'p b',
    FF: 'f',
    TH: 'th',
    DD: 'd',
    kk: 'k g j',
    CH: 'ch',
    SS: 's x z',
    nn: 'n m',
    RR: 'r'
}

const mapKeyword = char => {
    return Object.keys(dictionary).find(key => {
        return dictionary[key].includes(char)
    })
}

const computeSoundWave = (audioRawData) => {
    const audio = document.createElement('audio')
    const audioCtx = new(window.AudioContext || window.webkitAudioContext)()
    audio.src = audioRawData
    audio.crossOrigin = 'anonymous'
    audio.load()
    const audioSource = audioCtx.createMediaElementSource(audio)
    const analyser = audioCtx.createAnalyser()
    const size = 512

    const play = (ratio = 1, onUpdate, onEnd) => {
        let ended = false
        audio.onended = () => {
            ended = true
            onEnd && onEnd()
        }
        audioCtx.resume()
        audioSource.connect(analyser)
        // audioSource.connect(audioCtx.destination)
        analyser.fftSize = size
        audio.playbackRate = ratio
        audio.play()
        const data = new Uint8Array(analyser.frequencyBinCount)
        const loop = () => {
            analyser.getByteFrequencyData(data)
            onUpdate && onUpdate(data, data.reduce((p, c) => p + c, 0), audio.currentTime)
            if (!ended) {
                requestAnimationFrame(() => {
                    loop()
                })
            }
        }
        loop()
    }

    return play
}

class Timeline {
    constructor(text, words, total) {
        this.totalChar = text.length
        this.duration = total
        this.pool = []
        let prevOffset = 0.1
        let charLength = 1 / this.totalChar * this.duration
        words.forEach(word => {
            this.addWord(word, prevOffset)
            console.log(word, prevOffset)
            prevOffset += charLength * word.length + charLength
        })
    }

    addWord(word, offset) {
        const wordLength = word.length
        const wordPct = wordLength / this.totalChar * this.duration
        let index = 0
        while (index < wordLength) {
            let charLength = 1
            let char = word[index]
            if ((char === 'c' || char === 't') && word[index + 1] === 'h') {
                charLength = 2
                index++
                char += word[index]
            }
            const charPct = charLength / wordLength
            const charOffset = offset + index * charPct * wordPct
            if (stringToNumber(char).length) {
                this.addWord(stringToNumber(char), charOffset)
            } else {
                this.addChar(char, charOffset, charPct * wordPct * 2.8)
            }
            index++
        }
    }

    addChar(char, offset, length) {
        this.pool.push({
            char,
            offset,
            length,
            start: offset,
            end: offset + length,
            isActive: false,
            alpha: 0,
            sinAlpha: 0,
        })
    }

    getNow(offset) {
        return this.pool.map(item => item)
            .filter(item => (item.start - item.length * 0.2) <= offset && ((item.end + item.length * 0.2) >= offset))
            .map(item => {
                item.isActive = true
                item.alpha = (offset - item.start) / item.length + 0.1
                item.sinAlpha = Math.sin(item.alpha * Math.PI)
                return item
            })
    }
}

const tracker = {
    current: 0,
    data: {}
}

export const talkWithLipSync = (text, speedRatio = 1, languageCode) => {
    // split text to to words
    const words = (text || '').split(' ').map(w => w.toLowerCase())
    if (words.length) {
        // get total timeline and adjust lip sync function
        const url = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyDdLLiYv-72_ZLHcp7Pk5xZGiGgJDrkhdU'
        const data = {
            'input': {
                'text': text
            },
            'voice': {
                'languageCode': languageCode || 'vi-VN',
                'name': 'en-US-Wavenet-B',
                'ssmlGender': 'MALE'
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
                let callbackID
                computeSoundWave(audio.src)(speedRatio, (data, total, time) => {
                    let current;
                    if (!tracker.data[tracker.current] && total > 0) {
                        tracker.data[tracker.current] = {
                            offset: time,
                            direction: 1,
                            values: []
                        }
                    }
                    current = tracker.data[tracker.current]
                    console.log(current)
                    if (current) {
                        if (current.values.length) {
                            const last = current.values[current.values.length - 1]
                            if (total > last * 1.02 && current.direction === -1) {
                                tracker.current++
                            } else {
                                current.values.push(total)
                                if (total < last) {
                                    current.direction = -1
                                }
                            }
                        } else {
                            current.values.push(total)
                        }
                    }
                    console.log(tracker, total)
                }, () => {
                    audio.playbackRate = speedRatio || 1
                    audio.onended = () => {
                        clearInterval(callbackID)
                        const aibot = document.getElementById('ai-bot');
                        Object.keys(dictionary).forEach(key => {
                            aibot.setAttribute(`gltf-morph__${key}`, `morphtarget:viseme_${key};value:0`)
                        })
                    }
                    audio.play();
                    // play and sync
                    const delayPlay = setInterval(() => {
                        if (isNaN(audio.duration)) return
                        clearInterval(delayPlay)
                        const timeline = new Timeline(text, words, audio.duration - 0.5)
                        const scale = 0.5
                        const aibot = document.getElementById('ai-bot');

                        console.log(timeline)
                        callbackID = setInterval(() => {
                            const lips = timeline.getNow(audio.currentTime)
                            lips.forEach(lipSync => {
                                const key = mapKeyword(lipSync.char)
                                if (key) {
                                    aibot.setAttribute(`gltf-morph__${key}`, `morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`)
                                    // console.log(`morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`, lipSync)
                                }
                            })
                            // console.log(timeline.getNow(audio.currentTime), audio.duration, audio.currentTime)
                            // console.log(timeline.getNow(audio.currentTime).map(i => ({ char: i.char, time: i.alpha })), audio.duration, audio.currentTime)
                        }, 1000 / 60)
                    }, 60)
                })
            })
    }
}

if (!window.AI) {
    window.AI = {};
}
window.AI = {
    ...window.AI,
    startAsk: start,
    stopAsk: stop,
    askBot: ask,
    textToSpeech: textToSpeech,
    talkWithLipSync: talkWithLipSync,
    pool: pool
}