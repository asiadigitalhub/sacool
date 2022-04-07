
import React, { useEffect, useRef, useState ,useCallback} from "react";
import PropTypes from "prop-types";
import { ReactComponent as VolumeHigh } from "../icons/VolumeHigh.svg";
import { ReactComponent as VolumeMuted } from "../icons/VolumeMuted.svg";
import { ReactComponent as DisableMedia } from "../icons/DisableMedia.svg";
import { ReactComponent as VisibleMedia } from "../icons/VisibleMedia.svg";
import { ToolbarButton } from "../input/ToolbarButton";
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


export function UserVoiceButtonContainer({isMedia}) {
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

  const disableIcon = isMedia? <DisableMedia/>:<VolumeMuted />;
  const visibleIcon = isMedia? <VisibleMedia/>:<VolumeHigh />;

  return (
    <ToolbarButton
      ref={buttonRef}
      icon={(isMedia?(preferences.globalMediaVolume>0):(preferences.globalVoiceVolume>0)) 
        ? visibleIcon: disableIcon}
      columnMode={false}
      preset="basic"
      onClick={()=>{
        if(isMedia){
          APP.store.update({
            preferences: {
              globalMediaVolume: preferences.globalMediaVolume==0 ? GLOBAL_VOLUME_DEFAULT:0
            }
          });
        }else{
          APP.store.update({
            preferences: {
              globalVoiceVolume: preferences.globalVoiceVolume==0 ? GLOBAL_VOLUME_DEFAULT:0
            }
          });
        }
        
      }}
    />
  );
}

UserVoiceButtonContainer.propTypes = {
  isMedia: PropTypes.bool,
};
