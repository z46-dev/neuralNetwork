import NeuralNetwork from "./Network.js";
import { generateNumberImage, values } from "./generateData.js";

onmessage = e => {
    const range = values.length;
    const network = NeuralNetwork.fromSerialized(e.data);
    const results = Array(range).fill(0).map(() => Array(2).fill(0));

    for (let i = 0; i < range * 10; i++) {
        const n = i % range;
        const data = generateNumberImage(n);
        const output = network.predict(data);
        const guess = output.indexOf(Math.max(...output));

        results[n][0] += guess === n;
        results[n][1]++;
    }

    postMessage({
        type: "results",
        data: results
    });
}