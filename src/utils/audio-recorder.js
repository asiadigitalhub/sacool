import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage, ref, uploadString } from "firebase/storage";
import Axios from "axios";
import configs from "./configs";

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

const pool = {
  audio: null,
  rec: null,
  blob: null
};

let firebase_apiKey = "";
let firebase_authDomain = "";
let firebase_databaseURL = "";
let firebase_projectId = "";
let firebase_storageBucket = "";
let firebase_messagingSenderId = "";
let firebase_appId = "";
let firebase_measurementId = "";
let instruction =
  "The following is a conversation with an AI assistant from Samsung. The assistant is helpful, creative, clever, and very friendly. Samsung is a global leader in technology, operating around the world in over 80 countries. We are also a market leader in consumer electronics, mobile communications, semiconductors, IT and home appliances. As a team of more than 257,000 global employees, we work passionately to be the best in the world at what we do. That means doing whatever it takes to delight our customers.\n\nHuman: Hello, how are you?\nAI: Very well thank you and how are you?\n";
let AzuAwsVismLookup = {};
let messageBoxes = new Map([
  [
    "sample",
    "The following is a conversation with an AI assistant from Samsung. The assistant is helpful, creative, clever, and very friendly. Samsung is a global leader in technology"
  ],
  ["how are you", "Hello Kali, I am doing very well, and you?"],
  [
    "galaxy",
    "Of course, we are going to show you our latest, best in class products for today. It is The Galaxy S23 Ultra, a flagship phone with all features to push Boundaries of a new generation. S23 Ultra is equipped with a variety of new Samsung technology, allowing users to enjoy an extraordinary and superior mobile experience.The Galaxy S23 Ultra combines the top elements of the previous Note series and the new S series, putting the fastest and most responsive built-in S Pen into the S series smartphones for the first time. In addition, it is equipped with the most advanced camera to create the most powerful device in the history of the Galaxy series.Powered by the first 4nm processor, the performance of the Galaxy S23 series have been further improved. Equipped with a 120Hz Dynamic AMOLED 2X display, Vision Booster and ultra-long-lasting power, users can always enjoy the one-of-a-kind mobile entertainment experience."
  ],
  [
    "introduction",
    "Sure, Samsung understands what operators and consumers are looking for in their products. And we are investing heavily in creating products that are high in performance but reduce power consumption. We begin from one of the smallest, but important components, Samsung Network Chipset. With years of experience, Samsung has been producing our own chipsets that range from modems to RFs to end user devices. This competitive adge is enabling our products to become more powerful and compact while lowering energy consumption."
  ],
  [
    "flagship",
    "Thank you for the very detailed introduction about Samsung's flagship product, this smart handset would bring great experience for customers. Can you tell us more about the philosophy behind Samsung's products?"
  ]
]);
let AIHost;
try {
  firebase_apiKey = configs.feature("default_firebase_apiKey");
  firebase_authDomain = configs.feature("default_firebase_authDomain");
  firebase_databaseURL = configs.feature("default_firebase_databaseURL");
  firebase_projectId = configs.feature("default_firebase_projectId");
  firebase_storageBucket = configs.feature("default_firebase_storageBucket");
  firebase_messagingSenderId = configs.feature("default_firebase_messagingSenderId");
  firebase_appId = configs.feature("default_firebase_appId");
  firebase_measurementId = configs.feature("default_firebase_measurementId");
  console.log("firebase_apiKey", firebase_apiKey);
  // eslint-disable-next-line no-empty
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

export const start = (aibot, talk, stopTalk) => {
  let audio = pool.audio;
  AIHost = aibot;
  if (!audio) {
    audio = document.createElement("audio");
    audio.style.display = "none";
    document.body.appendChild(audio);
    pool.audio = audio;
  }
  console.log("request mic permiss");
  // eslint-disable-next-line prefer-const
  let audioChunks = [];
  return new Promise(resolve => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true
      })
      .then(stream => {
        console.log("prepare recording");
        const rec = new MediaRecorder(stream);
        rec.addEventListener("dataavailable", e => {
          console.log("rec.ondataavailable");
          audioChunks.push(e.data);
          if (rec.state == "inactive") {
            const blob = new Blob(audioChunks, {
              type: "audio/mp3"
            });
            pool.blob = blob;
            audio.src = URL.createObjectURL(blob);
            audio.controls = true;
            audio.autoplay = true;
            audio.volume = 0;
          }
        });
        pool.rec = rec;
        rec.addEventListener("start", e => {
          console.log("rec.onstart");
          console.log(e);
        });
        console.log("start");
        rec.start();
        setTimeout(() => {
          // eslint-disable-next-line no-use-before-define
          stop();
          setTimeout(() => {
            // eslint-disable-next-line no-use-before-define
            ask(talk, stopTalk).then(res => resolve(res));
          }, 100);
        }, 4500);
      });
  });
};

