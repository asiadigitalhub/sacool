import ncp from "ncp";

(async () => {
    ncp("./src/debug", "./dist/assets/raw-js", err => {
        if (err) {
            console.error(err);
        }
    })
})()