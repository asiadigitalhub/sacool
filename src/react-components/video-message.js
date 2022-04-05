import React from "react";
import PropTypes from "prop-types";
import configs from "../utils/configs";

import styles from "../assets/stylesheets/presence-log.scss";
import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { share } from "../utils/share";

export default function VideoMessage({ name, body: { src: url }, className, maySpawn, hubId }) {
  const intl = useIntl();

  const onShareClicked = share.bind(null, {
    url: url,
    title: intl.formatMessage(
      {
        id: "video-message.default-tweet",
        defaultMessage: "Taken in {shareHashtag}"
      },
      {
        shareHashtag: configs.translation("share-hashtag"),
        url: `https://${configs.SHORTLINK_DOMAIN}/${hubId}`
      }
    )
  });
  return (
    <div className={className}>
      {maySpawn && <button className={classNames(styles.iconButton, styles.share)} onClick={onShareClicked} />}
      <div className={styles.mediaBody}>
        <FormattedMessage
          id="video-message.body"
          defaultMessage="{name} took a <a>video</a>."
          values={{
            name: <b>{name}</b>,
            // eslint-disable-next-line react/display-name
            a: chunks => (
              <b>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              </b>
            )
          }}
        />
        <div className={styles.socialShareContainer}>
          <div class="facebook-share-button" onClick={() => {fbShare(url)}}><svg fill="#ffffff" viewBox="0 0 24 24" width="16px" height="16px"><path d="M17.525,9H14V7c0-1.032,0.084-1.682,1.563-1.682h1.868v-3.18C16.522,2.044,15.608,1.998,14.693,2 C11.98,2,10,3.657,10,6.699V9H7v4l3-0.001V22h4v-9.003l3.066-0.001L17.525,9z"/></svg> Chia sẻ</div>
          <div class="zalo-share-button" data-href={url} data-oaid="579745863508352884" data-layout="2" data-color="blue" data-customize="false"  data-callback="onZaloShared"></div>
        </div>
      </div>
    </div>
  );
}

window.onZaloShared = () => {
  logAction({
    event: "social_shared",
    type: "zalo"
  })
  pushDataLayer({
    event: "social_shared",
    type: "zalo"
  })
}

const fbShare = (url) => {
  FB.ui({
    method: 'share',
    href: url,
  }, function(response){
    if (response && !response.error_message) {
      logAction({
        event: "social_shared",
        type: "facebook"
      })
      pushDataLayer({
        event: "social_shared",
        type: "facebook"
      })
    }
  });
}

VideoMessage.propTypes = {
  name: PropTypes.string,
  maySpawn: PropTypes.bool,
  body: PropTypes.object,
  className: PropTypes.string,
  hubId: PropTypes.string
};
