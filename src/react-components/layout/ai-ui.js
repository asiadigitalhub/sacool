import React, { useEffect, useState } from "react";
import styles from "./ai-ui.scss";
import classNames from "classnames";
// import { AIHost } from "./ai-host";
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

const BotTalking = () => {
//   const aibot = document.getElementById("ai-bot");
//   const template = {
//     aa: "morphtarget:viseme_aa;value:",
//     E: "morphtarget:viseme_E;value:",
//     I: "morphtarget:viseme_I;value:",
//     O: "morphtarget:viseme_O;value:",
//     U: "morphtarget:viseme_U;value:",
//     nn: "morphtarget:viseme_nn;value:"
//   };
//   // eslint-disable-next-line no-use-before-define
//   currentAnimation = "talk";
//   talking = setInterval(() => {
//     pitch += 0.35;
//     const amount = 0.4;
//     const val = Math.sin(pitch) * amount;
//     const val2 = Math.sin(pitch * 0.8) * amount;
//     const val3 = Math.cos(pitch * 0.8) * amount;
//     const val4 = Math.cos(pitch * 1.15) * amount;
//     const val5 = Math.sin(pitch + Math.PI * 0.65) * amount;
//     const val6 = Math.cos(pitch + Math.PI * 0.65) * amount;
//     const arr = [val, val2, val3, val4, val5, val6];
//     Object.keys(template).forEach((key, index) => {
//       aibot.setAttribute(`gltf-morph__${key}`, `${template[key]}${Math.max(arr[index], 0)}`);
//     });
//   }, 50);
};

const BotStopTalking = () => {
//   clearInterval(talking);
//   // eslint-disable-next-line no-use-before-define
//   currentAnimation = "idle";
//   const aibot = document.getElementById("ai-bot");
//   const template = {
//     aa: "morphtarget:viseme_aa;value:",
//     E: "morphtarget:viseme_E;value:",
//     I: "morphtarget:viseme_I;value:",
//     O: "morphtarget:viseme_O;value:",
//     U: "morphtarget:viseme_U;value:",
//     nn: "morphtarget:viseme_nn;value:"
//   };
//   Object.keys(template).forEach(key => {
//     aibot.setAttribute(`gltf-morph__${key}`, `${template[key]}0`);
//   });
console.log("Stop talking");
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
  const ratio = totalTimer / 230; // 230 is the total frames from raw model
  return {
    walk: [0, 31 * ratio],
    idle: [41 * ratio, 99 * ratio],
    talk: [111 * ratio, 222 * ratio]
  };
};
let currentAnimation = "idle";

if (!window.AI) {
  window.AI = {};
}
window.AI.startLipsSync = BotTalking;
window.AI.stopLipsSync = BotStopTalking;
window.AI.botMove = BotMove;
window.currentAnimation = currentAnimation;

const text = "Chat with AI Bot";
const waiting = "Let me thing...";

const BotIdle = () => {
  console.log("BotIdle called");
  const model = document.getElementById("ai-bot");
  const gltfModel = model.components["gltf-model"];
  if (gltfModel) {
    const model = gltfModel.model;
    if (model) {
      const mixer = new THREE.AnimationMixer(model);
      const clip = model.animations[0];
      const action = mixer.clipAction(clip);
      const clock = new THREE.Clock();
      action.setLoop(THREE.LoopRepeat);
      action.play();
      const loop = () => {
        const delta = clock.getDelta();
        mixer.update(delta);
        requestAnimationFrame(() => {
          loop();
        });
      };
      loop();
    }
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
          if (Math.abs(pos.x) > 16.5 && Math.abs(pos.x) < 20 && Math.abs(pos.z) < 28) {
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

    const callbackID = setInterval(() => {
      const inited = BotIdle();
      //AIHost();
      if (inited) {
        clearInterval(callbackID);
      }
    }, 1000);
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
