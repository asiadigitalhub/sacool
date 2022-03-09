
///Firebase import
import { initializeApp } from "firebase/app";
import { getAnalytics,logEvent } from "firebase/analytics";
import { getDatabase, ref, get, child, update, increment} from "firebase/database";

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
const LimitUserNumberInRoom = 25; // the maximum number of user in a room

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
    static UserNumber = "user_number"
}

export class RoomUserStatus {
  static FoundANewRoomId = 0;
  static AllRoomsAreFull = 1;
  static CheckingRoomIdAvailable = 2;
  static CheckingRoomIdNotInFirebase = 3;
}

function updateNumberOfUserInRoom(roomId, isIncrease) {
    const incrementFieldValue = increment(1);
    const decrementFieldValue = increment(-1);
    
    const updates = {};
    var path = FirebaseDatabaseKeys.RoomsUser + "/" + roomId + "/" + FirebaseDatabaseKeys.UserNumber;
    updates[path] = isIncrease ? incrementFieldValue : decrementFieldValue;
    
    return update(ref(firebaseDatabase), updates); // call firebase's update function
}
// decrease the number of user in room if the window unloads
export function decreaseUserNumberIfWindowUnload (roomId) {    
    //When Brower close, decrease the number of user in a room
    window.addEventListener("beforeunload", function (e) {            
        descreaseUserNumberInRoom(roomId, false)
    });      
}

// increase the number of user in a room by 1
export function increaseUserNumberInRoom(roomId) {       
    return updateNumberOfUserInRoom(roomId, true);
}
// decrease the number of user in a room by 1
export function descreaseUserNumberInRoom(roomId) {
    updateNumberOfUserInRoom(roomId, false);    
}

// get list of rooms in firebase db
function getRooms(callBack) {
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
  getRooms((roomMap) => {
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

export function openSabecoWithRoomId(roomId) {
  var domain = window.location;
  var urlComponents = "/hub.html";
  const redirectUrl = new URL(urlComponents, domain);
  if (redirectUrl.search.length > 0) {
    redirectUrl.search += "&";
  }        
  redirectUrl.search += "hub_id=" + roomId;
  redirectUrl.search += "&is_sabeco=true";                
  document.location = redirectUrl;        
}
