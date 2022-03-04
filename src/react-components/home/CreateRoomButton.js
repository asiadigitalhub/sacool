import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { createAndRedirectToNewHub } from "../../utils/phoenix-utils";
import { Button } from "../input/Button";
import { useCssBreakpoints } from "react-use-css-breakpoints";

export function CreateRoomButton() {
  const breakpoint = useCssBreakpoints();
  const intl = useIntl();
  return (
    <Button
      thick={breakpoint === "sm" || breakpoint === "md"}
      xl={breakpoint !== "sm" && breakpoint !== "md"}
      preset="landing"
      onClick={e => {
        e.preventDefault();
        const title = intl.formatMessage({id: "popup-safari", defaultMessage: "Please open window blocking in safari: Settings > Safari > Pop-up Blocker" });
        if(/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) == true){
          const tag = document.createElement("div")
          tag.classList.add('popupSafari')
          const add = "<p class='close'> " 
          const add1 = "</p>"
          const para = document.createElement("div");
          para.classList.add('popupSafari')
          const notifyText = title;
          para.innerHTML = add + notifyText + add1;
          document.querySelector('body').appendChild(para);
          setTimeout(function() {
            document.querySelector('.popupSafari .close').addEventListener('click', (e) => {
              document.querySelector('.popupSafari').classList.add('hidden');
              createAndRedirectToNewHub(null, null, false);
            });

          }, 1000);
        } else{
          createAndRedirectToNewHub(null, null, false);
        }
        // createAndRedirectToNewHub(null, null, false);
        
      }}
    >
      <FormattedMessage id="create-room-button" defaultMessage="Create Room" />
    </Button>
  );
}