export const stop = () => {
  console.log("stop recording");
  pool.rec.stop();
};

export const blobToBase64 = async blob => {
  console.log(blob);
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.addEventListener("loadend", () => {
      const result = reader.result;
      resolve(result);
    });
    reader.readAsDataURL(blob);
  });
};

export const ask = async (talk, stopTalk) => {
  // bot first response
  const languageCode = APP.store.state.preferences.locale || "en";
  // eslint-disable-next-line no-unused-vars
  const preText = {
    vi: "Để tôi suy nghĩ cái rồi tôi trả lời bạn nha.",
    en: "Let me think..."
  };
  // const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  // const recognition = new speechRecognition();
  // recognition.lang = "en-US";
  // recognition.continuous = true;
  // recognition.interimResults = true;
  // // eslint-disable-next-line no-unused-vars
  // let textToAsk = "";
  // recognition.onresult = event => {
  //   console.log("SpeechRecognition", event.results);
  //   textToAsk = "sample";
  // };
  // recognition.onspeechend = () => {
  //   console.log("Ending");
  //   recognition.stop();
  // };
  // recognition.addEventListener("soundend", event => {
  //   console.log("Sound has stopped being received", event);
  // });
  // eslint-disable-next-line no-undef
  // const timeoutID = setTimeout(() => {
  //   // textToSpeech(preText[languageCode], languageCode, talk, stopTalk);
  //   // talkWithLipSync(preText[languageCode], 1, languageCode, talk, stopTalk);

  //   //repeatAsk
  //   const qs = new URLSearchParams(location.search);
  //   const repeatAsk = parseInt(qs.get("repeatAsk"));
  //   if (!repeatAsk) {
  //     // eslint-disable-next-line no-use-before-define
  //     //talkWithViseme(preText[languageCode], talk, stopTalk);
  //   }
  // }, 1000);
  // upload mp3 file to server
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  // eslint-disable-next-line no-use-before-define
  const base64 = await blobToBase64(pool.blob);
  const path = `${auth.currentUser.uid}-${new Date() - 0}.mp3`;
  const storageRef = ref(storage, path);
  const result = await uploadString(storageRef, base64, "data_url");
  if (result && result.ref) {
    console.log(result);
    const url = `gs://${firebaseConfig.storageBucket}/${path}`;
    // call cloud func api to ask bot
    return new Promise(resolve => {
      Axios({
        url: `https://us-central1-forward-camera-345608.cloudfunctions.net/translateOnly?audio=${encodeURIComponent(
          url
        )}&languageCode=${languageCode}`,
        method: "GET"
      }).then(async res => {
        // clearTimeout(timeoutID);
        console.log(res.data);
        // const intent = res.data.raw[0].queryResult.intent.displayName;
        // if (intent === "education") {
        //   // walk to education
        //   console.log('prepare to move to "education"');
        //   await window.AI.botMove(intent);
        // }
        // if (intent === "sales") {
        //   // walk to sales
        //   console.log('prepare to move to "sales"');
        //   await window.AI.botMove(intent);
        // }
        resolve(res.data);
        // return bot response
        if (res.data.ask) {
          // textToSpeech(res.data.answer, languageCode, talk, stopTalk);
          //talkWithLipSync(res.data.answer, 1, languageCode, talk, stopTalk);
          // eslint-disable-next-line no-use-before-define
          talkWithChatGPT(res.data.ask, talk, stopTalk);
        }
      });
    });
  }
};

