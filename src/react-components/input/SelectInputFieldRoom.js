import React from "react";
import PropTypes from "prop-types";
import { InputField } from "./InputField";
import classNames from "classnames";
import styles from "./SelectInputFieldRoom.scss";
import { ReactComponent as PeopleRoomIcon } from "../icons/people_room.svg";
import checkIcon from "../../assets/images/check.png";
import { useSelect } from "downshift";
import { FormattedMessage } from "react-intl";
import { LimitUserNumberInRoom } from "../../utils/firebase-util";

export function SelectInputFieldRoom({
  className,
  error,
  description,
  inputClassName,
  label,
  onChange,
  value,
  options,
  fullWidth,
  ...rest
}) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    getLabelProps,
    highlightedIndex,
    getItemProps
  } = useSelect({
    items: options,
    selectedItem: value,
    ...rest,
    onSelectedItemChange: ({ selectedItem }) => {        
      if (onChange) {
        onChange(selectedItem);
      }
    }
  });

    var roomInfoComponent = (roomInfo, noShowCheck) => {        
        var fullRoomStatus;
        // calculate the color of the circle before room info div   
        var circleColor = (roomInfo.userNumber <= LimitUserNumberInRoom * 3 / 4) ? "rgb(93, 184, 95)" : (roomInfo.userNumber < LimitUserNumberInRoom ? "rgb(236, 132, 84)" : "rgb(232, 54, 41)");
        var circleDiv = <div style={{width: "16px", height: "16px", backgroundColor: circleColor, borderRadius: "8px"}}></div>;
        
        var isShowCheckIcon = (noShowCheck != true && selectedItem == roomInfo);
        
        var checkIconDiv = isShowCheckIcon ? <img style={{ width:"18px", height:"18px"}} src={checkIcon}></img> : 
                <img style={{ width:"18px", height:"18px", visibility: "hidden"} } ></img>;

        var roomNameDiv = <div>{roomInfo.roomName}</div>;
        var paddingRight = "14px";

        if (roomInfo.userNumber < LimitUserNumberInRoom) {
            fullRoomStatus = " (" + roomInfo.userNumber.toString() + "/" + LimitUserNumberInRoom.toString();
            var roomInfoDiv = <div className={styles.roomInfo} >
                {roomNameDiv}
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div className={styles.fullRoomStatus} >
                            {fullRoomStatus}                                         
                            &nbsp;
                        </div>
                        <div className={styles.fullRoomStatus} >                    
                            <PeopleRoomIcon />
                        </div>
                        <div className={styles.fullRoomStatus} >
                            &nbsp;)&nbsp;
                        </div>
                    </div>
                </div>
            return <div className={styles.itemRow} style={{paddingRight: paddingRight}}>{circleDiv}
            <div className={styles.roomTitleStatus} >                
                { roomInfoDiv }
                { checkIconDiv }
            </div>
            </div>
        } else {            
            var roomInfoDiv = <div className={styles.roomInfo}>
                {roomNameDiv} 
                <div className={styles.fullRoomStatus} >
                    &nbsp;(<FormattedMessage id="select-room.full" defaultMessage="full" />)
                </div>
            </div>;            
            return <div className={styles.itemRow} style={{ paddingRight: paddingRight}}>{circleDiv}
                    <div className={styles.roomTitleStatus} >                
                        { roomInfoDiv }
                        { checkIconDiv }
                    </div>
            </div>
        }        
    };
  return (
    <InputField
      {...getLabelProps()}
      className={className}
      label={label}
      error={error}
      description={description}
      fullWidth={fullWidth}
    >
        <div className={classNames(styles.selectInput, { [styles.open]: isOpen }, inputClassName)}>
            <button className={styles.dropdownButton} type="button" {...getToggleButtonProps()}>
                <span style={{width: "100%"}}>
                    {selectedItem !== null && selectedItem !== undefined ? (
                    roomInfoComponent(selectedItem, true)
                    ) : (
                      <div style={{display:"flex", flexDirection:"row", paddingLeft: "14px", textAlign: "left", height:"30px", alignItems: "center", justifyContent: "left"}}>
                        <FormattedMessage id="select-room.loading" defaultMessage="Loading..." />
                      </div>
                    )}
                </span>          
            </button>
            {options.length > 0 && (
            <ul {...getMenuProps()} className={styles.dropdown} >
                {isOpen &&
                options.map((item, index) => (
                    <li
                    className={classNames(styles.dropdownItem, { [styles.highlightedItem]: highlightedIndex === index })}
                    key={item.roomId}
                    {...getItemProps({ item, index })}
                    >
                    {roomInfoComponent(item)}
                    </li>
                ))}
            </ul>
            )}
        </div>      
    </InputField>
  );
}

SelectInputFieldRoom.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  error: PropTypes.node,
  description: PropTypes.node,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.RoomInfo,
      PropTypes.shape({
        // id: PropTypes.string.isRequired,
        label: PropTypes.string,
        value: PropTypes.any.isRequired
      })
    ])
  ).isRequired,
  onChange: PropTypes.func,
  fullWidth: PropTypes.bool
};

SelectInputFieldRoom.defaultProps = {
  options: []
};
