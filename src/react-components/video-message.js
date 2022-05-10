import React from "react";
import PropTypes from "prop-types";
import configs from "../utils/configs";

import styles from "../assets/stylesheets/presence-log.scss";
import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { share } from "../utils/share";
import { logSocialShare } from "../utils/firebase-util";

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


  // const urlEncode = new URL(url);
  // const token = urlEncode.searchParams.get("token");
  // const videoSrc = urlEncode.pathname.replace("pathname","");
  const urlSrc = 'https://forward-camera-345608.web.app/shareVideo?src='+url;

  return (
    <div className={className}>
      {maySpawn && <button className={classNames(styles.iconButton, styles.share)} onClick={onShareClicked} />}
      <div className={styles.mediaBody}>
        <FormattedMessage
          id="video-message.body"
          defaultMessage="{name} took a <a>video</a>"
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
      </div>
    </div>
  );
}

window.onZaloShared = () => {
  logSocialShare({
    method: "zalo",
    content_type: "video",
  })
}

const fbShare = (url) => {
  FB.ui({
    method: 'share',
    href: url,
  }, function(response){
    if (response && !response.error_message) {
      logSocialShare({
        method: "facebook",
        content_type: "video",
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
