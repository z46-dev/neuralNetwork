import { WebSocketServer } from "ws";
import ImagesBuffer from "./lib/ImagesBuffer.js";
import Server from "./lib/Server.js";
import NeuralNetwork from "./lib/NeuralNetwork.js";
import { loadTest, saveTest } from "./lib/saveTest.js";

const webServer = new Server(80);
/**
 * @type {WebSocketServer}
 */
const webSocketServer = webServer.createWebSocketServer(WebSocketServer);

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

webSocketServer.on("connection", function connection(socket) {
    socket.binaryType = "arraybuffer";

    function talk(type, data) {
        const buffer = Buffer.alloc(11);
        switch (type) {
            case "progress":
                buffer.writeUint8(0, 0);
                buffer.writeUint8(data * 256 | 0, 1);
                break;
            case "beginning":
                buffer.writeUint8(1, 0);
                buffer.writeUint16LE(data.imageCount, 1);
                buffer.writeUint16LE(data.imageSize, 3);
                buffer.writeUint8(data.labelsSize, 5);
                buffer.writeUint32LE(data.packetSize, 6);
                break;
            case "progress":
                buffer.writeUint8(2, 0);
                buffer.writeFloatLE(data, 1);
                break;
            case "end":
                buffer.writeUint8(3, 0);
                break;
        }

        socket.send(buffer);
    }

    /**
     * @param {Buffer} buffer 
     */
    function begin(buffer) {
        const imagesBuffer = ImagesBuffer.fromBuffer(buffer);
        const network = new NeuralNetwork(imagesBuffer.size ** 2, 1024, 128, imagesBuffer.labelsSize);

        talk("beginning", {
            imageCount: imagesBuffer.images.length,
            imageSize: imagesBuffer.size,
            labelsSize: imagesBuffer.labelsSize,
            packetSize: buffer.length
        });

        for (let i = 0; i < imagesBuffer.images.length; i++) {
            const output = new Array(imagesBuffer.labelsSize).fill(0);
            output[imagesBuffer.labels[i]] = 1;

            network.train(imagesBuffer.images[i], output);

            if (i % 50 === 0) {
                talk("progress", i / imagesBuffer.images.length);
            }
        }

        talk("end");

        // Save
        saveTest("t4", imagesBuffer.toBuffer(), network.serialize());
    }

    const buffers = [];
    socket.onmessage = function onmessage(event) {
        const buffer = Buffer.from(event.data);

        if (buffer.at(0) === 0) {
            begin(Buffer.concat(buffers));
            buffers.length = 0;
        } else {
            buffers.push(buffer.slice(1));
        }
    };
});

webServer.listen();