import e from "cors";
import { detectOS } from "detect-browser";

export function disableiOSZoom() {
  if (detectOS(navigator.userAgent) !== "iOS") return;

  let lastTouchAtMs = 0;

  document.addEventListener("touchmove", ev => {
    if (ev.scale === 1) return;
    if (ev.defaultPrevented) { // This is not a passive event
      ev.preventDefault();
    }    
  });

  document.addEventListener("touchend", ev => {
    const now = new Date().getTime();
    const isDoubleTouch = now - lastTouchAtMs <= 300;
    lastTouchAtMs = now;

    if (isDoubleTouch) {
      ev.preventDefault();
    }
  });
}
