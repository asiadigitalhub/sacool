import React, { Component } from "react";
import registerTelemetry from "./telemetry";
import Store from "./storage/store";
import "./utils/theme";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/globals.scss";
import { Center } from "./react-components/layout/Center";
import { Column } from "./react-components/layout/Column";
import { Row } from "./react-components/layout/Row";

import { FormattedMessage } from "react-intl";
import {getRoomsInFirebase, openMetabarWithRoomId, firebaseDatabase, LimitUserNumberInRoom, FirebaseDatabaseKeys,
  convertRoomMapToRoomInfoAndSort, isSignedInFirebase, FirebaseError} from "./utils/firebase-util";
import { ref, onValue } from "firebase/database";
import { FullRoomModal } from "./react-components/FullRoomModal";
import { NoRoomModal } from "./react-components/NoRoomModal";
import { FirebaseErrorModal } from "./react-components/FirebaseErrorModal";
import backgroundImageUrl from "./assets/images/homepage_background.jpg";
import joinRoomImageUrl from "./assets/images/join_room_button_bg.png";
import { SelectInputFieldRoom } from "./react-components/input/SelectInputFieldRoom";
import usFlag from "./assets/images/flags/icon_flag_us.png";
import vnFlag from "./assets/images/flags/icon_flag_vietnam.png";
import { setLocale } from "./utils/i18n";

registerTelemetry("/rooms", "Rooms Page");

const store = new Store();
window.APP = { store };

// display vertical list of rooms in firebase realtime db
export class SelectRoom extends Component {
    isMobile = false;  
  state = {    
    selectedRoomInfo: null,
    roomInfos: [],
    showFullRoomModal: false,
    showNoRoomModal: false,
    showRefreshModal: false
  };

