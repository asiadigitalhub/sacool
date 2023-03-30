import React, { useEffect, useState } from "react";
import styles from "./ai-ui.scss";
import classNames from "classnames";
// import { AIHost } from "./ai-host";
let currentAnimation = "idle",
  currentTimeAnim = 0,
  timeID = 0;
const trackUserMove = () => {
  const pos = { x: -999, y: 0, z: -999 };
  const botPosition = { x: 0, z: 6 };
  setInterval(() => {
    if (!window.currentPosition) return;
    const cpos = window.currentPosition;
    if (Math.abs(cpos.x - pos.x) > 0.001 || Math.abs(cpos.y - pos.y) > 0.001 || Math.abs(cpos.z - pos.z) > 0.001) {
      pos.x = cpos.x;
      pos.y = cpos.y;
      pos.z = cpos.z;
      window.currentRotation = Math.atan2(botPosition.x - pos.x, botPosition.z - pos.z) + Math.PI;
      window.dispatchEvent(new CustomEvent("onUserMove", { detail: pos }));
    }
  }, 1000);
};

trackUserMove();

const InitBot = () => {
  const aibot = document.getElementById("ai-bot");
  const gltfModel = aibot.components["gltf-model"];
  let mixer, action, clock, clip;
  if (gltfModel) {
    const model = gltfModel.model;
    if (model) {
      mixer = new THREE.AnimationMixer(model);
      clip = model.animations[0];
      action = mixer.clipAction(clip);
      clock = new THREE.Clock();
    }
  }

  return { mixer, action, clock, clip };
};

const doAnimationLoop = (mixer, clock, currentAnimationInfo) => {
  if (timeID) {
    cancelAnimationFrame(timeID);
  }
  const loop = () => {
    const delta = clock.getDelta();
    if (mixer.time >= currentAnimationInfo[1]) {
      mixer.setTime(currentAnimationInfo[0]);
    }
    currentTimeAnim = mixer.time;
    mixer.update(delta);
    if (timeID) {
      cancelAnimationFrame(timeID);
    }
    timeID = requestAnimationFrame(loop);
  };
  loop();
};

const BotTalking = state => {
  console.log("Start talking...");
  currentAnimation = state || "talk";
  if (window.currentAnimation === "present") {
    currentAnimation = "present";
  }

  const { mixer, action, clock, clip } = InitBot();
  if (mixer) {
    action.setLoop(THREE.LoopRepeat, Infinity);
    // eslint-disable-next-line no-use-before-define
    const currentAnimationInfo = getPostAnimation(clip)[currentAnimation];
    mixer.setTime(currentAnimationInfo[0]);
    action.play();
    doAnimationLoop(mixer, clock, currentAnimationInfo);
  }
};

const BotStopTalking = () => {
  // eslint-disable-next-line no-use-before-define
  const { mixer, action, clock, clip } = InitBot();
  currentAnimation = "idle";
  if (mixer) {
    action.setLoop(THREE.LoopRepeat, Infinity);
    // eslint-disable-next-line no-use-before-define
    const currentAnimationInfo = getPostAnimation(clip)[currentAnimation];
    action.play();
    doAnimationLoop(mixer, clock, currentAnimationInfo);
  }
};

let rotateCallbackId = 0;
const NoteActiveRotate = () => {
  const ssnoteGLB = document.getElementById("ai-samsung-glb");
  let rot = 90;
  const rotateHandler = () => {
    rot += 0.15;
    ssnoteGLB.setAttribute("rotation", `180.00 ${rot} 180.00`);
    rotateCallbackId = requestAnimationFrame(() => rotateHandler());
  };
  rotateHandler();
};
const FlyAnimation = (direction = 1) => {
  if (rotateCallbackId) {
    cancelAnimationFrame(rotateCallbackId);
  }
  const ssnoteGLB = document.getElementById("ai-samsung-glb");
  const cachedPosition = [-14.3, 1.46, -24.2];
  const targetPosition = [-14.3, 3.46, -24.2];
  const scaleFrom = 4;
  const scaleTo = 20;
  const posDiff = targetPosition[1] - cachedPosition[1];
  const step = 0.01;
  let alpha = direction > 0 ? 0 : 1;
  const flyHandler = () => {
    alpha += step * direction;
    if (alpha > 1 || alpha < 0) {
      if (direction > 0) {
        NoteActiveRotate();
      }
      return;
    }
    const scale = scaleFrom + (scaleTo - scaleFrom) * alpha;
    const position = [cachedPosition[0], cachedPosition[1] + posDiff * alpha, cachedPosition[2]];
    ssnoteGLB.setAttribute("position", position.join(" "));
    ssnoteGLB.setAttribute("rotation", "180.00 90.00 180.00");
    ssnoteGLB.setAttribute("scale", `${scale} ${scale} ${scale}`);
    requestAnimationFrame(() => flyHandler());
  };
  flyHandler();
};
const speed = 0.05;
const BotMove = place => {
  return new Promise(resolve => {
    // eslint-disable-next-line no-use-before-define
    if (place === places.current) {
      resolve();
      return;
    }
    window.currentAnimation = "walk";
    const aibot = document.getElementById("ai-bot");
    const currentPos = place === "sales" ? [0, 0.15, 6] : [-19.5, 1.45, -0.5];
    const minDiff = 0.08;
    // eslint-disable-next-line no-use-before-define
    const targetPlace = places[place];
    let currentPath = 0;
    // do walk
    const loop = () => {
      const next = targetPlace.paths[currentPath];
      if (!next) {
        window.currentAnimation = "idle";
        // eslint-disable-next-line no-use-before-define
        places.current = place;
        resolve();
        return;
      }
      const xdir = next.x > currentPos[0] ? 1 : -1;
      const ydir = next.y > currentPos[1] ? 1 : -1;
      const zdir = next.z > currentPos[2] ? 1 : -1;
      currentPos[0] += xdir * speed;
      currentPos[1] += ydir * speed;
      currentPos[2] += zdir * speed;
      const diffX = Math.abs(currentPos[0] - next.x);
      const diffY = Math.abs(currentPos[1] - next.y);
      const diffZ = Math.abs(currentPos[2] - next.z);
      if (diffX < minDiff && diffY < minDiff && diffZ < minDiff) {
        currentPos[0] = next.x;
        currentPos[1] = next.y;
        currentPos[2] = next.z;
        currentPath++;
      }
      aibot.setAttribute("rotation", `0 ${next.r} 0`);
      aibot.setAttribute("position", currentPos.join(" "));
      requestAnimationFrame(() => {
        loop();
      });
    };
    loop();
  });
};

