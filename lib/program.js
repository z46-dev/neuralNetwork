import NeuralNetwork from "./Network.js";
import { generateNumberImage, generateNumberedImage } from "./generateData.js";

const range = 10;
const trainingDataSize = 10000;

// This is a worker program that will be run in a separate process.
function pipe(data) {
    postMessage({
        type: "log",
        data: data
    });
}

pipe("Generating dataset...");

const trainingData = []; // { image: [], label: 0-9 }
for (let i = 0; i < trainingDataSize; i ++) {
    trainingData.push({
        image: generateNumberImage(i % range),
        label: i % range
    });
}

pipe("Dataset generated!");

const network = new NeuralNetwork(32 * 32, 256, range);
pipe("Network created!");

pipe("Training...");

trainingData.forEach((data, i) => {
    const inputs = data.image;
    const targets = Array(range).fill(0);
    targets[data.label] = 1;
    network.train(inputs, targets);

    if (i % 100 === 0) {
        pipe(`${(i / trainingData.length * 100).toFixed(2)}%`);
    }
});

pipe("Done training!");

const results = Array(range).fill(0).map(() => Array(2).fill(0));

for (let i = 0; i < range * 10; i ++) {
    const n = i % range;
    const data = generateNumberImage(n);
    const output = network.predict(data);
    const guess = output.indexOf(Math.max(...output));

    results[n][0] += guess === n;
    results[n][1] ++;
}

postMessage({
    type: "results",
    data: results
});