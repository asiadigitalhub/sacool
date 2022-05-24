import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { ReactComponent as WandIcon } from "../icons/Wand.svg";
import { ReactComponent as AttachIcon } from "../icons/Attach.svg";
import { ReactComponent as ChatIcon } from "../icons/Chat.svg";
import { ReactComponent as SendIcon } from "../icons/Send.svg";
import { ReactComponent as ReactionIcon } from "../icons/Reaction.svg";
import { IconButton } from "../input/IconButton";
import { TextAreaInput } from "../input/TextAreaInput";
import { ToolbarButton } from "../input/ToolbarButton";
import { Popover } from "../popover/Popover";
import { EmojiPicker } from "./EmojiPicker";
import styles from "./ChatSidebar.scss";
import { formatMessageBody } from "../../utils/chat-message";
import { FormattedMessage, useIntl, defineMessages, FormattedRelativeTime } from "react-intl";
import { logSocialShare } from "../../utils/firebase-util";

export function SpawnMessageButton(props) {
  return (
    <IconButton className={styles.chatInputIcon} {...props}>
      <WandIcon />
    </IconButton>
  );
}

export function SendMessageButton(props) {
  return (
    <IconButton className={styles.chatInputIcon} {...props}>
      <SendIcon />
    </IconButton>
  );
}

export function EmojiPickerPopoverButton({ onSelectEmoji }) {
  return (
    <Popover
      title=""
      content={props => (
        <EmojiPicker
          onSelect={emoji => {
            onSelectEmoji(emoji);
            // eslint-disable-next-line react/prop-types
            props.closePopover();
          }}
          {...props}
        />
      )}
      placement="top"
      offsetDistance={28}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <IconButton ref={triggerRef} className={styles.chatInputIcon} selected={popoverVisible} onClick={togglePopover}>
          <ReactionIcon />
        </IconButton>
      )}
    </Popover>
  );
}

EmojiPickerPopoverButton.propTypes = {
  onSelectEmoji: PropTypes.func.isRequired
};

export function MessageAttachmentButton(props) {
  return (
    <>
      <IconButton as="label" className={styles.chatInputIcon}>
        <AttachIcon />
        <input type="file" {...props} />
      </IconButton>
    </>
  );
}

export function ChatLengthWarning({ messageLength, maxLength }) {
  return (
    <p
      className={classNames(styles.chatInputWarning, {
        [styles.warningTextColor]: messageLength > maxLength
      })}
    >
      <FormattedMessage id="chat-message-input.warning-max-characters" defaultMessage="Max characters" />
      {` (${messageLength}/${maxLength})`}
    </p>
  );
}

ChatLengthWarning.propTypes = {
  messageLength: PropTypes.number,
  maxLength: PropTypes.number
};

export function ChatInput({ warning, isOverMaxLength, ...props }) {
  const intl = useIntl();

  return (
    <div className={styles.chatInputContainer}>
      <TextAreaInput
        textInputStyles={styles.chatInputTextAreaStyles}
        className={classNames({ [styles.warningBorder]: isOverMaxLength })}
        placeholder={intl.formatMessage({ id: "chat-sidebar.input.placeholder", defaultMessage: "Message..." })}
        {...props}
      />
      {warning}
    </div>
  );
}

ChatInput.propTypes = {
  onSpawn: PropTypes.func,
  warning: PropTypes.node,
  isOverMaxLength: PropTypes.bool
};

const enteredMessages = defineMessages({
  room: { id: "chat-sidebar.system-message.entered-room", defaultMessage: "{name} entered the room." },
  lobby: { id: "chat-sidebar.system-message.entered-lobby", defaultMessage: "{name} entered the lobby." }
});

const joinedMessages = defineMessages({
  lobby: { id: "chat-sidebar.system-message.joined-lobby", defaultMessage: "{name} joined the lobby." },
  room: { id: "chat-sidebar.system-message.joined-room", defaultMessage: "{name} joined the room." }
});

