import NeuralNetwork from "./Network.js";
import { generateNumberImage, values } from "./generateData.js";

const range = values.length;
const trainingDataSize = range * 50;
const network = new NeuralNetwork(32 * 32, 256, range);
const results = Array(range).fill(0).map(() => Array(2).fill(0));

function progress(state, progress) {
    postMessage({
        type: "progress",
        state: state,
        progress: progress
    });
}

progress("Generating dataset...", 0);

const trainingData = []; // { image: [], label: 0-9 }
for (let i = 0; i < trainingDataSize; i++) {
    trainingData.push({
        image: generateNumberImage(i % range),
        label: i % range
    });

    if (i % 5 === 0) {
        progress("Generating dataset...", i / trainingDataSize);
    }
}

progress("Generating dataset...", 1);
progress("Training...", 0);

const trainingBlocks = Math.ceil(trainingDataSize / 100);
for (let i = 0; i < trainingBlocks; i++) {
    const block = trainingData.slice(i * 100, (i + 1) * 100);
    block.forEach((data, j) => {
        const inputs = data.image;
        const targets = Array(range).fill(0);
        targets[data.label] = 1;
        network.train(inputs, targets);

        if (j % 5 === 0) {
            progress("Training...", (i * 100 + j) / trainingDataSize);
        }
    });

    progress("Training...", i / trainingBlocks);
}

progress("Training...", 1);
progress("Testing...", 0);

for (let i = 0; i < range * 10; i++) {
    const n = i % range;
    const data = generateNumberImage(n);
    const output = network.predict(data);
    const guess = output.indexOf(Math.max(...output));

    results[n][0] += guess === n;
    results[n][1]++;

    if (i % 5 === 0) {
        progress("Testing...", i / (range * 10));
    }
}

progress("Testing...", 1);

postMessage({
    type: "results",
    data: results
});

console.log(network.serialize());