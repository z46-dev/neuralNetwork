import { generateNumberImage, values } from "./lib/generateData.js";

async function notify(message) {
    if (Notification.permission !== "granted") {
        await Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
        new Notification("Neural Network", {
            body: message
        });
    }
}

const imageSize = 64;

async function createAndTrain() {
    const images = [];

    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < 500; j++) {
            images.push({
                image: generateNumberImage(i, imageSize),
                label: i
            });
        }
    }

    const uint8Array = new Uint8Array(images.length * imageSize * imageSize + 4 + images.length);
    uint8Array.set([images.length >> 8, images.length & 0xFF, imageSize, values.length], 0);

    for (let i = 0; i < images.length; i++) {
        uint8Array.set([images[i].label], 4 + i);
        uint8Array.set(images[i].image, 4 + images.length + i * imageSize * imageSize);
    }

    const response = await fetch("/createTest", {
        method: "POST",
        body: uint8Array
    });

    const msg = await response.text();
    notify(`Neural Network trained: ${msg}`);

    return msg;
}

async function testNetwork(n = Math.random() * values.length | 0) {
    const image = generateNumberImage(n, imageSize);

    const response = await fetch("/test", {
        method: "POST",
        body: new Uint8Array(image)
    });

    const result = await response.text();

    return {
        valid: result == n,
        checked: values[n]
    };
}

async function multipleTests(n = 10) {
    let score = 0;

    for (let i = 0; i < values.length; i ++) {
        for (let j = 0; j < n; j ++) {
            const result = await testNetwork(i);

            if (result.valid) {
                score ++;
            }
        }
    }

    notify(`Tests done. Accuracy: ${score} / ${values.length * n} (${(score / (values.length * n)).toFixed(2)})`);
    return +((score / (values.length * n)).toFixed(2));
}

window.createAndTrain = createAndTrain;
window.testNetwork = testNetwork;
window.multipleTests = multipleTests;

function createAndTrainWS() {
    const socket = new WebSocket("ws://localhost:80");
    socket.binaryType = "arraybuffer";

    socket.onopen = function() {
        console.log("Connected to server.")
        const images = [];

        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < 500; j++) {
                images.push({
                    image: generateNumberImage(i, imageSize),
                    label: i
                });
            }
        }

        const uint8Array = new Uint8Array(images.length * imageSize * imageSize + 4 + images.length);
        uint8Array.set([images.length >> 8, images.length & 0xFF, imageSize, values.length], 0);

        for (let i = 0; i < images.length; i++) {
            uint8Array.set([images[i].label], 4 + i);
            uint8Array.set(images[i].image, 4 + images.length + i * imageSize * imageSize);
        }

        let i = 0,
            packetSize = 1024 * 4;

        console.log("Sending");

        while (i < uint8Array.length) {
            const packet = new Uint8Array(1 + Math.min(packetSize, uint8Array.length - i));
            packet.set([1], 0);
            packet.set(uint8Array.slice(i, i + packetSize), 1);
            i += packetSize;

            socket.send(packet);
        }

        socket.send(new Uint8Array([0]));
    };

    socket.onmessage = function(event) {
        console.log(`Neural Network Info: ${new Uint8Array(event.data)}`);
    };
}

window.createAndTrainWS = createAndTrainWS;