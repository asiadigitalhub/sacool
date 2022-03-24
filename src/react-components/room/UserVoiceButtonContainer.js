
import React, { useEffect, useRef, useState ,useCallback} from "react";
import PropTypes from "prop-types";
import { ReactComponent as VolumeHigh } from "../icons/VolumeHigh.svg";
import { ReactComponent as VolumeMuted } from "../icons/VolumeMuted.svg";
import { ToolbarButton } from "../input/ToolbarButton";
import { useMicrophone } from "./useMicrophone";
import { FormattedMessage } from "react-intl";
import {
  GLOBAL_VOLUME_DEFAULT
} from "../../react-components/preferences-screen";


function getPrefs() {
  const prefs = {
    globalVoiceVolume: APP.store.state.preferences.globalVoiceVolume,
    globalMediaVolume: APP.store.state.preferences.globalMediaVolume
  };
  if (prefs.globalVoiceVolume === undefined) prefs.globalVoiceVolume = GLOBAL_VOLUME_DEFAULT;
  if (prefs.globalMediaVolume === undefined) prefs.globalMediaVolume = GLOBAL_VOLUME_DEFAULT;
  return prefs;
}


export function UserVoiceButtonContainer({ scene }) {
  const buttonRef = useRef();
  const [preferences, setPreferences] = useState(getPrefs());
  
  const onPreferencesUpdated = useCallback(
    () => {
      setPreferences(getPrefs());
      APP.store.addEventListener("statechanged", onPreferencesUpdated);
      return () => {
        APP.store.removeEventListener("statechanged", onPreferencesUpdated);
      };
    },
    [setPreferences]
  );
  useEffect(
    () => {
      onPreferencesUpdated();
    },
    [onPreferencesUpdated]
  );
  return (
    <ToolbarButton
      ref={buttonRef}
      icon={preferences.globalMediaVolume>0 ? <VolumeHigh /> : <VolumeMuted />}
      label={<FormattedMessage id="user-volume-voice-button-container.label" defaultMessage="Volume Voice" />}
      preset="basic"
      onClick={()=>{
        APP.store.update({
          preferences: {
            globalVoiceVolume: preferences.globalVoiceVolume==0?GLOBAL_VOLUME_DEFAULT:0
          }
        });
        
      }}
    />
  );
}

UserVoiceButtonContainer.propTypes = {
  scene: PropTypes.object.isRequired,
};
