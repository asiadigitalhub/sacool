import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "./modal/Modal";
import { CloseButton } from "./input/CloseButton";
import { Button } from "./input/Button";
import { Column } from "./layout/Column";
import { Center } from "./layout/Center";
// dialog modal of full-all-room status
export function FullAllRoomModal({ onClose, onAccept }) {
    return (
        <div style={{position:"absolute", zIndex:"100000", pointerEvents:"visible", width:"100%", height: "100%", top:"0px", backgroundColor:"rgb(200, 200, 200, 0.6)"}}>      
            <Center>
            <Modal
            title={<FormattedMessage id="metabar.all-room-are-full" defaultMessage="All rooms are full" />}
            beforeTitle={<CloseButton onClick={onClose}/>}
        >
            <Column padding center centerMd="both" grow>
            <p>
                <FormattedMessage
                id="metabar.all-room-are-full-message"
                defaultMessage="All rooms are full. Please wait."
                values={{ linebreak: <br /> }}
                />
            </p>
            
            <Button preset="accept" onClick={onAccept}>
                <FormattedMessage id="metabar.ok" defaultMessage="OK"/>
            </Button>          
            </Column>
        </Modal> 
        </Center>       
        </div>
    );    
}

FullAllRoomModal.propTypes = {
  roomName: PropTypes.string,
  onAccept: PropTypes.func,
  onClose: PropTypes.func
};
