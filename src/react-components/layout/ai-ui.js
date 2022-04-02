import React, { useEffect, useState } from "react";
import styles from "./ai-ui.scss";
import classNames from "classnames";

export const usePlayerPosition = () => {
    const [pos, setPos] = useState({ x: -999, y: 0, z: -999 });
    let timeoutID = setTimeout(() => {
        if (!window.currentPosition) return
        if (window.currentPosition.x - pos.x < 0.001 ||
            window.currentPosition.y - pos.y < 0.001 ||
            window.currentPosition.z - pos.z < 0.001
            ) {
                const cpos = window.currentPosition;
                setPos({ x: cpos.x, y: cpos.y, z: cpos.z });
            }
    }, 1000)
    return [pos, () => { clearTimeout(timeoutID); }];
}

const text = 'Chat with AI Bot';
const waiting = 'Con bot nó đang suy nghĩ ...';

export const AIUI = () => {
    const [disabled, setDisabled] = useState(true);
    const [pos, clearPos] = usePlayerPosition();
    const [isCount, setIsCount] = useState(false);
    const [counter, setCounter] = useState(4);
    const [buttonText, setButtonText] = useState(text);
    useEffect(() => {
        if (Math.abs(pos.x) < 3 && Math.abs(pos.z) < 3) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
        return clearPos
    }, [pos]);
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
        setIsCount(true);
        setCounter(counter - 1);
        setButtonText(counter + 's');
        await window.AI.startAsk();
        console.log('done API');
        setCounter(4);
        setButtonText(text);
    }
    return (
        <>
            <button onClick={clickHandle} className={classNames(styles.button, disabled && styles.disabled)}>{buttonText}</button>
        </>
    )
}