export const textToSpeech = (text, languageCode, talk, stopTalk) => {
  const url = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyDdLLiYv-72_ZLHcp7Pk5xZGiGgJDrkhdU";
  const data = {
    input: {
      text: text
    },
    voice: {
      languageCode: languageCode || "vi-VN",
      name: "en-US-Wavenet-B",
      ssmlGender: "MALE"
    },
    audioConfig: {
      audioEncoding: "MP3"
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
      const audio = document.createElement("audio");
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
    });
};

const stringToNumber = s => {
  const numMap = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  if (s == 0) return numMap[0];
  if (~~s > 0) return numMap[~~s];
  return "";
};

const dictionary = {
  aa: "a á à ả ã ạ ă ắ ằ ẳ ẵ ặ â ấ ầ ẩ ẫ ậ",
  E: "e é è ẻ ẽ ẹ ê ế ề ể ễ ệ",
  I: "i í ì ỉ ĩ ị l y",
  O: "o ó ò ỏ õ ọ ô ố ồ ổ ỗ ộ ơ ớ ờ ở ỡ ợ",
  U: "u ú ù ủ ũ ụ ư ứ ừ ử ữ ự v w q",
  PP: "p b",
  FF: "f",
  TH: "th",
  DD: "d",
  kk: "k g j",
  CH: "ch",
  SS: "s x z",
  nn: "n m",
  RR: "r"
};

const mapKeyword = char => {
  return Object.keys(dictionary).find(key => {
    return dictionary[key].includes(char);
  });
};

const findKey = char => {
  return [...messageBoxes].find(key => {
    return char.indexOf(key) !== -1;
  });
};

const detectAskWord = char => {
  return (char || "").split(" ").find(w => (w === "product" ? true : false));
};
class Timeline {
  constructor(text, words, total) {
    this.totalChar = text.length;
    this.duration = total;
    this.pool = [];
    let prevOffset = 0.1;
    const charLength = (1 / this.totalChar) * this.duration;
    words.forEach(word => {
      this.addWord(word, prevOffset);
      console.log(word, prevOffset);
      prevOffset += charLength * word.length + charLength;
    });
  }

  addWord(word, offset) {
    const wordLength = word.length;
    const wordPct = (wordLength / this.totalChar) * this.duration;
    let index = 0;
    while (index < wordLength) {
      let charLength = 1;
      let char = word[index];
      if ((char === "c" || char === "t") && word[index + 1] === "h") {
        charLength = 2;
        index++;
        char += word[index];
      }
      const charPct = charLength / wordLength;
      const charOffset = offset + index * charPct * wordPct;
      if (stringToNumber(char).length) {
        this.addWord(stringToNumber(char), charOffset);
      } else {
        this.addChar(char, charOffset, charPct * wordPct * 2.8);
      }
      index++;
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
      sinAlpha: 0
    });
  }

  getNow(offset) {
    return this.pool
      .map(item => item)
      .filter(item => item.start - item.length * 0.2 <= offset && item.end + item.length * 0.2 >= offset)
      .map(item => {
        item.isActive = true;
        item.alpha = (offset - item.start) / item.length + 0.1;
        item.sinAlpha = Math.sin(item.alpha * Math.PI);
        return item;
      });
  }
}

