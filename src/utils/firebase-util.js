
///Firebase import
import { initializeApp } from "firebase/app";
import { getAnalytics,logEvent } from "firebase/analytics";
import { getDatabase, ref, get, child, update, increment, runTransaction} from "firebase/database";

const isDeploy = false;

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
    static RoomsUser = isDeploy ? "rooms_user" : "rooms_user_test"
    static RoomName = "room_name"
    static UserNumber = "user_number"
}

export class RoomUserStatus {
  static FoundANewRoomId = 0;
  static AllRoomsAreFull = 1;
  static CheckingRoomIdAvailable = 2;  
  static CheckingRoomIdNotInFirebase = 3;
}
// assign/set the number of user in room with id(roomid) by number
export async function setNumberOfUserInRoom(roomId, number) {
  const postRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser + "/" + roomId);
  var transaction = await runTransaction(postRef, (post) => {
    if (post) {
      post.user_number = number;      
    }
    return post;
  }).then(function (updatedValue) {      
    return updatedValue;      
  });   
  return transaction.snapshot.val(); 
}
// increase or decrease the number of user in room
async function updateNumberOfUserInRoom(roomId, isIncrease) {
    const postRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser + "/" + roomId);
    var transaction = await runTransaction(postRef, (post) => {
      if (post) {
        if (isIncrease) {
          post.user_number++;              
        } else {
          post.user_number--; 
        }
      }
      return post;
    }).then(function (updatedValue) {      
      return updatedValue;      
    });   
    return transaction.snapshot.val(); 
}

// decrease the number of user in room if the window unloads
export function decreaseUserNumberIfWindowUnload (roomId) {   
  // var isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);  
  // var eventName = isOnIOS ? "pagehide" : "beforeunload"; 
  // // When Brower close, decrease the number of user in a room
  // window.addEventListener(eventName, function (e) {              
  //   descreaseUserNumberInRoom(roomId);
  // });      
  
  // //When Brower close, decrease the number of user in a room
  // if (isOnIOS) { // for iphone/ipad
  //   window.addEventListener("visibilitychange", function(e)
  //   {
  //       if (document.visibilityState == 'hidden') // hidden
  //       {
  //         descreaseUserNumberInRoom(roomId); // decrease the number of user
  //       } else { // if window is visible, then we have to increase the user number, because we decrease it when window is hidden
  //         increaseUserNumberInRoom(roomId);
  //       }
  //   });
  // } else { // for desktop
  //   window.addEventListener("beforeunload", function (e) {              
  //     descreaseUserNumberInRoom(roomId);
  //   });      
  // }  
}

// increase the number of user in a room by 1
export async function increaseUserNumberInRoom(roomId) {       
    return await updateNumberOfUserInRoom(roomId, true);
}
// decrease the number of user in a room by 1
export function descreaseUserNumberInRoom(roomId) {
  // const decrementFieldValue = increment(-1);
  
  // const updates = {};
  // var path = FirebaseDatabaseKeys.RoomsUser + "/" + roomId + "/" + FirebaseDatabaseKeys.UserNumber;
  // updates[path] = decrementFieldValue;

  // update(ref(firebaseDatabase), updates); // call firebase's update function
}

export function getRoomsInFirebase(callBack) {
  const dbRef = ref(firebaseDatabase);
    
  get(child(dbRef, FirebaseDatabaseKeys.RoomsUser)).then((snapshot) => {
      if (snapshot.exists()) { // if rooms existed
          callBack(snapshot.val());
      } else { // if rooms did not existed
        callBack(null);
      }
  }).catch((error) => {
      console.error(error);
  });    
}
// get list of rooms in firebase db
export async function getRoomsInFirebaseSync() {
    const dbRef = ref(firebaseDatabase);
    
    var roomMap = await get(child(dbRef, FirebaseDatabaseKeys.RoomsUser)).then((snapshot) => {
        if (snapshot.exists()) { // if rooms existed
            return snapshot.val();                
        } else { // if rooms did not existed
          return null;            
        }
    }).catch((error) => {
        console.error(error);
    });        
    return roomMap;
}

// get a room id & number of user in room that is available(the current number of user in room is not limitted)
export async function getAvailableRoomForJoining(roomIdNeedCheck) {
  var roomMap = await getRoomsInFirebaseSync();  
  var maximumNumber = -1;
  var maximumNumberRoomId = null;         
  if (roomMap) {
    if (roomIdNeedCheck) {
      if (roomMap[roomIdNeedCheck]) {
        var userNumber = roomMap[roomIdNeedCheck][FirebaseDatabaseKeys.UserNumber];
        if (userNumber < LimitUserNumberInRoom) { // if roomIdNeedCheck can add a new user          
          return {room_id: roomIdNeedCheck, status: RoomUserStatus.CheckingRoomIdAvailable};
        }
      } else { // if the roomIdNeedCheck is not in firebase        
        return {room_id: null, status: RoomUserStatus.CheckingRoomIdNotInFirebase};        
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
  return {room_id: maximumNumberRoomId, status: maximumNumberRoomId != null ? RoomUserStatus.FoundANewRoomId : RoomUserStatus.AllRoomsAreFull};        
}

// openStatus = 1 => auto find other room if the current room is full
// openStatus = 2 => open a specific room, alert if this room is full
// openStatus = 3 => no show the full room alert any more
// openStatus = null => open a normal room, no need to check/update user number
export function openMetabarWithRoomId(roomId, openStatus) {
  if (isDeploy) { // if deploy mode
    var domain = window.location;
    var urlComponents = "/" + roomId;
    if (openStatus != null) {
      urlComponents += "?";
    }
    const redirectUrl = new URL(urlComponents, domain);
    if (redirectUrl.search.length > 0) {
      redirectUrl.search += "&";
    }            
    if (openStatus != null) {
      redirectUrl.search += "ismetabar=" + openStatus;    
    }
    
    
    document.location = redirectUrl;          
  } else {
    var domain = window.location;
    var urlComponents = "/hub.html";
    const redirectUrl = new URL(urlComponents, domain);
    if (redirectUrl.search.length > 0) {
      redirectUrl.search += "&";
    }        
    redirectUrl.search += "hub_id=" + roomId;
    if (openStatus != null) {
      redirectUrl.search += "&ismetabar=" + openStatus;    
    }
    document.location = redirectUrl;        
  }  
}