const getPostAnimation = clip => {
  const totalTimer = clip.duration;
  const ratio = totalTimer / 1099; // 1099 is the total frames from raw model
  return {
    idle: [0, 99 * ratio],
    talk: [100 * ratio, 880 * ratio],
    present: [881 * ratio, 1099 * ratio]
  };
};

if (!window.AI) {
  window.AI = {};
}
window.AI.startLipsSync = BotTalking;
window.AI.stopLipsSync = BotStopTalking;
window.AI.botMove = BotMove;
window.currentAnimation = currentAnimation;

const text = "Chat with John";
const waiting = "Let me think...";

const BotIdle = () => {
  console.log("BotIdle called");
  const { mixer, action, clock, clip } = InitBot();
  if (mixer) {
    action.setLoop(THREE.LoopRepeat);
    const currentAnimationInfo = getPostAnimation(clip)["idle"];
    action.play();
    doAnimationLoop(mixer, clock, currentAnimationInfo);
    currentAnimation = "present";
    return true;
  }
  return false;
};

const places = {
  sales: {
    paths: [
      {
        x: -8,
        y: 0.15,
        z: 0.7,
        r: -45
      },
      {
        x: -19.5,
        y: 1.45,
        z: -0.5,
        r: -60
      },
      {
        x: -24,
        y: 1.45,
        z: -0.6,
        r: 0
      }
    ]
  },
  education: {
    paths: [
      {
        x: -19.5,
        y: 1.45,
        z: -0.5,
        r: 90
      },
      {
        x: -8,
        y: 0.15,
        z: 0.7,
        r: 45
      },
      {
        x: 0,
        y: 0.15,
        z: 6,
        r: 0
      }
    ]
  },
  current: "education"
};

export const AIUI = () => {
  const [disabled, setDisabled] = useState(true);
  const [isCount, setIsCount] = useState(false);
  const [counter, setCounter] = useState(4);
  const [buttonText, setButtonText] = useState(text);
  useEffect(() => {
    window.addEventListener("onUserMove", e => {
      const pos = e.detail;
      if (pos) {
        if (places.current === "education") {
          if (Math.abs(pos.x) > 18.5 && Math.abs(pos.x) < 23 && Math.abs(pos.z) < 28) {
            setDisabled(false);
          } else {
            setDisabled(true);
          }
        } else if (places.current === "sales") {
          if (pos.x < -20 && pos.x > -28 && pos.z > -4 && pos.z < 4) {
            setDisabled(false);
          } else {
            setDisabled(true);
          }
        }
      }
    });
    let direction = 1;
    window.addEventListener("keypress", e => {
      switch (e.code) {
        case "KeyT":
          console.log("Begin Talking");
          BotTalking();
          break;
        case "KeyL":
          console.log("Present Talking");
          BotTalking("present");
          break;
        case "KeyP":
          console.log("Stop Talking");
          BotStopTalking();
          break;
        case "Space":
          // eslint-disable-next-line no-use-before-define
          clickHandle();
          break;
        case "KeyF":
          FlyAnimation(direction);
          direction *= -1;
          break;
      }
    });
    const callbackID = setInterval(() => {
      const inited = BotIdle();
      // AIHost();
      if (inited) {
        clearInterval(callbackID);
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(
    () => {
      let callbackID;
      if (isCount) {
        callbackID = setInterval(() => {
          if (counter >= 0) {
            console.log("setCounter", counter - 1);
            setCounter(counter - 1);
            setButtonText(counter + "s");
          }
        }, 1000);
        if (counter < 0) {
          setIsCount(false);
          setButtonText(waiting);
        }
      }
      return () => {
        clearInterval(callbackID);
      };
    },
    [isCount, counter]
  );

  const clickHandle = async () => {
    if (buttonText !== text) return;
    // BotTalking();
    setIsCount(true);
    setCounter(counter - 1);
    setButtonText(counter + "s");
    await window.AI.startAsk(BotTalking, BotStopTalking);
    console.log("done API");
    setCounter(4);
    setButtonText(text);
    // BotStopTalking();
  };
  return (
    <>
      <button onClick={clickHandle} className={classNames(styles.button, disabled && styles.disabled)}>
        {buttonText}
      </button>
    </>
  );
};
