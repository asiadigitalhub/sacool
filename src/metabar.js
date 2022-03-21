import React, { Component } from "react";
import ReactDOM from "react-dom";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import registerTelemetry from "./telemetry";
import Store from "./storage/store";
import "./utils/theme";
import { AuthContextProvider } from "./react-components/auth/AuthContext";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/globals.scss";
import { ThemeProvider } from "./react-components/styles/theme";
import { PageContainer } from "./react-components/layout/PageContainer";
import { Center } from "./react-components/layout/Center";
import { FullRoomModal } from "./react-components/FullRoomModal";
import { FullAllRoomModal } from "./react-components/FullAllRoomModal";

import {openMetabarWithRoomId, getAvailableRoomForJoining, RoomUserStatus} from "./utils/firebase-util";

registerTelemetry("/metabar", "Metabar Page");

const store = new Store();
window.APP = { store };

class Metabar extends Component {
  state = {    
    showFullRoomModel: false,
    showFullAllRoomModel: false
  };

  componentDidMount() {
    this.loadRoomFromFirebaseThenOpen();
  }
  
  // when the full-room modal close
  onCloseFullRoomModal() {
    // open home page    
    window.location = window.location.origin;
  };

  // load available room in firebase db
  loadRoomFromFirebaseThenOpen() {    
    var roomIdNeedCheck = null;
    // get room id from url's path
    var pathArray = window.location.pathname.split('/');
    pathArray = pathArray.filter(function(item) {
      return (item !== "metabar" && item !== "")
    })    
    if (pathArray.length > 0) {
      roomIdNeedCheck = pathArray[0];
    }
    // get or check the room id(roomIdNeedCheck), then open the room
    // getAvailableRoomForJoining((roomId, status) => {      
    //   if (roomIdNeedCheck != null && roomIdNeedCheck != roomId && status != RoomUserStatus.CheckingRoomIdNotInFirebase) { // roomIdNeedCheck is full
    //     // show FullRoomModal
    //     this.setState({showFullRoomModel: true});
    //     return;
    //   }
    //   if (roomId) { // if we have an available room where the nunber of user < limitation        
    //     openMetabarWithRoomId(roomId, roomIdNeedCheck != null);
    //   } else { // if all rooms are full or roomIdNeedCheck is not in firebase db
    //     // show FullRoomModal
    //     this.setState({showFullAllRoomModel: true});
    //   }
    // }, roomIdNeedCheck);
  }

  render() {
    return (      
      <PageContainer>        
        <Center>
          {this.state.showFullRoomModel && <FullRoomModal onClose={this.onCloseFullRoomModal} onAccept={this.onCloseFullRoomModal} ></FullRoomModal> }
          {this.state.showFullAllRoomModel && <FullAllRoomModal onClose={this.onCloseFullRoomModal} onAccept={this.onCloseFullRoomModal} ></FullAllRoomModal> }
        </Center>
      </PageContainer>
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  ReactDOM.render(
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <AuthContextProvider store={store}>
          <Metabar />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>,
    document.getElementById("ui-root")
  );
});
