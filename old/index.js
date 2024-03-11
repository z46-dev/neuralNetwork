import { values } from "./lib/generateData.js";

function trial() {
    const worker = new Worker("./lib/program.js", {
        type: "module"
    });

    return new Promise(function promiseHandler(resolve, reject) {
        worker.onmessage = (e) => {
            if (e.data.type === "results") {
                resolve(e.data.data);
            }

            if (e.data.type === "progress") {
                console.log(e.data.state, (e.data.progress * 100).toFixed(2) + "%");
            }

            // if (e.data.type === "log") {
            //     console.log(e.data.data);
            // }
        }

        worker.onerror = reject
    });
}

const trialCount = 1;
const scores = [];

for (let i = 0; i < trialCount; i++) {
    const results = await trial();
    scores.push(results.reduce((acc, cur) => acc + cur[0], 0) / results.reduce((acc, cur) => acc + cur[1], 0));
    console.log("Trial", i + 1, ":", scores[scores.length - 1]);

    for (let j = 0; j < results.length; j++) {
        console.log("    ", values[j], results[j][0] + "/" + results[j][1], results[j][0] / results[j][1]);
    }

    console.log("\n\n");
}

console.log(scores, scores.reduce((acc, cur) => acc + cur, 0) / trialCount);