export const LogMessageType = {
  roomEntryRequired: "roomEntryRequired",
  flyModeDisabled: "flyModeDisabled",
  flyModeEnabled: "flyModeEnabled",
  unauthorizedSceneChange: "unauthorizedSceneChange",
  invalidSceneUrl: "invalidSceneUrl",
  unauthorizedRoomRename: "unauthorizedRoomRename",
  captureUnavailable: "captureUnavailable",
  captureStopped: "captureStopped",
  captureStarted: "captureStarted",
  captureAlreadyStopped: "captureAlreadyStopped",
  captureAlreadyRunning: "captureAlreadyRunning",
  positionalAudioEnabled: "positionalAudioEnabled",
  positionalAudioDisabled: "positionalAudioDisabled",
  setAudioNormalizationFactor: "setAudioNormalizationFactor",
  audioNormalizationDisabled: "audioNormalizationDisabled",
  audioNormalizationNaN: "audioNormalizationNaN",
  invalidAudioNormalizationRange: "invalidAudioNormalizationRange",
  audioSuspended: "audioSuspended",
  audioResumed: "audioResumed",
  joinFailed: "joinFailed",
  avatarChanged: "avatarChanged"
};

const logMessages = defineMessages({
  [LogMessageType.roomEntryRequired]: {
    id: "chat-sidebar.log-message.room-entry-required",
    defaultMessage: "You must enter the room to use this command."
  },
  [LogMessageType.flyModeDisabled]: {
    id: "chat-sidebar.log-message.fly-mode-disabled",
    defaultMessage: "Fly mode disabled."
  },
  [LogMessageType.flyModeEnabled]: {
    id: "chat-sidebar.log-message.fly-mode-enabled",
    defaultMessage: "Fly mode enabled."
  },
  [LogMessageType.unauthorizedSceneChange]: {
    id: "chat-sidebar.log-message.unauthorized-scene-change",
    defaultMessage: "You do not have permission to change the scene."
  },
  [LogMessageType.invalidSceneUrl]: {
    id: "chat-sidebar.log-message.invalid-scene-url",
    defaultMessage: "This URL does not point to a scene or valid GLB."
  },
  [LogMessageType.unauthorizedRoomRename]: {
    id: "chat-sidebar.log-message.unauthorized-room-rename",
    defaultMessage: "You do not have permission to rename this room."
  },
  [LogMessageType.captureUnavailable]: {
    id: "chat-sidebar.log-message.capture-unavailable",
    defaultMessage: "Capture unavailable."
  },
  [LogMessageType.captureStopped]: {
    id: "chat-sidebar.log-message.capture-stopped",
    defaultMessage: "Capture stopped."
  },
  [LogMessageType.captureStarted]: {
    id: "chat-sidebar.log-message.capture-started",
    defaultMessage: "Capture started."
  },
  [LogMessageType.captureAlreadyStopped]: {
    id: "chat-sidebar.log-message.capture-already-stopped",
    defaultMessage: "Capture already stopped."
  },
  [LogMessageType.captureAlreadyRunning]: {
    id: "chat-sidebar.log-message.capture-already-running",
    defaultMessage: "Capture already running."
  },
  [LogMessageType.positionalAudioEnabled]: {
    id: "chat-sidebar.log-message.positional-audio-enabled",
    defaultMessage: "Positional audio enabled."
  },
  [LogMessageType.positionalAudioDisabled]: {
    id: "chat-sidebar.log-message.positional-audio-disabled",
    defaultMessage: "Positional audio disabled."
  },
  [LogMessageType.setAudioNormalizationFactor]: {
    id: "chat-sidebar.log-message.set-audio-normalization-factor",
    defaultMessage: "audioNormalization factor is set to {factor}."
  },
  [LogMessageType.audioNormalizationDisabled]: {
    id: "chat-sidebar.log-message.audio-normalization-disabled",
    defaultMessage: "audioNormalization is disabled."
  },
  [LogMessageType.audioNormalizationNaN]: {
    id: "chat-sidebar.log-message.audio-normalization-nan",
    defaultMessage: "audioNormalization command needs a valid number parameter."
  },
  [LogMessageType.invalidAudioNormalizationRange]: {
    id: "chat-sidebar.log-message.invalid-audio-normalization-range",
    defaultMessage:
      "audioNormalization command needs a base volume number between 0 [no normalization] and 255. Default is 0. The recommended value is 4, if you would like to enable normalization."
  },
  [LogMessageType.audioSuspended]: {
    id: "chat-sidebar.log-message.audio-suspended",
    defaultMessage: "Audio has been suspended, click somewhere in the room to resume the audio."
  },
  [LogMessageType.audioResumed]: {
    id: "chat-sidebar.log-message.audio-resumed",
    defaultMessage: "Audio has been resumed."
  },
  [LogMessageType.joinFailed]: {
    id: "chat-sidebar.log-message.join-failed",
    defaultMessage: "Failed to join room: {message}"
  },
  [LogMessageType.avatarChanged]: {
    id: "chat-sidebar.log-message.avatar-changed",
    defaultMessage: "Your avatar has been changed."
  }
});

