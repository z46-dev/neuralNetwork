function trial() {
    const worker = new Worker("./lib/program.js", {
        type: "module"
    });

    return new Promise(function promiseHandler(resolve, reject) {
        worker.onmessage = (e) => {
            if (e.data.type === "log") {
                console.log(e.data.data);
            } else if (e.data.type === "results") {
                resolve(e.data.data);
            }
        }

        worker.onerror = reject
    });
}

const trialCount = 10;
for (let i = 0; i < trialCount; i ++) {
    console.log("Running trial", (i + 1) + "/" + trialCount + "...");
    const results = await trial();

    for (let i = 0; i < results.length; i ++) {
        console.log(`Number ${i} accuracy: ${results[i][0]}/${results[i][1]} (${results[i][0] / results[i][1]})`);
    }

    console.log("\n\n");
}