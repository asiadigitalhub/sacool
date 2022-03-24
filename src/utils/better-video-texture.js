export default class BetterVideoTexture extends THREE.Texture {
    constructor(...args) {
        super(...args);
        this.isVideoTexture = true;
        this.__internalData = {};
        this[".i"] = this.__internalData;
        this.debug = false;
    }

    registerOptimization(forceFrame = 1000 / 15) {
        if (forceFrame === "DEFAULT") {
            return;
        }
        this[".i"].now = performance.now();
        this[".i"].optimization = true;
        this[".i"].condition = forceFrame;
        this[".i"].currentDelta = 0;
        if (forceFrame === "AUTO") {
            this[".i"].maxCondition = 1000 / 1;
            this[".i"].minCondition = 1000 / 30;
            this[".i"].historyFrames = [];
        }
    }

    update() {
        if (this[".i"].optimization) {
            if (this.needsUpdate) {
                this.needsUpdate = false;
            }
            const now = performance.now();
            const delta = now - this[".i"].now;
            this[".i"].now = now;
            this[".i"].currentDelta += delta;
            if (this[".i"].historyFrames) {
                this[".i"].historyFrames.push(delta);
                if (this[".i"].historyFrames.length > 5) {
                    this[".i"].historyFrames.shift();
                }
            }
            let condition;
            if (typeof this[".i"].condition === "string" && this[".i"].condition === "AUTO") {
                condition = this.__clamp(this.__calcAvgFrameRate(this[".i"].historyFrames), this[".i"].minCondition, this[".i"].maxCondition);
            } else {
                condition = this[".i"].condition;
            }
            if (this[".i"].currentDelta > condition) {
                if (this.debug) {
                    console.log('Video FPS: ', Math.round((1000 / 60) / this[".i"].currentDelta * 60));
                }
                this[".i"].currentDelta = 0;
                this.needsUpdate = true;
            }
            return;
        }
        this.needsUpdate = true;
    }

    __calcAvgFrameRate(list = []) {
        let total = 0;
        let counter = 0;
        list.forEach(item => {
            total += item;
            counter++;
        });
        return total / counter;
    }

    __clamp(val, min, max) {
        return Math.max(Math.min(val, max), min);
    }
}