// TODO: use react-intl's defineMessages to get proper extraction
export function formatSystemMessage(entry, intl) {
  switch (entry.type) {
    case "join":
      return intl.formatMessage(joinedMessages[entry.presence], { name: <b>{entry.name}</b> });
    case "entered":
      return intl.formatMessage(enteredMessages[entry.presence], { name: <b>{entry.name}</b> });
    case "leave":
      return (
        <FormattedMessage
          id="chat-sidebar.system-message.leave"
          defaultMessage="{name} left."
          values={{ name: <b>{entry.name}</b> }}
        />
      );
    case "display_name_changed":
      return (
        <FormattedMessage
          id="chat-sidebar.system-message.name-change"
          defaultMessage="{oldName} is now known as {newName}"
          values={{ oldName: <b>{entry.oldName}</b>, newName: <b>{entry.newName}</b> }}
        />
      );
    case "scene_changed":
      return (
        <FormattedMessage
          id="chat-sidebar.system-message.scene-change"
          defaultMessage="{name} changed the scene to {sceneName}"
          values={{ name: <b>{entry.name}</b>, sceneName: <b>{entry.sceneName}</b> }}
        />
      );
    case "hub_name_changed":
      return (
        <FormattedMessage
          id="chat-sidebar.system-message.hub-name-change"
          defaultMessage="{name} changed the name of the room to {hubName}"
          values={{ name: <b>{entry.name}</b>, hubName: <b>{entry.hubName}</b> }}
        />
      );
    case "hub_changed":
      return (
        <FormattedMessage
          id="chat-sidebar.system-message.hub-change"
          defaultMessage="You are now in {hubName}"
          values={{ hubName: <b>{entry.hubName}</b> }}
        />
      );
    case "log":
      return intl.formatMessage(logMessages[entry.messageType], entry.props);
    default:
      return null;
  }
}

export function SystemMessage(props) {
  const intl = useIntl();

  return (
    <li className={classNames(styles.messageGroup, styles.systemMessage)}>
      {props.showLineBreak && <hr />}
      <p className={styles.messageGroupLabel}>
        <i>{formatSystemMessage(props, intl)}</i>
        <span>
          <FormattedRelativeTime updateIntervalInSeconds={10} value={(props.timestamp - Date.now()) / 1000} />
        </span>
      </p>
    </li>
  );
}

SystemMessage.propTypes = {
  timestamp: PropTypes.any,
  showLineBreak: PropTypes.bool
};

function MessageBubble({ media, monospace, emoji, children }) {
  return (
    <div
      className={classNames(styles.messageBubble, {
        [styles.media]: media,
        [styles.emoji]: emoji,
        [styles.monospace]: monospace
      })}
    >
      {children}
    </div>
  );
}

MessageBubble.propTypes = {
  media: PropTypes.bool,
  monospace: PropTypes.bool,
  emoji: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  children: PropTypes.node
};

