import React from "react";
import PropTypes from "prop-types";

import styles from "../assets/stylesheets/presence-log.scss";
import configs from "../utils/configs";
import classNames from "classnames";

import { share } from "../utils/share";
import { getLandingPageForPhoto } from "../utils/phoenix-utils";
import { FormattedMessage, useIntl } from "react-intl";

export default function PhotoMessage({ name, body: { src: url }, className, maySpawn, hubId }) {
  const intl = useIntl();

  const landingPageUrl = getLandingPageForPhoto(url);

  const onShareClicked = share.bind(null, {
    url: landingPageUrl,
    title: intl.formatMessage(
      {
        id: "photo-message.default-tweet",
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
        <div>test</div>
        <FormattedMessage
          id="photo-message.body"
          defaultMessage="{name} took a <a>photo</a>."
          values={{
            name: <b>{name}</b>,
            // eslint-disable-next-line react/display-name
            a: chunks => (
              <b>
                <a href={landingPageUrl} target="_blank" rel="noopener noreferrer">``
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
      <a href={landingPageUrl} target="_blank" rel="noopener noreferrer">
        <img src={url} />
      </a>
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
PhotoMessage.propTypes = {
  name: PropTypes.string,
  maySpawn: PropTypes.bool,
  body: PropTypes.object,
  className: PropTypes.string,
  hubId: PropTypes.string
};
