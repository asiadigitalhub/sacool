import React, { Component } from "react";
import registerTelemetry from "./telemetry";
import Store from "./storage/store";
import "./utils/theme";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/globals.scss";
import { Center } from "./react-components/layout/Center";
import { Modal } from "./react-components/modal/Modal";
import { Column } from "./react-components/layout/Column";

import { FormattedMessage } from "react-intl";
import {getRoomsInFirebase, openMetabarWithRoomId, firebaseDatabase, LimitUserNumberInRoom, FirebaseDatabaseKeys} from "./utils/firebase-util";
import { ref, onValue } from "firebase/database";

registerTelemetry("/rooms", "Rooms Page");

const store = new Store();
window.APP = { store };
// display vertical list of rooms in firebase realtime db
export class Rooms extends Component {
  state = {
    roomMap: null,
    showNoRoomModal: false
  };

  componentDidMount() {    
    this.loadRoomsFromFirebase();
    this.listenFirebaseUpdateUserNumberEvent();
  }
  
  // generate ui for no-room status
  noRoomModal() {
    return (
      <Modal title={<FormattedMessage id="rooms.no-room" defaultMessage="There is not any room" />}>
        <Column padding center>
          <b>
            <FormattedMessage
              id="rooms.cannot-find-rooms"
              defaultMessage="There is no room in database"            
            />
          </b>
        </Column>
      </Modal>
    );
  }
  // when number of user changes in firebase, we refresh the ui
  listenFirebaseUpdateUserNumberEvent() {
    const roomsUserListRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser);   
    // this method is fired if the number of user changes
    onValue(roomsUserListRef, (snapshot) => {
      const roomMap = snapshot.toJSON();
      // call this to update the ui
      this.setState({roomMap: roomMap});      
    });
  }
  // load available room in firebase db
  loadRoomsFromFirebase() {        
    // get rooms from firebase
    getRoomsInFirebase((roomMap) => {      
      if (roomMap) { // if we have rooms map        
        this.setState({roomMap: roomMap}); // show rooms list
      } else { // if there is no rooms
        // show NoRoomModal
        this.setState({showNoRoomModal: true});
      }
    });
  }
  // if user select a room, then open this room
  selectARoom(roomId, userNumber) {
    if (userNumber < LimitUserNumberInRoom) {
      openMetabarWithRoomId(roomId); // open the room
    } else {
      if (this.props.onSelectAFullRoomCallBack) { // call props function        
        this.props.onSelectAFullRoomCallBack(roomId);
      }
    }    
  }
  // create a 'a' html tag that has room name
  createATag(roomId, roomName, userNumber) {    
    return (
      <a style={{cursor:"pointer"}} onClick={() => this.selectARoom(roomId, userNumber)}>
        {roomName}
      </a>
    );
  }
  
  // create list of li tag that has room name & number of user in room
  createRoomList() {
    if (this.state.roomMap == null) {
      return <div></div>;
    }
    var liList = [];
    for (var roomId in this.state.roomMap) { 
      var roomInfoMap = this.state.roomMap[roomId];      
      liList.push(
        <li key={roomId}>
          <div style={{display:"flex", flexDirection: "row", marginBottom: "10px"}}> 
            <div style={{left:"20px", width: "calc(100% - 80px"}}>
            {this.createATag(roomId, roomInfoMap[FirebaseDatabaseKeys.RoomName], roomInfoMap[FirebaseDatabaseKeys.UserNumber])}
            </div> 
            <div style={{width: "100px", right:"20px", justifyContent:"right", alignItems: "right", textAlign: "right"}}>
              {roomInfoMap[FirebaseDatabaseKeys.UserNumber]}
            </div> 
          </div> 
        </li>
      );
    }    
    
    return (
    <div style={{width: "80%", height: '80%', margin:"20px", padding: "20px", borderRadius: "15px", border:"solid 0.5px #666"}} >
      <ul>
        {liList}        
      </ul>
    </div>);
  }

  render() {
    return (  
      <Center>        
        {this.createRoomList() }
        {this.state.showNoRoomModal && this.noRoomModal() }
      </Center>      
    );
  }
}
