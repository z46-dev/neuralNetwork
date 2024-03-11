import fs from "fs";

export function saveTest(name, buffer, jsonNeuralNetwork) {
    if (!fs.existsSync("./tests")) {
        fs.mkdirSync("./tests");
    }

    if (!fs.existsSync("./tests/" + name)) {
        fs.mkdirSync("./tests/" + name);
    }

    fs.writeFileSync("./tests/" + name + "/buffer.buf", buffer);
    fs.writeFileSync("./tests/" + name + "/neuralNetwork.json", jsonNeuralNetwork);
}

export function loadTest(name) {
    const buffer = fs.readFileSync("./tests/" + name + "/buffer.buf");
    const jsonNeuralNetwork = fs.readFileSync("./tests/" + name + "/neuralNetwork.json");

    return {
        buffer,
        jsonNeuralNetwork
    };
}