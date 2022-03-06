
///Firebase import
import { initializeApp } from "firebase/app";
import { getAnalytics,logEvent } from "firebase/analytics";
import { getDatabase , ref, onValue} from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyBPsxeF7WaOJA60Q6rCL5YXvgKNLxzB25Q",
  authDomain: "fir-virtual-meeting.firebaseapp.com",
  databaseURL: "https://fir-virtual-meeting-default-rtdb.firebaseio.com",
  projectId: "fir-virtual-meeting",
  storageBucket: "fir-virtual-meeting.appspot.com",
  messagingSenderId: "737531674288",
  appId: "1:737531674288:web:92e0dea04a550f963ec575",
  measurementId: "G-VLET9B2MS9"
};


//Init Firebase config
const app = initializeApp(firebaseConfig);
// Get a reference to the database service
export const firebaseDatabase = getDatabase(app);

const analytics = getAnalytics();


/**
 * 
 * window.APP.hubChannel.hubId: it is RoomId
 * @param {*} videoName : which videoId that we want to interact
 * @returns 
 */
export function getVideoRef(videoName) {
  return ref(firebaseDatabase,"/rooms/"+window.APP.hubChannel.hubId+ '/videos/'+videoName);
}


export function logTelemetry(trackedPage, trackedTitle) {

    if (trackedPage) {
      logEvent(analytics, "page", trackedPage);
    }

    if (trackedTitle) {
      logEvent(analytics, "title", trackedTitle);
    }
}
