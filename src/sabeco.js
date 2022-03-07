import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
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
import { Modal } from "./react-components/modal/Modal";
import { Column } from "./react-components/layout/Column";

// import { increment } from "firebase/database";
import { FormattedMessage } from "react-intl";
import {openSabecoWithRoomId, getAvailableRoomForJoining} from "./utils/firebase-util";

registerTelemetry("/sabeco", "Sabeco Page");

const store = new Store();
window.APP = { store };

// generate ui for full-room status
function FullRoomModal() {
  // const intl = useIntl();
  return (
    <Modal title={<FormattedMessage id="sabeco.cant-join-room" defaultMessage="Can not join any room" />}>
      <Column padding center>
        <b>
          <FormattedMessage
            id="sabeco.all-room-are-full"
            defaultMessage="All rooms are full"            
          />
        </b>
      </Column>
    </Modal>
  );
}


class Sabeco extends Component {
  state = {
    showFullRoomModel: false
  };

  componentDidMount() {
    this.loadRoomFromFirebaseThenOpen();
  }
  
  // load available room in firebase db
  loadRoomFromFirebaseThenOpen() {    
    var roomIdNeedCheck = null;
    // get room id from url's path
    var pathArray = window.location.pathname.split('/');
    pathArray = pathArray.filter(function(item) {
      return (item !== "sabeco" && item !== "")
    })    
    if (pathArray.length > 0) {
      roomIdNeedCheck = pathArray[0];
    }
    // get or check the room id(roomIdNeedCheck), then open the room
    getAvailableRoomForJoining((roomId, status) => {      
      if (roomId) { // if we have an available room where the nunber of user < 25        
        openSabecoWithRoomId(roomId);
      } else { // if all rooms are full or roomIdNeedCheck is not in firebase db
        // show FullRoomModal
        this.setState({showFullRoomModel: true});
      }
    }, roomIdNeedCheck);
  }

  render() {
    return (
      <PageContainer>
        <Center>
          {this.state.showFullRoomModel && <FullRoomModal /> }
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
          <Sabeco />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>,
    document.getElementById("ui-root")
  );
});
