import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./ToolbarButton.scss";

 

export const presets = [
  "basic",
  "transparent",
  "accept",
  "cancel",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5"
];

export const statusColors = ["recording", "unread", "enabled", "disabled"];

export const ToolbarButtonLanguage = forwardRef(
  (
    { preset, className, iconContainerClassName, children, icon, label, selected,columnMode, large, statusColor, ...rest },
    ref
  ) => { 
    return (
      <button
        ref={ref}
        className={classNames(
          columnMode? styles.toolbarButton:styles.toolbarButtonRow,
          styles[preset],
          { [styles.selected]: false, [styles.large]: large },
          className
        )}
        {...rest}
      >
        <div className={classNames(selected?styles.iconContainerSelected:styles.iconContainer, iconContainerClassName)} aria-hidden="true">
          {icon}
          {statusColor && <div className={classNames(styles.statusIndicator, styles["status-" + statusColor])} />}
          {children}
        </div>
        <label>{label}</label>
      </button>
    );
  }
);

ToolbarButtonLanguage.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.node,
  selected: PropTypes.bool,
  columnMode: PropTypes.bool,
  preset: PropTypes.oneOf(presets),
  statusColor: PropTypes.oneOf(statusColors),
  large: PropTypes.bool,
  className: PropTypes.string,
  iconContainerClassName: PropTypes.string,
  children: PropTypes.node
};

ToolbarButtonLanguage.defaultProps = {
  preset: "basic",
  columnMode:true,
};