export const talkWithLipSync = (text, speedRatio = 1, languageCode) => {
  // split text to to words
  const words = (text || "").split(" ").map(w => w.toLowerCase());
  if (words.length) {
    // get total timeline and adjust lip sync function
    const url =
      "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyDdLLiYv-72_ZLHcp7Pk5xZGiGgJDrkhdU";
    const data = {
      input: {
        text: text
      },
      voice: {
        languageCode: languageCode || "vi-VN",
        name: "en-US-Wavenet-B",
        ssmlGender: "MALE"
      },
      audioConfig: {
        audioEncoding: "MP3"
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
        const audio = document.createElement("audio");
        audio.src = `data:audio/mpeg;base64,${res.audioContent}`;
        let callbackID;
        audio.playbackRate = speedRatio || 1;
        audio.onended = () => {
          clearInterval(callbackID);
          window.currentAnimation = "idle";
          const aibot = document.getElementById("ai-bot");
          Object.keys(dictionary).forEach(key => {
            aibot.setAttribute(`gltf-morph__${key}`, `morphtarget:viseme_${key};value:0`);
          });
        };
        audio.play();
        window.currentAnimation = "talk";
        // play and sync
        const delayPlay = setInterval(() => {
          if (isNaN(audio.duration)) return;
          clearInterval(delayPlay);
          const timeline = new Timeline(text, words, audio.duration - 0.5);
          const scale = 0.5;
          const aibot = document.getElementById("ai-bot");

          console.log(timeline);
          callbackID = setInterval(() => {
            const lips = timeline.getNow(audio.currentTime);
            lips.forEach(lipSync => {
              const key = mapKeyword(lipSync.char);
              if (key) {
                aibot.setAttribute(
                  `gltf-morph__${key}`,
                  `morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`
                );
                // console.log(`morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`, lipSync)
              }
            });
            // console.log(timeline.getNow(audio.currentTime), audio.duration, audio.currentTime)
            // console.log(timeline.getNow(audio.currentTime).map(i => ({ char: i.char, time: i.alpha })), audio.duration, audio.currentTime)
          }, 1000 / 60);
        }, 60);
        // computeSoundWave(audio.src)(speedRatio, (data, total, time) => {
        //     let current;
        //     if (!tracker.data[tracker.current] && total > 0) {
        //         tracker.data[tracker.current] = {
        //             offset: time,
        //             direction: 1,
        //             values: []
        //         }
        //     }
        //     current = tracker.data[tracker.current]
        //     console.log(current)
        //     if (current) {
        //         if (current.values.length) {
        //             const last = current.values[current.values.length - 1]
        //             if (total > last * 1.02 && current.direction === -1) {
        //                 tracker.current++
        //             } else {
        //                 current.values.push(total)
        //                 if (total < last) {
        //                     current.direction = -1
        //                 }
        //             }
        //         } else {
        //             current.values.push(total)
        //         }
        //     }
        //     console.log(tracker, total)
        // }, () => {
        //     audio.playbackRate = speedRatio || 1
        //     audio.onended = () => {
        //         clearInterval(callbackID)
        //         const aibot = document.getElementById('ai-bot');
        //         Object.keys(dictionary).forEach(key => {
        //             aibot.setAttribute(`gltf-morph__${key}`, `morphtarget:viseme_${key};value:0`)
        //         })
        //     }
        //     audio.play();
        //     // play and sync
        //     const delayPlay = setInterval(() => {
        //         if (isNaN(audio.duration)) return
        //         clearInterval(delayPlay)
        //         const timeline = new Timeline(text, words, audio.duration - 0.5)
        //         const scale = 0.5
        //         const aibot = document.getElementById('ai-bot');

        //         console.log(timeline)
        //         callbackID = setInterval(() => {
        //             const lips = timeline.getNow(audio.currentTime)
        //             lips.forEach(lipSync => {
        //                 const key = mapKeyword(lipSync.char)
        //                 if (key) {
        //                     aibot.setAttribute(`gltf-morph__${key}`, `morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`)
        //                     // console.log(`morphtarget:viseme_${key};value:${Math.max(lipSync.sinAlpha * scale, 0)}`, lipSync)
        //                 }
        //             })

        //             // console.log(timeline.getNow(audio.currentTime), audio.duration, audio.currentTime)
        //             // console.log(timeline.getNow(audio.currentTime).map(i => ({ char: i.char, time: i.alpha })), audio.duration, audio.currentTime)
        //         }, 1000 / 60)
        //     }, 60)
        // })
      });
  }
};

