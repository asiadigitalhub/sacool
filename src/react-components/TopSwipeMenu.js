import React , { useEffect, useRef, useState ,useCallback}from "react";
import PropTypes from "prop-types";
import DoubleArrowUpIcon from "../assets/images/icon_double_arrow_up.png";
import SoundIcon from "../assets/images/icon_sound.png";
import MuteIcon from "../assets/images/icon_mute_sound.png";
import { FormattedMessage } from "react-intl";

import {
    GLOBAL_VOLUME_DEFAULT,
    GLOBAL_VOLUME_MAX
  } from "../react-components/preferences-screen";
  
function getPrefs() {
    const prefs = {
      globalVoiceVolume: APP.store.state.preferences.globalVoiceVolume,
      globalMediaVolume: APP.store.state.preferences.globalMediaVolume
    };
    if (prefs.globalVoiceVolume === undefined) prefs.globalVoiceVolume = GLOBAL_VOLUME_DEFAULT;
    if (prefs.globalMediaVolume === undefined) prefs.globalMediaVolume = GLOBAL_VOLUME_DEFAULT;
    return prefs;
  }
  
// ui of top swipe-down/up menu for mobile
export function TopSwipeMenu({ onLeftSoundChanged, onRightSoundChanged }) {

    // const [preferences, setPreferences] = useState(getPrefs());
    // const onPreferencesUpdated = useCallback(
    //     () => {
    //       setPreferences(getPrefs());
    //       APP.store.addEventListener("statechanged", onPreferencesUpdated);
    //       return () => {
    //         APP.store.removeEventListener("statechanged", onPreferencesUpdated);
    //       };
    //     },
    //     [setPreferences]
    //   );
    // useEffect(
    // () => {
    //     onPreferencesUpdated();
    // },
    // [onPreferencesUpdated]
    // );

    const TopDivId = "IdOfTopSwipeMenu";
    const DoubleArrowImageId = "DoubleArrowImageId";
    const imageSoundLeft ="imageSoundLeft";
    const imageSoundRight ="imageSoundRight";
    const LeftProgressBarId = "LeftProgressBarId";
    const RightProgressBarId = "RightProgressBarId";

    var topDivElement = null;
    var imgOfDoubleArrow = null;
    
    var isTouchMove = false;

    var yDown = null; // status when left mouse/touch is holding
    var yDownProgress = null; // status when left mouse/touch is holding in progress views
    //-------declare constant property of top menu---------
    var topDivWhenTouchDown = null; // top(y-coord) when mouse/touch start to move
    const startTopOfTopDiv = -177; // minus: hide the topDiv
    const endTopOfTopDiv = 0;
    const maxHeightOfTopDiv = 210;
    const heightBackgroundDiv = 190;
    const heightTextAreaDiv = 34;

    const heightSoundProgressDiv = 100;
    const widthSoundProgressDiv = 70;

    const heightArrowButtonDiv = 20;

    const heightExpandCollapseButtonDiv = 40;
    const widthExpandCollapseButtonDiv = 60;

    const gapHeight = 0;
    const limitHeightOfTopDivForShowOrHide = -85; // the position at that the auto scroll process happens   
    
    var getTopDivElement = () => {
        if (!topDivElement) {
            topDivElement = document.getElementById(TopDivId);
        }
        return topDivElement;
    }
    var getImgOfDoubleArrow = () => {
        if (!imgOfDoubleArrow) {
            imgOfDoubleArrow = document.getElementById(DoubleArrowImageId);
        }
        return imgOfDoubleArrow;
    }

    var removePxInString = (str) => {
        return Number(str.substring(0, str.length - 2));     
    }
    var getTopOfADiv = (div) => {        
        return removePxInString(div.style.top);
    }

    // get the top of topDivElement
    var getTopOfTopDiv = () => {          
        return getTopOfADiv(getTopDivElement());
    }

    // get (x,y)-coord of left touch or left mouse
    var getCoordinationOfTouchOrLeftMouse = (evt, isYCoord) => {  
        if (evt.touches || evt.originalEvent) { // left mouse touch
            var touches = evt.touches || evt.originalEvent.touches;
            if (isYCoord) {
                return touches[0].clientY;                    
            }                
            else {
                return touches[0].clientX; 
            }
        } else if (evt.button == 0) { // left mouse click
            if (isYCoord) {
                return evt.clientY;
            } else {
                return evt.clientX;
            }
        }
    }
    // get y-coord of left touch or left mouse
    var getYCoordinationOfTouchOrLeftMouse = (evt) => {
        return getCoordinationOfTouchOrLeftMouse(evt, true);
    }
    // get x-coord of left touch or left mouse
    var getXCoordinationOfTouchOrLeftMouse = (evt) => {
        return getCoordinationOfTouchOrLeftMouse(evt, false);
    }

    // when user start to touch                                                                         
    var handleTouchStart = (evt) => {        
        yDown = getYCoordinationOfTouchOrLeftMouse(evt);                                                              
        topDivWhenTouchDown = getTopOfTopDiv();   
        isTouchMove = false; 
    };       

    // when user stop to touch
    var handleTouchEnd = (evt) => {   
        if (yDown) { // if there is a dragging process
            const topValueInt = getTopOfTopDiv(); // get top of the topDivElement    
            if (topValueInt > limitHeightOfTopDivForShowOrHide) { // expand the top div
                getTopDivElement().style.top = endTopOfTopDiv.toString() + "px";
                getImgOfDoubleArrow().style.transform = "rotate(0deg)";
            } else { // collapse the top div
                getTopDivElement().style.top = startTopOfTopDiv.toString() + "px";
                getImgOfDoubleArrow().style.transform = "rotate(180deg)";
            }      
            isTouchMove = false;
            yDown = null;                                      
        }     
    };  

    // when user stop to touch on the expand-collapse button
    var handleTouchEndExpandCollapse = (evt) => {   
        if (yDown) { // if there is a dragging process               
            if (!isTouchMove) { // handle touch as a click                
                const topValueInt = getTopOfTopDiv(); // get top of the topDivElement 
                if (topValueInt > limitHeightOfTopDivForShowOrHide) {  // collapse the top div
                    getTopDivElement().style.top = startTopOfTopDiv.toString() + "px";
                    getImgOfDoubleArrow().style.transform = "rotate(180deg)";
                    
                } else { // expand the top div
                    getTopDivElement().style.top = endTopOfTopDiv.toString() + "px";
                    getImgOfDoubleArrow().style.transform = "rotate(0deg)";
                }  

                isTouchMove = false;
                yDown = null;                                      
                evt.stopPropagation();              
            }             
        }     
    };   
    
    // when user move his touch                                                                 
    var handleTouchMove = (evt) => {
        if (! yDown ) {
            return;
        }            
        
        isTouchMove = true;                 

        var yUp = getYCoordinationOfTouchOrLeftMouse(evt);

        var yDiff = yUp - yDown;
                                                                                
        if ( yDiff > 0 ) { // downward swipe
            var newDeltaY = (topDivWhenTouchDown + yDiff);
            if (newDeltaY < gapHeight) {
                getTopDivElement().style.top = newDeltaY.toString() + "px";
            }         
        } else { // upward swipe
            var newDeltaY = topDivWhenTouchDown + yDiff;
            if (newDeltaY >= startTopOfTopDiv) {
                getTopDivElement().style.top = newDeltaY.toString() + "px";
            }          
        }                                          
    };
    // update progress bar value by change div's top position
    var changeProgressBar = (evt, div) => {        
        if (evt && yDownProgress) {    // if there is an event & left mouse/touch is holding
            const gapX = 10;  
            const leftX = div.offsetParent.offsetLeft - gapX;
            const rightX = leftX + widthSoundProgressDiv + 2 * gapX;
            const touchX = getXCoordinationOfTouchOrLeftMouse(evt) ;
            
            if (touchX >= leftX && touchX <= rightX) { // if touching in a x-range
                const topY = div.offsetParent.offsetTop; // top y coordination of div
                var dy = getYCoordinationOfTouchOrLeftMouse(evt) - topY; // dy: relative y-coord of touch in div
                if (dy < 0) { // make sure dy >= 0
                    dy = 0
                }
                if (dy > heightSoundProgressDiv) { // make sure dy <= heightSoundProgressDiv
                    dy = heightSoundProgressDiv;
                }
                div.style.top = dy.toString() + "px"; // update top of div
            }                                                    
        }        
    }

    // when touch on progress bar starts
    var progressbarHandleTouchStart = (evt, div) => {
        yDownProgress = true;
        changeProgressBar(evt, div);            
    }
    // when touch on progress bar ends
    var progressbarHandleTouchEnd = (evt, div, callbackProgressSound) => {
        changeProgressBar(evt, div);
        yDownProgress = false;
        if (callbackProgressSound) {
            const top = getTopOfADiv(div);
            const percentage = ((heightSoundProgressDiv - top) / heightSoundProgressDiv) * 100;
            callbackProgressSound(percentage) ;
        }            
    }
    // when touch on progress bar moves
    var progressbarHandleTouchMove = (evt, div, callbackProgressSound) => {
        if(!yDownProgress){
            return;
        }
        changeProgressBar(evt, div);       
        if (callbackProgressSound) {
            const top = getTopOfADiv(div);
            const percentage = ((heightSoundProgressDiv - top) / heightSoundProgressDiv) * 100;
            callbackProgressSound(percentage) ;
        }           
    }
    // create sound div
    var createSoundDiv = (isLeft, callbackProgressSound) => {
        const ProgressDivId = isLeft ? LeftProgressBarId : RightProgressBarId;   
        const imageSoundId = isLeft ? imageSoundLeft : imageSoundRight;        
        const progressDiv = document.getElementById(ProgressDivId);
        const leftAlign = isLeft ? "calc(25% - " + (widthSoundProgressDiv / 2).toString() + 'px)' : 'unset';
        const rightAlign = isLeft ? 'unset' : "calc(25% - " + (widthSoundProgressDiv / 2).toString() + 'px)';        
        // when touch on progressDiv starts 
        const touchStartEvent = (evt) => {            
            progressbarHandleTouchStart(evt, progressDiv);
            evt.stopPropagation();
        };
        // when touch on progressDiv moves
        const touchMoveEvent = (evt) => {
            progressbarHandleTouchMove(evt, progressDiv,callbackProgressSound);
            evt.stopPropagation();
        };
        // when touch on progressDiv ends
        const touchEndEvent = (evt) => {            
            progressbarHandleTouchEnd(evt, progressDiv, callbackProgressSound);
            evt.stopPropagation();
        };
        const floating = isLeft ? "left" : "right";

        var initValue = (APP.store.state.preferences.globalMediaVolume)/GLOBAL_VOLUME_MAX;
        if(!isLeft){
            initValue = (APP.store.state.preferences.globalVoiceVolume)/GLOBAL_VOLUME_MAX;
        }

        initValue = 100 - initValue*100;
        console.log('initValue');
        console.log(initValue);

        var iconSoundDisplay =initValue>=100?MuteIcon: SoundIcon;
        return <div style={{position:"relative", pointerEvents:"visible", width: widthSoundProgressDiv.toString() + 'px', height: heightSoundProgressDiv.toString() + 'px', 
                top: ((heightBackgroundDiv - heightSoundProgressDiv - heightTextAreaDiv) / 2).toString() + 'px', left: leftAlign, right: rightAlign,
                float: floating, backgroundColor: "lightgrey", borderRadius: "15px", overflow: "hidden" }}
                onTouchStart={touchStartEvent} onTouchMove={touchMoveEvent} onTouchEnd={touchEndEvent} onTouchCancel={touchEndEvent} 
                onMouseDown={touchStartEvent} onMouseMove={touchMoveEvent} onMouseUp={touchEndEvent} onMouseLeave={touchEndEvent}>                         

                <div id={ProgressDivId} style={{position:"absolute", pointerEvents:"visible", width: '100%', height: '100%', top:(initValue) +'px', left: "0px",
                    justifyContent:"center", alignItems: "end", backgroundColor: "grey" }} >                        
                </div>
                <img id={imageSoundId} style={{position:"absolute", width:"30px", height: "22px", bottom:"18px", left: 'calc(50% - 15px)' }} src={iconSoundDisplay} />        
            </div>;
    }

    const tagImageLeft = document.getElementById(imageSoundLeft);
    const tagImageRight = document.getElementById(imageSoundRight);

    const leftProgressBarDiv = createSoundDiv(true, (value)=>{
        console.log('createSoundDiv');
        console.log(value);
        APP.store.update({
            preferences: {
              globalMediaVolume: value/100*GLOBAL_VOLUME_MAX
            }
          });

        var iconSoundDisplay =value<=0?MuteIcon: SoundIcon;
        tagImageLeft.src = iconSoundDisplay;
    });
    const rightProgressBarDiv = createSoundDiv(false, (value)=>{
        APP.store.update({
            preferences: {
              globalVoiceVolume:  value/100*GLOBAL_VOLUME_MAX
            }
          }); 
          var iconSoundDisplay =value<=0?MuteIcon: SoundIcon;
          tagImageRight.src = iconSoundDisplay;
    });

    return (        
        <div id={TopDivId} style={{position:"absolute", zIndex:"10000", pointerEvents:"visible", width:"100%", height: maxHeightOfTopDiv.toString() + 'px', 
            top: startTopOfTopDiv.toString() + 'px', backgroundColor:"transparent", userSelect:"none", outline:"none", webkitUserSelect: "none"}}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}                        
            onMouseDown={handleTouchStart} onMouseMove={handleTouchMove} onMouseUp={handleTouchEnd}  onMouseLeave={handleTouchEnd}>                         
            <div style={{position:"relative", pointerEvents:"visible", width:"100%", height: heightBackgroundDiv.toString() + 'px', 
                    top: '0px', backgroundColor:"white", borderBottomRightRadius: "8px", borderBottomLeftRadius: "8px",
                    boxShadow: "0 3px 3px 3px #0005"}} >
                {/* top labels */}
                <div style={{position:"relative", display: "flex", alignItems:"end", pointerEvents:"visible", width:"100%", height: heightTextAreaDiv.toString() + 'px', 
                       color:"black", top: '0px'}} >                           
                    <div style={{position:"relative", display: "flex", justifyContent: "center", alignItems:"end", pointerEvents:"visible", width:"50%", height: "100%"}} >
                        <b><FormattedMessage id="swipe-menu.background-music" defaultMessage="Background Music" /></b>
                    </div>
                    <div style={{position:"relative", display: "flex", justifyContent: "center", alignItems:"end", pointerEvents:"visible", width:"50%", height: "100%"}} >
                        <b><FormattedMessage id="swipe-menu.people-talking" defaultMessage="People Talking" /></b>
                    </div>                    
                </div>
                {/* left sound progress bar */}
                {leftProgressBarDiv}
                {rightProgressBarDiv}
                {/* center vertical divided bar */}
                <div opacity = "0.5" style={{position:"relative", pointerEvents:"visible", width: '1px', height: (heightSoundProgressDiv + 30).toString() + 'px', 
                    top: ((heightBackgroundDiv - heightSoundProgressDiv - heightTextAreaDiv) / 2 - 15).toString() + 'px', left: "calc(50%)", backgroundColor:"grey", borderRadius: "0.5px" }} >
                </div>
            </div>
            
            {/* bottom expand-collapse button */}
            <div style={{position:"relative", display:"flex", pointerEvents:"visible", width: widthExpandCollapseButtonDiv.toString() + 'px', height: heightExpandCollapseButtonDiv.toString() + 'px', 
                bottom: ((heightExpandCollapseButtonDiv - heightArrowButtonDiv) / 2).toString() + 'px', left: "calc(50% - " + (widthExpandCollapseButtonDiv / 2).toString() + "px)",
                backgroundColor:"transparent", flexDirection: "column", justifyContent: "center", alignItems:"center" }} 
                onTouchEnd={handleTouchEndExpandCollapse} onTouchCancel={handleTouchEndExpandCollapse}
                onMouseUp={handleTouchEndExpandCollapse}>
                {/* bottom arrow icon */}
                <div style={{position:"relative", display:"flex", pointerEvents:"visible", width: widthExpandCollapseButtonDiv.toString() + 'px', height: heightArrowButtonDiv.toString() + 'px', 
                    bottom: '1px', backgroundColor:"white", flexDirection: "column", justifyContent: "center", alignItems:"center", borderBottomRightRadius: "5px", borderBottomLeftRadius: "5px",
                    boxShadow: "0 4px 2px 2px #0005" }} >
                    <img id={DoubleArrowImageId} style={{width:"15px", height: "10px", transform: "rotate(180deg)" }} src={DoubleArrowUpIcon} />
            </div>
            </div>
            
        </div>
    );    
}

TopSwipeMenu.propTypes = {
  onLeftSoundChanged: PropTypes.func,
  onRightSoundChanged: PropTypes.func
};