  constructor(props) {
    super(props);
    
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        this.isMobile = true;
    } else {
        this.isMobile = false;
    }
  }
  
  componentDidMount() {    
    this.loadRoomsFromFirebase();
    this.listenFirebaseUpdateUserNumberEvent();
  }
  
  // when the reload button in Firebase Error modal clicked
  onContinueFirebaseErrorModal() {
    location.reload(); // refresh the current page
  }

  // when number of user changes in firebase, we refresh the ui
  listenFirebaseUpdateUserNumberEvent() {
    const roomsUserListRef = ref(firebaseDatabase, FirebaseDatabaseKeys.RoomsUser);   
    // this method is fired if the number of user changes
    onValue(roomsUserListRef, (snapshot) => {
      const roomInfos = convertRoomMapToRoomInfoAndSort(snapshot.toJSON());      
      if (roomInfos) {
          if (roomInfos.length > 0) {
            // call this to update the ui      
            this.setState({selectedRoomInfo: roomInfos.length > 0 ? roomInfos[0] : null,
                roomInfos: roomInfos}); 
            // hide Refresh Modal
            this.setState({showRefreshModal: false});
            // hide No Room Modal
            this.setState({showNoRoomModal: false});     
          }         
      }      
    });
  }
  // load available room in firebase db
  loadRoomsFromFirebase() {       
    // wait until sign in completes
    isSignedInFirebase(async (signInStatus) => { // when user signed in as anonymous     
      if (signInStatus instanceof FirebaseError) { // if user can not sign in, show Refresh alert
        // show Refresh Modal
        this.setState({showRefreshModal: true});
        return;
      }
      // get rooms from firebase
      getRoomsInFirebase((roomInfos) => {      
        if (roomInfos instanceof FirebaseError) { // if error
          this.setState({showRefreshModal: true});
        } else if (roomInfos) { // if we have rooms map                    
          this.setState({ selectedRoomInfo: roomInfos.length > 0 ? roomInfos[0] : null,
              roomInfos: roomInfos}); // update rooms list in dropdown box
        } else { // if there is no rooms
          // show NoRoomModal
          this.setState({showNoRoomModal: true});
        }
      });
    });      
  }
  // if user select a room, then open this room
  selectARoom(roomId, userNumber) {
    if (userNumber < LimitUserNumberInRoom) {
      openMetabarWithRoomId(roomId); // open the room
    } else {
      // show full room alert
      this.setState({showFullRoomModal: true});
    }    
  }
  // if Join The Party button clicked
  onJoinPartyButtonClick() {      
      if (this.state.selectedRoomInfo) {
        this.selectARoom(this.state.selectedRoomInfo.roomId, this.state.selectedRoomInfo.userNumber);
      }      
  }
  onCloseFullRoomModal() {
    this.setState({showFullRoomModal: false});
  };
  onCloseNoRoomModal() {
      this.setState({showNoRoomModal: false});
  }
  onCloseFirebaseErrorModal() {
    this.setState({showRefreshModal: false});
  }
  onContinueFullRoomModal() {
    if (this.state.selectedRoomInfo) {
      openMetabarWithRoomId(this.state.selectedRoomInfo.roomId, 3); // open the room without showing full-room alert
    }
  }

  // when dropdown box change its value
  onChangeSelectedRoom(selectedRoom) {          
    this.setState({selectedRoomInfo: selectedRoom});     // update selectedRoomInfo
  }
  
  // generate ui
  render() {            
    var marginTop = "24%";
    var marginTopOfButton = "5vh";
    var flagStyle = {position:"absolute", top:"25px", right:"25px", alignItems:"right", justifyContent:"right"};
    if (this.isMobile) {
        marginTop = "10px";
        marginTopOfButton = "10px";        
    }    
    
    return (  
      <div style={{width: "100%", height: "100%"}}>
        <div style={{width: "100%", height: "100vh", backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "auto 100%",
        backgroundPosition: "center center", display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", 
        justifyContent: "center", verticalAlign: "center" }}>
          <div style={{marginTop: marginTop}} >
            <Center>
                <Column style={{alignItems:"center"}}>
                    <p style={{marginBottom: "20px", textAlign: "center", fontSize: "14px", color: "white"}}>
                    <FormattedMessage id="select-room.choose-party" defaultMessage="Please choose your party room" /> </p>
                    
                    <SelectInputFieldRoom value={this.state.selectedRoomInfo} options={this.state.roomInfos} onChange={(newRoomInfo)=>this.onChangeSelectedRoom(newRoomInfo)} />

                    <button style = {{width:"345px", height: "138px", marginTop: marginTopOfButton, marginBottom: "20px", paddingBottom: "10px", border: "none", backgroundColor: "transparent",  backgroundImage: `url(${joinRoomImageUrl})`, 
                        backgroundSize: "100% 100%", fontSize: "23px", textAlign: "center", color: "rgb(95, 165, 90)"}} onClick={() => this.onJoinPartyButtonClick()}>            
                        <b> <FormattedMessage id="select-room.join-party" defaultMessage="JOIN THE PARTY" /> </b>
                    </button> 
                    <div style={flagStyle}>
                        <Row >
                            <button style={{backgroundColor:"transparent", marginRight: "10px"}} onClick = {()=> setLocale('vi')} >                
                                <img src={vnFlag} style={{height: '20px', width : '30px'}} />                                                                    
                            </button>

                            <button style={{backgroundColor:"transparent"}} onClick = {()=> setLocale('en')}>                
                                <img src={usFlag} style={{height: '20px', width : '30px'}} />                                                  
                            </button>
                        </Row>                 
                    </div>                                    
                </Column>              
                
            </Center>                                  
          </div>
          {this.state.showFullRoomModal && <FullRoomModal onClose={() => this.onCloseFullRoomModal()} onAccept={() => this.onContinueFullRoomModal()} ></FullRoomModal> }
          {this.state.showNoRoomModal && <NoRoomModal onClose={() => this.onCloseNoRoomModal()} onAccept={() => this.onContinueFirebaseErrorModal()} ></NoRoomModal> }
          {this.state.showRefreshModal && <FirebaseErrorModal onClose={() => this.onCloseFirebaseErrorModal()} onAccept={() => this.onContinueFirebaseErrorModal()} ></FirebaseErrorModal> }
        </div>        
      </div>      
    );
  }
}
