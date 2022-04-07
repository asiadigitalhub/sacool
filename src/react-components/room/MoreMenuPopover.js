import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./MoreMenuPopover.scss";
import { Popover } from "../popover/Popover";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as MoreIcon } from "../icons/More.svg";
import { useIntl, defineMessage } from "react-intl";
import { ToolbarButtonLanguage } from "../input/ToolbarButtonLanguage";
import { pushDataLayer } from "../../utils/gtm";
import { logAction } from "../../utils/firebase-util";

import { setLocale ,getLocale} from "../../utils/i18n";

const isMobile = AFRAME.utils.device.isMobile();

function MoreMenuItem({ item, closePopover }) {
  const Icon = item.icon;

  return (
    <li onClick={closePopover}>
      {item.href ? (
        <a
          className={styles.moreMenuItemTarget}
          href={item.href}
          target={item.target || "_blank"}
          rel="noopener noreferrer"
        >
          <Icon />
          <span>{item.label}</span>
        </a>
      ) : (
        <button className={styles.moreMenuItemTarget} onClick={event => {
          item.onClick(item, event)
          logAction({
            event: "react-open-menu"
          })
          pushDataLayer({
            event: "react-open-menu"
          })
        }}>
          <Icon />
          <span>{item.label}</span>
        </button>
      )}
    </li>
  );
}

MoreMenuItem.propTypes = {
  item: PropTypes.shape({
    href: PropTypes.string,
    target: PropTypes.string,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.node.isRequired,
    onClick: PropTypes.func
  }).isRequired,
  closePopover: PropTypes.func.isRequired
};

function MoreMenuGroup({ group, closePopover }) {
  return (
    <li>
      <h1 className={styles.moreMenuGroupLabel}>{group.label}</h1>
      <ul className={styles.moreMenuItemList}>
        {group.items.map(item => <MoreMenuItem key={item.id} item={item} closePopover={closePopover} />)}
      </ul>
    </li>
  );
}

MoreMenuGroup.propTypes = {
  group: PropTypes.object.isRequired,
  closePopover: PropTypes.func.isRequired
};

function MoreMenuPopoverContent({ menu, closePopover }) {

  return (
    <div className={styles.moreMenuPopover}>
      <ul>{menu.map(group => <MoreMenuGroup key={group.id} group={group} closePopover={closePopover} />)}</ul>
   
      {isMobile && <div className={styles.groupFlag} >
        <ToolbarButtonLanguage
          selected={getLocale()==='vi'}
          icon={<img src="../../assets/images/flags/icon_flag_vietnam.png" style={{height: '15px', width : '22px'}} /> }                      
          onClick={() => {
            setLocale('vi');
          }}
            />
                  
          <div className={styles.paddingDiv}/>
          {/* add USA flag */}
          <ToolbarButtonLanguage
          selected={getLocale()==='en'}
            icon={<img src="../../assets/images/flags/icon_flag_us.png" style={{height: '15px', width : '22px'}} /> }                      
            onClick={() => {
              setLocale('en');
            }}
          />     
      </div>}
             
    </div>
  );
}

MoreMenuPopoverContent.propTypes = {
  menu: PropTypes.array.isRequired,
  closePopover: PropTypes.func.isRequired
};

// The MoreMenuContext allows us to control the more menu popover visibility from the MoreMenuPopoverButton
// and CompactMoreMenuButton.
const MoreMenuContext = createContext([false, () => {}]);

export function MoreMenuContextProvider({ initiallyVisible, children }) {
  const context = useState(initiallyVisible || false);
  return <MoreMenuContext.Provider value={context}>{children}</MoreMenuContext.Provider>;
}

MoreMenuContextProvider.propTypes = {
  initiallyVisible: PropTypes.bool,
  children: PropTypes.node
};

const moreMenuTitle = defineMessage({
  id: "more-menu-popover.title",
  defaultMessage: "More"
});

export function MoreMenuPopoverButton({ menu }) {
  const intl = useIntl();
  const [visible, setVisible] = useContext(MoreMenuContext);
  const title = intl.formatMessage(moreMenuTitle);

  return (
    <Popover
      title={title}
      content={props => <MoreMenuPopoverContent menu={menu} {...props} />}
      placement="top-end"
      offsetDistance={28}
      isVisible={visible}
      onChangeVisible={setVisible}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolbarButton
          ref={triggerRef}
          icon={<MoreIcon />}
          selected={popoverVisible}
          onClick={togglePopover}
          label={title}
        />
      )}
    </Popover>
  );
}

MoreMenuPopoverButton.propTypes = {
  menu: PropTypes.array.isRequired
};

// The CompactMoreMenuButton is only shown in the small breakpoint.
// We actually render the popover in the MoreMenuPopoverButton so that when resizing the window,
// the popover positions itself relative to the correct element.
export function CompactMoreMenuButton({ className, ...rest }) {
  const intl = useIntl();
  const [, setVisible] = useContext(MoreMenuContext);

  return (
    <button
      className={classNames(styles.compactButton, className)}
      aria-label={intl.formatMessage(moreMenuTitle)}
      onClick={e => {
        // Stop event bubbling so we don't immediately close the popover by clicking outside it.
        e.stopPropagation();
        setVisible(true);
      }}
      {...rest}
    >
      <MoreIcon />
    </button>
  );
}

CompactMoreMenuButton.propTypes = {
  className: PropTypes.string
};
