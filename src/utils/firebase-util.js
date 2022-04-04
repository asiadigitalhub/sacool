
///Firebase import
import { initializeApp } from "firebase/app";
import { getAnalytics,logEvent } from "firebase/analytics";
import { getDatabase, ref, get, child, update, increment, runTransaction } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const isDeploy = (location.hostname !== "localhost");

export const LimitUserNumberInRoom = 18; // the maximum number of user in a room
export const LimitUserNumberInRoomForWeakDevice = 10; // the maximum number of user in a room for "weak" device

const MaxRetrySignInCount = 3;
var isSignedIn;
var retrySigninFirebaseCount = 0;

const MaxRetryCallFirebaseCount = 8;
var retryCallFirebaseCount = 0;

<<<<<<< Updated upstream
export const firebaseConfig = {
  apiKey: "AIzaSyBPsxeF7WaOJA60Q6rCL5YXvgKNLxzB25Q",
  authDomain: "fir-virtual-meeting.firebaseapp.com",
  databaseURL: "https://fir-virtual-meeting-default-rtdb.firebaseio.com",
  projectId: "fir-virtual-meeting",
  storageBucket: "fir-virtual-meeting.appspot.com",
  messagingSenderId: "737531674288",
  appId: "1:737531674288:web:92e0dea04a550f963ec575",
  measurementId: "G-VLET9B2MS9"
=======

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
export const firebaseConfig = {
  apiKey: firebase_apiKey,
  authDomain: firebase_authDomain,
  databaseURL: firebase_databaseURL,
  projectId:firebase_projectId,
  storageBucket: firebase_storageBucket,
  messagingSenderId:firebase_messagingSenderId,
  appId: firebase_appId,
  measurementId: firebase_measurementId
>>>>>>> Stashed changes
};

//Init Firebase config
const app = initializeApp(firebaseConfig);
// Get a reference to the database service
export const firebaseDatabase = getDatabase(app);

const auth = getAuth();

export class FirebaseError {

}

function signInFirebase() {
  // sign in firebase as anonymous
  signInAnonymously(auth)
    .then(() => {
      // Signed in    
      isSignedIn = true;
      retrySigninFirebaseCount = 0;
    })
    .catch((error) => {
      // Signed in error..
      console.error(error);  
      if (retrySigninFirebaseCount < MaxRetrySignInCount) {
        retrySigninFirebaseCount += 1;
        doSignInFirebase();
      }  
    });  
}

// sign in firebase
signInFirebase();

// if there is an authentication change
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in => update signed in status 
    isSignedIn = true;
    retrySigninFirebaseCount = 0;    
  } else {
    // User is signed out      
    isSignedIn = false;      
    retrySigninFirebaseCount = 0;
  }
});

const analytics = getAnalytics();

export function isSignedInFirebase(callBack) {
  if (isSignedIn != true) {
    if (retrySigninFirebaseCount >= MaxRetrySignInCount) { // the retry process is over
      callBack(new FirebaseError());
      return;
    }
    setTimeout(() => {
      isSignedInFirebase(callBack);
    }, 500);
    return;
  }
  // if signed in
  callBack();
}

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

export class RoomInfo {
  roomId;
  roomName;  
  userNumber;
  // initial method
  constructor(roomId, roomName, userNumber) {
    this.roomId = roomId; this.roomName = roomName; this.userNumber = userNumber;
  }
}

