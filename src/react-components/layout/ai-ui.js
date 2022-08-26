import React, { useEffect, useState } from "react";
import styles from "./ai-ui.scss";
import classNames from "classnames";
import { lerp } from "three/src/math/MathUtils";

const trackUserMove = () => {
    const pos = { x: -999, y: 0, z: -999 };
    const botPosition = { x: 0, z: 6 };
    setInterval(() => {
        if (!window.currentPosition) return
        const cpos = window.currentPosition;
        if (Math.abs(cpos.x - pos.x) > 0.001 ||
            Math.abs(cpos.y - pos.y) > 0.001 ||
            Math.abs(cpos.z - pos.z) > 0.001
        ) {
            pos.x = cpos.x;
            pos.y = cpos.y;
            pos.z = cpos.z;
            window.currentRotation = Math.atan2(botPosition.x - pos.x, botPosition.z - pos.z) + Math.PI;
            window.dispatchEvent(new CustomEvent('onUserMove', { detail: pos }));
        }
    }, 1000)
}

trackUserMove();

let talking, pitch = 0;
const BotTalking = () => {
    const aibot = document.getElementById('ai-bot');
    const template = {
        'aa': 'morphtarget:viseme_aa;value:',
        'E': 'morphtarget:viseme_E;value:',
        'I': 'morphtarget:viseme_I;value:',
        'O': 'morphtarget:viseme_O;value:',
        'U': 'morphtarget:viseme_U;value:',
        'nn': 'morphtarget:viseme_nn;value:',
    };
    currentAnimation = 'talk';
    talking = setInterval(() => {
        pitch += 0.35;
        const amount = 0.4;
        const val = (Math.sin(pitch)) * amount;
        const val2 = (Math.sin(pitch * 0.8)) * amount;
        const val3 = (Math.cos(pitch * 0.8)) * amount;
        const val4 = (Math.cos(pitch * 1.15)) * amount;
        const val5 = (Math.sin(pitch + Math.PI * 0.65)) * amount;
        const val6 = (Math.cos(pitch + Math.PI * 0.65)) * amount;
        const arr = [val, val2, val3, val4, val5, val6];
        Object.keys(template).forEach((key, index) => {
            aibot.setAttribute(`gltf-morph__${key}`, `${template[key]}${Math.max(arr[index], 0)}`);
        })
    }, 50)
}

const BotStopTalking = () => {
    clearInterval(talking);
    currentAnimation = 'idle';
    const aibot = document.getElementById('ai-bot');
    const template = {
        'aa': 'morphtarget:viseme_aa;value:',
        'E': 'morphtarget:viseme_E;value:',
        'I': 'morphtarget:viseme_I;value:',
        'O': 'morphtarget:viseme_O;value:',
        'U': 'morphtarget:viseme_U;value:',
        'nn': 'morphtarget:viseme_nn;value:',
    };
    Object.keys(template).forEach((key) => {
        aibot.setAttribute(`gltf-morph__${key}`, `${template[key]}0`);
    })
}

const getPostAnimation = clip => {
    const totalTimer = clip.duration
    const ratio = totalTimer / 230 // 230 is the total frames from raw model
    return {
        walk: [0, 32 * ratio],
        idle: [40 * ratio, 100 * ratio],
        talk: [110 * ratio, 224 * ratio]
    }
}
let currentAnimation = 'idle'

if (!window.AI) {
    window.AI = {};
}
window.AI.startLipsSync = BotTalking;
window.AI.stopLipsSync = BotStopTalking;

const text = 'Chat with AI Bot';
const waiting = 'Con bot nó đang suy nghĩ ...';

const BotIdle = () => {
    console.log('BotIdle called');
    const model = document.getElementById('ai-bot');
    const gltfModel = model.components["gltf-model"];
    console.log('gltfModel', gltfModel);
    if (gltfModel) {
        console.log(gltfModel)
        const model = gltfModel.model
        if (model) {
            const mixer = new THREE.AnimationMixer(model)
            const clip = model.animations[0]
            const action = mixer.clipAction(clip)
            const clock = new THREE.Clock()
            action.setLoop(THREE.LoopRepeat)
            action.play()
            console.log(mixer, clip, action)
            const loop = () => {
                const delta = clock.getDelta();
                const currentAnimationInfo = getPostAnimation(clip)[currentAnimation];
                if (mixer.time >= currentAnimationInfo[1]) {
                    mixer.setTime(currentAnimationInfo[0])
                }
                mixer.update(delta);
                window.temp = {mixer, clip, action};
                requestAnimationFrame(() => { loop(); });
            }
            loop();
        }
        return true
    }
    return false
}

export const AIUI = () => {
    const [disabled, setDisabled] = useState(true);
    const [isCount, setIsCount] = useState(false);
    const [counter, setCounter] = useState(4);
    const [buttonText, setButtonText] = useState(text);
    useEffect(() => {
        window.addEventListener('onUserMove', e => {
            const pos = e.detail;
            console.log(e);
            if (pos) {
                if (Math.abs(pos.x) < 3 && Math.abs(pos.z) < 8 && Math.abs(pos.z) > 4) {
                    setDisabled(false);
                } else {
                    setDisabled(true);
                }
            }
        })
        //
        const callbackID = setInterval(() => {
            const inited = BotIdle();
            if (inited) {
                clearInterval(callbackID);
            }
        }, 1000);
    }, []);
    useEffect(() => {
        let callbackID;
        if (isCount) {
            callbackID = setInterval(() => {
                if (counter >= 0) {
                    console.log('setCounter', counter - 1);
                    setCounter(counter - 1);
                    setButtonText(counter + 's');
                }
            }, 1000);
            if (counter < 0) {
                setIsCount(false);
                setButtonText(waiting);
            }
        }
        return () => {
            clearInterval(callbackID);
        }
    }, [isCount, counter]);
    //
    const clickHandle = async () => {
        if (buttonText !== text) return;
        // BotTalking();
        setIsCount(true);
        setCounter(counter - 1);
        setButtonText(counter + 's');
        await window.AI.startAsk(BotTalking, BotStopTalking);
        console.log('done API');
        setCounter(4);
        setButtonText(text);
        // BotStopTalking();
    }
    return (
        <>
            <button onClick={clickHandle} className={classNames(styles.button, disabled && styles.disabled)}>{buttonText}</button>
        </>
    )
}