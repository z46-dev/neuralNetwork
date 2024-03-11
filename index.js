// TODO:
// 1. Add labels to the buffer and then the total labels count to the buffer.
// 2. Create neural network and then train and save it.
// 3. Allow a user to upload a test and then test the neural network after loading it.

import ImagesBuffer from "./lib/ImagesBuffer.js";
import Server from "./lib/Server.js";
import NeuralNetwork from "./lib/NeuralNetwork.js";

const webServer = new Server(80);
webServer.publicize("./public");

webServer.post("/createTest", function processRequest(request, response) {
    /**
     * @type {Buffer}
     */
    const body = request.body;
    const imagesBuffer = ImagesBuffer.fromBuffer(body);

    response.send("Received " + imagesBuffer.images.length + " images from " + body.length + " bytes (" + (body.length / 1024 / 1024).toFixed(2) + "mb).");

    const name = "test1";
    const neuralNetwork = new NeuralNetwork(1024, 256, );
});

webServer.listen();