export const talkWithChatGPT = (text, BotTalking, BotStopTalking) => {
  console.log("Text to talk: ", text);
  //repeatAsk
  const qs = new URLSearchParams(location.search);
  const repeatAsk = parseInt(qs.get("repeatAsk"));
  if (repeatAsk) {
    // eslint-disable-next-line no-use-before-define
    repeatAskWithViseme(text);
  }
  if (text.length) {
    instruction = `${instruction}\nHuman: ${text}`;
    const url = "https://us-central1-forward-camera-345608.cloudfunctions.net/gentext";
    const data = {
      text: instruction
    };
    const params = {
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(data),
      method: "POST"
    };
    const msg = findKey(text);
    console.log("Text to ask", msg);
    const isPresent = detectAskWord(text);
    window.currentAnimation = isPresent !== undefined ? "present" : "talk";
    if (msg) {
      instruction = `${instruction}\nAI:${msg}`;
      // eslint-disable-next-line no-use-before-define
      talkWithViseme(msg[1], BotTalking, BotStopTalking);
      return;
    }
    fetch(url, params)
      .then(data => {
        return data.json();
      })
      .then(res => {
        console.log("Chat-GPT res", res);
        let messages = res.choices[0]?.text || "";

        //case: ", how are you?\nAI:Very well thank you and how are you?\n"
        const index = messages.indexOf("AI:");
        if (index > 0) {
          messages = messages.substring(index + 3, messages.length - 1);
        }

        if (messages) {
          instruction = `${instruction}\nAI:${messages}`;
          // Text to speech with viseme
          // eslint-disable-next-line no-use-before-define
          talkWithViseme(messages, BotTalking, BotStopTalking);
        }
      });
  }
};

const talkWithViseme = (text, talk, stopTalk) => {
  const message = (text || "").replace("AI: ", "");
  console.log("Talking content: ", message);
  // const synth = window.speechSynthesis;
  // if (synth.speaking) {
  //   console.error("speechSynthesis.speaking");
  //   return;
  // }
  // const utterThis = new SpeechSynthesisUtterance(message);
  // utterThis.onend = function(event) {
  //   console.log("SpeechSynthesisUtterance.onend");
  //   stopTalk();
  // };

  // utterThis.onerror = function(event) {
  //   console.error("SpeechSynthesisUtterance.onerror");
  // };
  // const voices = synth.getVoices().sort(function(a, b) {
  //   const aname = a.name.toUpperCase();
  //   const bname = b.name.toUpperCase();

  //   if (aname < bname) {
  //     return -1;
  //   } else if (aname == bname) {
  //     return 0;
  //   } else {
  //     return +1;
  //   }
  // });

  // utterThis.voice = voices[21];
  // utterThis.pitch = 1;
  // utterThis.rate = 1;
  // synth.speak(utterThis);
  // talk();
  // eslint-disable-next-line no-use-before-define
  getAzureTTS(message, "en-US", "en-US-ChristopherNeural", talk, stopTalk);
};

const repeatAskWithViseme = (text, talk, stopTalk) => {
  const message = (text || "").replace("AI: ", "");
  console.log("Talking content: ", message);
  // eslint-disable-next-line no-use-before-define
  getAzureTTS(message, "en-US", "en-US-ChristopherNeural", talk, stopTalk);
};

const AzuAwsVismXref = function(azVisemeId, ipaNameExamplePairsArray, awsVisemes) {
  this.azVisemeId = azVisemeId;
  this.ipaNameExamplePairsArray = ipaNameExamplePairsArray;
  this.awsVisemes = awsVisemes;
};

