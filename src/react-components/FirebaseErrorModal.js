import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "./modal/Modal";
import { CloseButton } from "./input/CloseButton";
import { Button } from "./input/Button";
import { Column } from "./layout/Column";
import { Center } from "./layout/Center";
// dialog modal of full-room status
export function FirebaseErrorModal({ onClose, onAccept, isShowBackButton }) {
  
  return (
    <div style={{position:"absolute", zIndex:"100000", pointerEvents:"visible", width:"100%", height: "100%", top:"0px", backgroundColor:"rgb(170, 170, 170, 0.8)"}}>      
        <Center>
        <Modal
        title={<FormattedMessage id="metabar.connection-error-title" defaultMessage="Network connection error" />}
        beforeTitle={<CloseButton onClick={onClose}/>}
      >
        <Column padding center centerMd="both" grow>          
          <p>
            <FormattedMessage
              id="metabar.connection-error-message"
              defaultMessage="Network connection error! Please refresh the page.!"
              values={{ linebreak: <br /> }}
            />
          </p>
          { isShowBackButton && <Button preset="cancel" onClick={onClose}>
            <FormattedMessage id="metabar.back" defaultMessage="Back"/>
          </Button> }
          { !isShowBackButton && <Button preset="cancel" onClick={onClose}>
            <FormattedMessage id="metabar.cancel" defaultMessage="Cancel"/>
          </Button> }
          <Button preset="accept" onClick={onAccept}>
            <FormattedMessage id="metabar.refresh" defaultMessage="Refresh"/>
          </Button>           
          
        </Column>
      </Modal> 
      </Center>       
      </div>
  );    
}

FirebaseErrorModal.propTypes = {
  onAccept: PropTypes.func,
  onClose: PropTypes.func
};