function getMessageComponent(message, sent) {
  switch (message.type) {
    case "chat": {
      const { formattedBody, monospace, emoji } = formatMessageBody(message.body);
      console.log("formattedBody ",formattedBody)
      return (
        <MessageBubble key={message.id} monospace={monospace} emoji={emoji}>
          {formattedBody}
        </MessageBubble>
      );
    }
    case "video":
      const urlSrc = 'https://forward-camera-345608.web.app/shareVideo?src='+message.body.src;
      return (
        <MessageBubble key={message.id} media>
          {/* <video controls src={message.body.src} preload="metadata" onLoad={()=>{this.player.seek(0)}}/> */}
          <video controls src={message.body.src} paused={true} />
          <div className={styles.socialShareContainer}>
            {/* <div class="fb-share-button" data-href={urlSrc}  data-layout="button" data-size="small"><a target="_blank" href={message.body.src} class="fb-xfbml-parse-ignore">Chia sẻ</a></div> */}
            <div class="facebook-share-button" onClick={() => {fbShare(urlSrc)}}><svg fill="#ffffff" viewBox="0 0 24 24" width="16px" height="16px"><path d="M17.525,9H14V7c0-1.032,0.084-1.682,1.563-1.682h1.868v-3.18C16.522,2.044,15.608,1.998,14.693,2 C11.98,2,10,3.657,10,6.699V9H7v4l3-0.001V22h4v-9.003l3.066-0.001L17.525,9z"/></svg> Chia sẻ</div>
            <div  onClick={() => {
              logSocialShare({
                method: "zalo",
                content_type: "video",
              });
            }}>
                    <a class="zalo-share-button" data-href={urlSrc} data-oaid="579745863508352884" data-layout="icon-text" data-customize="true">
                    <svg  viewBox="0 0 150.3 149.9"     width="12px" height="12px">
                    <g id="Layer_1">
                    </g>
                    <g id="Layer_2">
                    <g>
                    <path fill="#FFFFFF" d="M128,70.3c-2.4,0-4.3,1-5.6,3c-1.2,1.8-1.8,3.9-1.8,6.4c0,2.6,0.6,4.8,1.7,6.5c1.3,2,3.2,3.1,5.7,3.1
                    c2.4,0,4.3-1,5.7-3.1c1.2-1.8,1.7-3.9,1.7-6.5c0-2.5-0.6-4.6-1.8-6.4C132.2,71.3,130.4,70.3,128,70.3z" />
                    <path fill="#FFFFFF" d="M65.3,70.7c-2.3,0-4.2,0.9-5.5,2.8c-1.2,1.7-1.8,3.7-1.8,6.2c0,2.5,0.6,4.6,1.7,6.3
                    c1.3,1.9,3.2,2.9,5.6,2.9c2.3,0,4.2-1,5.5-3c1.1-1.7,1.7-3.8,1.7-6.2c0-2.4-0.6-4.4-1.8-6.1C69.4,71.7,67.6,70.7,65.3,70.7z" />
                    <path fill="#FFFFFF" d="M75.1,0C33.6,0,0,32.3,0,72.2c0,20.9,9.3,39.8,24.1,52.9l-1.3,24.8l22.1-11.7c9.3,3.9,19.5,6.1,30.3,6.1
                    c41.5,0,75.1-32.3,75.1-72.2C150.3,32.3,116.6,0,75.1,0z M37.7,98.8H14.5c-5.4,0-8.1-1.9-8.1-5.8c0-1.8,1.1-4.2,3.2-7l20.7-27.4
                    H15.4c-5.5,0-8.2-1.7-8.2-5.2c0-3.5,2.7-5.3,8.2-5.3H35c6.6,0,9.9,1.9,9.9,5.6c0,1.7-1.1,4-3.4,7.1L21.3,88.1h16.3
                    c5.5,0,8.2,1.8,8.2,5.3C45.9,97,43.2,98.8,37.7,98.8z M83.8,91.1c0,5.5-1.8,8.2-5.5,8.2c-2.4,0-4.2-1.3-5.4-3.9
                    c-2.3,2.9-5.5,4.3-9.4,4.3c-5.2,0-9.4-2.1-12.6-6.2c-3-3.8-4.5-8.4-4.5-13.6c0-5.3,1.6-9.9,4.7-13.7c3.3-4.1,7.6-6.2,12.8-6.2
                    c3.8,0,6.8,1.3,9,4c1.3-2.4,3.1-3.6,5.4-3.6c3.7,0,5.5,2.7,5.5,8.1V91.1z M103.1,91.1c0,5.5-1.8,8.2-5.5,8.2
                    c-3.8,0-5.6-2.7-5.6-8.2V52.6c0-5.5,1.9-8.2,5.6-8.2c3.7,0,5.5,2.7,5.5,8.2V91.1z M128,99.9c-5.7,0-10.3-1.9-13.9-5.8
                    c-3.5-3.8-5.2-8.5-5.2-14.3c0-5.7,1.7-10.5,5.2-14.2c3.6-3.9,8.2-5.8,13.9-5.8c5.7,0,10.3,1.9,13.9,5.8c3.4,3.8,5.1,8.5,5.1,14.3
                    c0,5.8-1.7,10.5-5.1,14.3C138.3,98,133.7,99.9,128,99.9z" />
                    </g>
                    </g>
                    <g id="Layer_3">
                    </g>
                    </svg>
                    <div style={{color:"#fff", padding:"0 0 0 5px"}}>Chia sẻ</div>
                    </a>
            </div>
          </div>
        </MessageBubble>
      )
    case "image":
      return (
        <MessageBubble key={message.id} media>
          <img src={message.body.src} />
        </MessageBubble>
      );
    case "photo":
      return (
        <MessageBubble key={message.id} media>
          <img src={message.body.src} />
          <div className={styles.socialShareContainer}>
            <div class="facebook-share-button" onClick={() => {fbShare(message.body.src)}}><svg fill="#ffffff" viewBox="0 0 24 24" width="16px" height="16px"><path d="M17.525,9H14V7c0-1.032,0.084-1.682,1.563-1.682h1.868v-3.18C16.522,2.044,15.608,1.998,14.693,2 C11.98,2,10,3.657,10,6.699V9H7v4l3-0.001V22h4v-9.003l3.066-0.001L17.525,9z"/></svg> Chia sẻ</div>
            <div  onClick={() => {
              logSocialShare({
                method: "zalo",
                content_type: "image",
              });
            }}>
                    <a class="zalo-share-button" data-href={message.body.src} data-oaid="579745863508352884" data-layout="icon-text" data-customize="true">
                    <svg  viewBox="0 0 150.3 149.9"     width="12px" height="12px">
                    <g id="Layer_1">
                    </g>
                    <g id="Layer_2">
                    <g>
                    <path fill="#FFFFFF" d="M128,70.3c-2.4,0-4.3,1-5.6,3c-1.2,1.8-1.8,3.9-1.8,6.4c0,2.6,0.6,4.8,1.7,6.5c1.3,2,3.2,3.1,5.7,3.1
                    c2.4,0,4.3-1,5.7-3.1c1.2-1.8,1.7-3.9,1.7-6.5c0-2.5-0.6-4.6-1.8-6.4C132.2,71.3,130.4,70.3,128,70.3z" />
                    <path fill="#FFFFFF" d="M65.3,70.7c-2.3,0-4.2,0.9-5.5,2.8c-1.2,1.7-1.8,3.7-1.8,6.2c0,2.5,0.6,4.6,1.7,6.3
                    c1.3,1.9,3.2,2.9,5.6,2.9c2.3,0,4.2-1,5.5-3c1.1-1.7,1.7-3.8,1.7-6.2c0-2.4-0.6-4.4-1.8-6.1C69.4,71.7,67.6,70.7,65.3,70.7z" />
                    <path fill="#FFFFFF" d="M75.1,0C33.6,0,0,32.3,0,72.2c0,20.9,9.3,39.8,24.1,52.9l-1.3,24.8l22.1-11.7c9.3,3.9,19.5,6.1,30.3,6.1
                    c41.5,0,75.1-32.3,75.1-72.2C150.3,32.3,116.6,0,75.1,0z M37.7,98.8H14.5c-5.4,0-8.1-1.9-8.1-5.8c0-1.8,1.1-4.2,3.2-7l20.7-27.4
                    H15.4c-5.5,0-8.2-1.7-8.2-5.2c0-3.5,2.7-5.3,8.2-5.3H35c6.6,0,9.9,1.9,9.9,5.6c0,1.7-1.1,4-3.4,7.1L21.3,88.1h16.3
                    c5.5,0,8.2,1.8,8.2,5.3C45.9,97,43.2,98.8,37.7,98.8z M83.8,91.1c0,5.5-1.8,8.2-5.5,8.2c-2.4,0-4.2-1.3-5.4-3.9
                    c-2.3,2.9-5.5,4.3-9.4,4.3c-5.2,0-9.4-2.1-12.6-6.2c-3-3.8-4.5-8.4-4.5-13.6c0-5.3,1.6-9.9,4.7-13.7c3.3-4.1,7.6-6.2,12.8-6.2
                    c3.8,0,6.8,1.3,9,4c1.3-2.4,3.1-3.6,5.4-3.6c3.7,0,5.5,2.7,5.5,8.1V91.1z M103.1,91.1c0,5.5-1.8,8.2-5.5,8.2
                    c-3.8,0-5.6-2.7-5.6-8.2V52.6c0-5.5,1.9-8.2,5.6-8.2c3.7,0,5.5,2.7,5.5,8.2V91.1z M128,99.9c-5.7,0-10.3-1.9-13.9-5.8
                    c-3.5-3.8-5.2-8.5-5.2-14.3c0-5.7,1.7-10.5,5.2-14.2c3.6-3.9,8.2-5.8,13.9-5.8c5.7,0,10.3,1.9,13.9,5.8c3.4,3.8,5.1,8.5,5.1,14.3
                    c0,5.8-1.7,10.5-5.1,14.3C138.3,98,133.7,99.9,128,99.9z" />
                    </g>
                    </g>
                    <g id="Layer_3">
                    </g>
                    </svg>
                    <div style={{color:"#fff", padding:"0 0 0 5px"}}>Chia sẻ</div>
                    </a>
            </div>
          </div>
        </MessageBubble>
      )
    default:
      return null;
  }
  
}