// assign/set the number of user in room with id(roomid) by number
export async function  setNumberOfUserInRoom(roomId, number) {
  const postRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser + "/" + roomId);
  var transaction = await runTransaction(postRef, (post) => {
    if (post) {
      post.user_number = number;      
    }
    return post;
  }).then(function (updatedValue) {      
    return updatedValue;      
  }).catch((error) => {
    console.error(error);    
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
  const decrementFieldValue = increment(-1);
  
  const updates = {};
  var path = FirebaseDatabaseKeys.RoomsUser + "/" + roomId + "/" + FirebaseDatabaseKeys.UserNumber;
  updates[path] = decrementFieldValue;

  update(ref(firebaseDatabase), updates); // call firebase's update function
}

// convert map of room to list of RoomInfo, and sort it by number of user descendently(and "">= 18" go to the end)
export function convertRoomMapToRoomInfoAndSort(roomMapObject) {   
  if (roomMapObject == null) {
    return null;
  }   
  // convert the map roomMapObject to list of RoomInfo roomInfos
  try {
    var roomInfos = [];
    for (var roomId in roomMapObject) {      
      var roomInfo = new RoomInfo(roomId, roomMapObject[roomId][FirebaseDatabaseKeys.RoomName], roomMapObject[roomId][FirebaseDatabaseKeys.UserNumber]);
      roomInfos.push(roomInfo);
    }
    // sort roomInfos
    roomInfos.sort((firstRoom, secondRoom) => {
      var numberOf1stRoom = firstRoom.userNumber;
      var numberOf2ndRoom = secondRoom.userNumber;
      if (numberOf1stRoom >= LimitUserNumberInRoom && numberOf2ndRoom >= LimitUserNumberInRoom) {
        return 0;
      }
  
      if (numberOf1stRoom >= LimitUserNumberInRoom) {
        return 1;
      }
      if (numberOf2ndRoom >= LimitUserNumberInRoom) {
        return -1;
      }
  
      if (numberOf1stRoom < numberOf2ndRoom) {
        return 1;
      } else if (numberOf1stRoom > numberOf2ndRoom) {
        return -1;
      } else {
        return 0;
      }
    });
    return roomInfos;
  } catch(error) {
    console.error(error);
    return null;
  }
  
}

// get a list of RoomInfo, then call the callBack method to send this list
export function getRoomsInFirebase(callBack) {
  const dbRef = ref(firebaseDatabase);
    
  get(child(dbRef, FirebaseDatabaseKeys.RoomsUser)).then((snapshot) => {
    retryCallFirebaseCount = 0;
    if (snapshot.exists()) { // if rooms existed        
      callBack(convertRoomMapToRoomInfoAndSort(snapshot.val()));        
    } else { // if rooms did not existed
      callBack(null);
    }
  }).catch((error) => {
    console.error(error);
    if (retryCallFirebaseCount < MaxRetryCallFirebaseCount) {
      ++retryCallFirebaseCount;
      getRoomsInFirebase(callBack);
    } else {
      callBack(new FirebaseError());
    }      
  });    
}
// async get list of rooms in firebase db
// return: a Map of rooms or FirebaseError
async function getRoomsInFirebaseSync() {
  const dbRef = ref(firebaseDatabase);
  
  var roomMap = await get(child(dbRef, FirebaseDatabaseKeys.RoomsUser)).then((snapshot) => {
    if (snapshot.exists()) { // if rooms existed      
      return snapshot.val();
    } else { // if rooms are not existed
      return null;            
    }
  }).catch((error) => { // if error
    console.error(error);    
    return new FirebaseError();
  });        
  return roomMap;
}

// get a room id & number of user in room that is available(the current number of user in room is not limitted)
export async function getAvailableRoomForJoining(roomIdNeedCheck, isForWeakDevice) {  
  var roomMap = await getRoomsInFirebaseSync();  // get map of rooms from firebase
  var maximumNumber = -1;
  var maximumNumberRoomId = null;         
  var maximumNumberForWeakDevice = -1;
  var maximumNumberRoomIdForWeakDevice = null;         
  if (roomMap) { // if we have rooms
    if (roomMap instanceof FirebaseError) { // if error    
      if (retryCallFirebaseCount < MaxRetryCallFirebaseCount) { // retry
        ++retryCallFirebaseCount; // increase retry time by 1;        
        return getAvailableRoomForJoining(roomIdNeedCheck, isForWeakDevice); // recursive
      }
      retryCallFirebaseCount = 0; // reset
      return {error: roomMap};
    }
    // continue without error
    if (roomIdNeedCheck) { // if we need to check roomIdNeedCheck
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
      if (isForWeakDevice) { // find room for "weak" devices, maximumNumberForWeakDevice < LimitUserNumberInRoomForWeakDevice or maximumNumberForWeakDevice is minimum if there is no room < 10
        if (userNumber < LimitUserNumberInRoomForWeakDevice) {
          if (userNumber > maximumNumberForWeakDevice || maximumNumberForWeakDevice > LimitUserNumberInRoomForWeakDevice) {
            maximumNumberRoomIdForWeakDevice = roomId;
            maximumNumberForWeakDevice = userNumber;                
          } 
        } else if (userNumber < LimitUserNumberInRoom) { // check room with LimitUserNumberInRoomForWeakDevice <= user-number < LimitUserNumberInRoom
           if (maximumNumberForWeakDevice == -1 || userNumber < maximumNumberForWeakDevice ) {
            
            maximumNumberForWeakDevice = userNumber;
            maximumNumberRoomIdForWeakDevice = roomId;
          } 
        }
      } else { // for strong devices
        if (userNumber < LimitUserNumberInRoom && userNumber > maximumNumber) {
          maximumNumberRoomId = roomId;
          maximumNumber = userNumber;                
      }
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
