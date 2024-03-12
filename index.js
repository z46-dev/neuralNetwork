// TODO:
// 1. Create neural network and then train and save it.
// 2. Allow a user to upload a test and then test the neural network after loading it.

import ImagesBuffer from "./lib/ImagesBuffer.js";
import Server from "./lib/Server.js";
import NeuralNetwork from "./lib/NeuralNetwork.js";
import { loadTest, saveTest } from "./lib/saveTest.js";

const webServer = new Server(80);
webServer.publicize("./public");

webServer.post("/createTest", function processRequest(request, response) {
    /**
     * @type {Buffer}
     */
    const body = request.body;
    const imagesBuffer = ImagesBuffer.fromBuffer(body);

    const pixelCount = imagesBuffer.size ** 2;
    const network = new NeuralNetwork(pixelCount, 1024, 128, imagesBuffer.labelsSize);

    for (let i = 0; i < imagesBuffer.images.length; i++) {
        const output = new Array(imagesBuffer.labelsSize).fill(0);
        output[imagesBuffer.labels[i]] = 1;

        network.train(imagesBuffer.images[i], output);
    }

    saveTest("t4", imagesBuffer.toBuffer(), network.serialize());

    response.send("Received " + imagesBuffer.images.length + " images from " + body.length + " bytes (" + (body.length / 1024 / 1024).toFixed(2) + "mb).");
});

webServer.post("/test", function processRequest(request, response) {
    /**
     * @type {Buffer}
     */
    const body = request.body;
    const loaded = loadTest("t4");

    if (!loaded) {
        response.send("No test found.");
        return;
    }

    const network = NeuralNetwork.fromSerialized(loaded.jsonNeuralNetwork);
    const output = network.predict(Array.from(new Uint8Array(body)));

    response.send(output.indexOf(Math.max(...output)).toString());
});

webServer.listen();