const AzuAwsVismXrefTable = [
  new AzuAwsVismXref(1, [["æ", "[a]ctive"], ["ʌ", "[u]ncle"], ["ə", "[a]go"], ["ɚ", "all[er]gy"]], ["a", "@", "E"]),
  new AzuAwsVismXref(2, [["ɑ", "[o]bstinate"], ["ɑɹ", "[ar]tist"]], ["a"]),
  new AzuAwsVismXref(3, [["ɔ", "c[au]se"], ["ɔɹ", "[or]ange"]], ["O"]),
  new AzuAwsVismXref(
    4,
    [["eɪ", "[a]te"], ["ɛ", "[e]very"], ["ʊ", "b[oo]k"], ["ɛɹ", "[air]plane"], ["ʊɹ", "c[ur]e"]],
    ["e", "E", "u"]
  ),
  new AzuAwsVismXref(5, [["ɝ", "[ear]th"]], ["E"]),
  new AzuAwsVismXref(
    6,
    [["i", "[ea]t"], ["ɪ", "[i]f"], ["ju", "[Yu]ma"], ["ɪɹ", "[ear]s"], ["j", "[y]ard, f[e]w"]],
    ["i"]
  ),
  new AzuAwsVismXref(7, [["u", "[U]ber"], ["ju", "[Yu]ma"], ["w", "[w]ith, s[ue]de"]], ["u"]),
  new AzuAwsVismXref(8, [["oʊ", "[o]ld"]], ["o"]),
  new AzuAwsVismXref(9, [["aʊ", "[ou]t"], ["aʊ(ə)ɹ", "[hour]s"]], ["a"]),
  new AzuAwsVismXref(10, [["ɔɪ", "[oi]l"]], ["O"]),
  new AzuAwsVismXref(11, [["aɪ", "[i]ce"], ["aɪ(ə)ɹ", "[Ire]land"]], ["a"]),
  new AzuAwsVismXref(12, [["h", "[h]elp"]], ["k"]),
  new AzuAwsVismXref(
    13,
    [
      ["ɪɹ", "[ear]s"],
      ["ɛɹ", "[air]plane"],
      ["ʊɹ", "c[ur]e"],
      ["aɪ(ə)ɹ", "[Ire]land"],
      ["aʊ(ə)ɹ", "[hour]s"],
      ["ɔɹ", "[or]ange"],
      ["ɑɹ", "[ar]tist"],
      ["ɝ", "[ear]th"],
      ["ɚ", "all[er]gy"],
      ["ɹ", "[r]ed, b[r]ing"]
    ],
    ["r"]
  ),
  new AzuAwsVismXref(14, [["l", "[l]id, g[l]ad"]], ["t"]),
  new AzuAwsVismXref(15, [["s", "[s]it"], ["z", "[z]ap"]], ["s"]),
  new AzuAwsVismXref(16, [["ʃ", "[sh]e"], ["ʒ", "[J]acques"], ["tʃ", "[ch]in"], ["dʒ", "[j]oy"]], ["S"]),
  new AzuAwsVismXref(17, [["θ", "[th]in"], ["ð", "[th]en"]], ["T"]),
  new AzuAwsVismXref(18, [["f", "[f]ork"], ["v", "[v]alue"]], ["f"]),
  new AzuAwsVismXref(19, [["t", "[t]alk"], ["d", "[d]ig"], ["n", "[n]o, s[n]ow"]], ["t"]),
  new AzuAwsVismXref(20, [["k", "[c]ut"], ["g", "[g]o"], ["ŋ", "li[n]k"]], ["k"]),
  new AzuAwsVismXref(21, [["p", "[p]ut"], ["b", "[b]ig"], ["m", "[m]at, s[m]ash"]], ["p"])
];

AzuAwsVismXrefTable.forEach(xref => {
  AzuAwsVismLookup[xref.azVisemeId] = xref.awsVisemes[0];
});

const VisemeHandler = function(host, visemes) {
  // eslint-disable-next-line prefer-const
  let awsVisemes = [];
  this.index = 0;
  this.startContextMs = -1;
  for (let a = 0; a < visemes.length; a++) {
    const azVis = visemes[a];
    if (azVis.visemeId === 0) {
      continue;
    }
    let visemeDuration = 200;
    if (a < visemes.length - 1) {
      visemeDuration = visemes[a + 1].audioOffset - azVis.audioOffset;
    }
    if (visemeDuration < 25) {
      visemeDuration = 25;
    }
    awsVisemes.push({ audioOffset: azVis.audioOffset, visemeId: AzuAwsVismLookup[azVis.visemeId], visemeDuration });
  }
  const visemesLength = awsVisemes.length;
  let nextViseme = awsVisemes[0];
  // console.log("awsVisemes", host, host?._features, host?._features?.LipsyncFeature);
  host._features.LipsyncFeature._onPlay();

  this.CheckForViseme = () => {
    if (!host.sound || !host.sound.context) {
      return;
    }
    const currentMs = host.sound.context.currentTime * 1000;
    if (this.startContextMs === -1) {
      this.startContextMs = currentMs;
    }
    // console.log("currentMs | audioOffset", currentMs, nextViseme.audioOffset + this.startContextMs);
    while (currentMs >= nextViseme.audioOffset + this.startContextMs) {
      // eslint-disable-next-line no-use-before-define
      raiseVisemeEvent(nextViseme.visemeId, nextViseme.visemeDuration - 5);
      this.index++;
      if (this.index >= visemesLength) {
        host.visemeHandler = undefined;
        host._features.LipsyncFeature._onStop();
        return;
      }
      nextViseme = awsVisemes[this.index];
    }
  };
};