window.onZaloShared = () => {
 
  // logSocialShare({
  //   method: "zalo",
  // })
}

const fbShare = (url) => {
  FB.ui({
    method: 'share',
    href: url,
  }, function(response){
    if (response && !response.error_message) {
      logSocialShare({
        method: "facebook",
      })
    }
  });
}

export function ChatMessageGroup({ sent, sender, timestamp, messages }) {
  return sent ? (
    <li className={classNames(styles.messageGroup, { [styles.sent]: sent })}>
      <p className={styles.messageGroupLabel}>
        {sender} | <FormattedRelativeTime updateIntervalInSeconds={10} value={(timestamp - Date.now()) / 1000} />
      </p>
      <ul className={styles.messageGroupMessages}>{messages.map(message => getMessageComponent(message, sent))}</ul>
    </li>
  ) : null
}

ChatMessageGroup.propTypes = {
  sent: PropTypes.bool,
  sender: PropTypes.string,
  timestamp: PropTypes.any,
  messages: PropTypes.array
};

export const ChatMessageList = forwardRef(({ children, ...rest }, ref) => (
  <ul {...rest} className={styles.messageList} ref={ref}>
    {children}
  </ul>
));

ChatMessageList.propTypes = {
  children: PropTypes.node
};

export function ChatSidebar({ onClose, children, ...rest }) {
  return (
    <Sidebar
      title={<FormattedMessage id="chat-sidebar.title" defaultMessage="Chat" />}
      beforeTitle={<CloseButton onClick={onClose} />}
      contentClassName={styles.content}
      disableOverflowScroll
      {...rest}
    >
      {children}
    </Sidebar>
  );
}

ChatSidebar.propTypes = {
  onClose: PropTypes.func,
  onScrollList: PropTypes.func,
  children: PropTypes.node,
  listRef: PropTypes.func
};

export function ChatToolbarButton(props) {
  return (
    <ToolbarButton
      {...props}
      icon={<ChatIcon />}
      preset="accent4"
      label={<FormattedMessage id="chat-toolbar-button" defaultMessage="Chat" />}
    />
  );
}
