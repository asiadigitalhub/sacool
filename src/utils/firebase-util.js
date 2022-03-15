
///Firebase import
import { initializeApp } from "firebase/app";
import { getAnalytics,logEvent } from "firebase/analytics";
import { getDatabase, ref, get, child, update, increment, runTransaction} from "firebase/database";

const isDeploy = true;

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
export const LimitUserNumberInRoom = 25; // the maximum number of user in a room

/**
 * 
 * window.APP.hubChannel.hubId: it is RoomId
 * @param {*} videoName : which videoId that we want to interact
 * @returns 
 */
export function getVideoRef(videoName) {
  return ref(firebaseDatabase,"/rooms/"+window.APP.hubChannel.hubId+ '/videos/'+videoName);
}

export function getVideoControlRef() {
  return ref(firebaseDatabase,"/videos_control");
}


export function logActionClick(actionName) {
  logEvent(analytics, "action", {
    action_type: 'click',
    action_name: actionName
  });
}

export function logFPS(fps) {
  logEvent(analytics, "frame_rate", {value:fps});
}

export function logTelemetry(trackedPage, trackedTitle) {

    if (trackedPage) {
      logEvent(analytics, "page", trackedPage);
    }

    if (trackedTitle) {
      logEvent(analytics, "title", trackedTitle);
    }
}

export class FirebaseDatabaseKeys {
    static RoomsUser = "rooms_user"
    static RoomName = "room_name"
    static UserNumber = "user_number"
}

export class RoomUserStatus {
  static FoundANewRoomId = 0;
  static AllRoomsAreFull = 1;
  static CheckingRoomIdAvailable = 2;  
  static CheckingRoomIdNotInFirebase = 3;
}

function updateNumberOfUserInRoom(roomId, isIncrease, callBack) {
    const postRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser + "/" + roomId);
    runTransaction(postRef, (post) => {
      if (post) {
        if (isIncrease) {
          post.user_number++;              
        } else {
          post.user_number--; 
        }
      }
      return post;
    }).then(function (updatedValue) {      
      if (callBack) {
        callBack(updatedValue.snapshot.val());
      }      
    });    
}

// decrease the number of user in room if the window unloads
export function decreaseUserNumberIfWindowUnload (roomId) {   
  var isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
  var eventName = isOnIOS ? "pagehide" : "beforeunload"; 
  //When Brower close, decrease the number of user in a room
  window.addEventListener(eventName, function (e) {              
    descreaseUserNumberInRoom(roomId);
  });      
}

// increase the number of user in a room by 1
export function increaseUserNumberInRoom(roomId, callBack) {       
    updateNumberOfUserInRoom(roomId, true, callBack);
}
// decrease the number of user in a room by 1
export function descreaseUserNumberInRoom(roomId) {
  const decrementFieldValue = increment(-1);
  
  const updates = {};
  var path = FirebaseDatabaseKeys.RoomsUser + "/" + roomId + "/" + FirebaseDatabaseKeys.UserNumber;
  updates[path] = decrementFieldValue;

  update(ref(firebaseDatabase), updates); // call firebase's update function
}

// get list of rooms in firebase db
export function getRoomsInFirebase(callBack) {
    const dbRef = ref(firebaseDatabase);
    
    get(child(dbRef, FirebaseDatabaseKeys.RoomsUser)).then((snapshot) => {
        if (snapshot.exists()) { // if rooms existed
            var roomMap = snapshot.val();            
            callBack(roomMap); 
        } else { // if rooms did not existed
            callBack(null);            
        }
    }).catch((error) => {
        console.error(error);
    });
}

// get a room id & number of user in room that is available(the current number of user in room is not limitted)
export function getAvailableRoomForJoining(callBack, roomIdNeedCheck) {
  getRoomsInFirebase((roomMap) => {
      var maximumNumber = -1;
      var maximumNumberRoomId = null;         
      if (roomMap) {
        if (roomIdNeedCheck) {
          if (roomMap[roomIdNeedCheck]) {
            var userNumber = roomMap[roomIdNeedCheck][FirebaseDatabaseKeys.UserNumber];
            if (userNumber < LimitUserNumberInRoom) { // if roomIdNeedCheck can add a new user
              callBack(roomIdNeedCheck, RoomUserStatus.CheckingRoomIdAvailable);
              return;
            }
          } else { // if the roomIdNeedCheck is not in firebase
            callBack(null, RoomUserStatus.CheckingRoomIdNotInFirebase);
            return;
          }
        }   
        
        // If roomIdNeedCheck == null then find another room            
        for (var roomId in roomMap) {            
          var userNumber = roomMap[roomId][FirebaseDatabaseKeys.UserNumber];
          if (userNumber < LimitUserNumberInRoom && userNumber > maximumNumber) {
              maximumNumberRoomId = roomId;
              maximumNumber = userNumber;                
          }
        }         
      }        
      // call callBack
      callBack(maximumNumberRoomId, maximumNumberRoomId != null ? RoomUserStatus.FoundANewRoomId : RoomUserStatus.AllRoomsAreFull);
    }
  )
}

export function openMetabarWithRoomId(roomId, isCheckRoom) {
  if (isDeploy) { // if deploy mode
    var domain = window.location;
    var urlComponents = "/" + roomId + "?";
    const redirectUrl = new URL(urlComponents, domain);
    if (redirectUrl.search.length > 0) {
      redirectUrl.search += "&";
    }            
    redirectUrl.search += "ismetabar=" + (isCheckRoom ? 2 : 1);    
    
    document.location = redirectUrl;          
  } else {
    var domain = window.location;
    var urlComponents = "/hub.html";
    const redirectUrl = new URL(urlComponents, domain);
    if (redirectUrl.search.length > 0) {
      redirectUrl.search += "&";
    }        
    redirectUrl.search += "hub_id=" + roomId;
    redirectUrl.search += "&ismetabar=" + (isCheckRoom ? 2 : 1);    
    
    document.location = redirectUrl;        
  }  
}