// Azure bits below
const raiseVisemeEvent = (visemeValue, duration) => {
  const speechMark = { mark: { value: visemeValue, duration: duration } };
  AIHost._features.TextToSpeechFeature.emit("onVisemeEvent", speechMark);
  // AIHost._features.LipsyncFeature._onViseme({ mark: { value: visemeValue, duration } });
};

const getAzureTTS = (ssmlBody, langCode, voiceName, talk, stopTalk) => {
  langCode = langCode || "en-US";
  // Voice Famale: AriaNeural
  voiceName = voiceName || "en-US-ChristopherNeural";
  const speechConfig = speechsdk.SpeechConfig.fromSubscription("ef96b0589d34477cbcd5e461db9fe75f", "eastus");
  const audioStream = speechsdk.AudioOutputStream.createPullStream();
  const audioConfig = speechsdk.AudioConfig.fromStreamOutput(audioStream);
  const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
  const visemes = [];

  synthesizer.visemeReceived = function(s, e) {
    visemes.push({ audioOffset: e.audioOffset / 10000, visemeId: e.visemeId });
  };

  // eslint-disable-next-line no-use-before-define
  const ssmlPart = tidyTextMakeAzureSSML(ssmlBody);

  // eslint-disable-next-line no-use-before-define
  synthesizeSpeech(ssmlPart, handleSynthResult);

  function handleSynthResult(result) {
    if (!result.audioData || result.audioData.byteLength === 0) {
      console.log("No results returned from Azure for that input string");
      return;
    }

    // Make a Data URL from returned WAV file
    const blob = new Blob([result.audioData], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);

    // Queue up the visemes
    AIHost.visemeHandler = new VisemeHandler(AIHost, result.visemes);

    // Start playing the audio and watch progress in the animation loop
    AIHost.sound = new THREE.PositionalAudio(AIHost.audioListener);
    AIHost.sound.onEnded = () => {
      AIHost.sound.isPlaying = false;
      if (stopTalk) {
        stopTalk();
      }
      AIHost.sound.stop();
    };
    // Use the built-in audio loaded buffer reader - accepts both AWS mp3 and Azure Wav
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(url, buffer => {
      AIHost.sound.setBuffer(buffer);
      AIHost.sound.setVolume(8);
      AIHost.sound.play();
    });
  }

  function tidyTextMakeAzureSSML(ssmlBody) {
    ssmlBody = ssmlBody.replace("<speak>", "");
    ssmlBody = ssmlBody.replace("</speak>", "");
    let tidiedString = ssmlBody.replace(/\n/g, " ");
    tidiedString = tidiedString.replace(/\s+/g, " ").trim();
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${langCode}"><voice name="${voiceName}">${tidiedString}</voice></speak>`;
  }

  // The actual cloud call
  function synthesizeSpeech(ssmlIn, callback) {
    synthesizer.speakSsmlAsync(
      ssmlIn,
      result => {
        if (result) {
          synthesizer.close();
          result.visemes = visemes;
          if (talk) {
            talk();
          }
          callback(result);
        }
      },
      error => {
        console.log(error);
        synthesizer.close();
      }
    );
  }
};

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
  talkWithChatGPT: talkWithChatGPT,
  pool: pool
};
