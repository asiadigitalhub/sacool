import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "./modal/Modal";
import { CloseButton } from "./input/CloseButton";
import { Button } from "./input/Button";
import { Column } from "./layout/Column";
import { Center } from "./layout/Center";
// dialog modal of no-room status
export function NoRoomModal({ onClose, onAccept }) {
  
  return (
    <div style={{position:"absolute", zIndex:"100000", pointerEvents:"visible", width:"100%", height: "100%", top:"0px", backgroundColor:"rgb(170, 170, 170, 0.8)"}}>      
        <Center>
      
            <Modal beforeTitle={<CloseButton onClick={onClose}/>}>
                <Column padding center>
                    <b>
                        <FormattedMessage
                        id="rooms.cannot-find-rooms"
                        defaultMessage="There is no room in database"            
                        />
                    </b>
                    <Button preset="accept" onClick={onAccept}>
                        <FormattedMessage id="metabar.refresh" defaultMessage="Refresh"/>
                    </Button>                
                </Column>
            </Modal>                              
      </Center>       
      </div>
  );    
}

NoRoomModal.propTypes = {
  roomName: PropTypes.string,
  onAccept: PropTypes.func,
  onClose: PropTypes.func
};
