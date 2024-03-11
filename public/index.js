import { generateNumberImage, values } from "./lib/generateData.js";

function createTest() {
    const images = [];

    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < 100; j++) {
            images.push({
                image: generateNumberImage(i, 32),
                label: i
            });
        }
    }

    const uint8Array = new Uint8Array(images.length * 32 * 32 + 4 + images.length);
    uint8Array.set([images.length >> 8, images.length & 0xFF, 32, values.length, ...images.map(i => i.label)], 0);

    for (let i = 0; i < images.length; i++) {
        uint8Array.set(images[i].image, 4 + images.length + i * 32 * 32);
    }

    fetch("/createTest", {
        method: "POST",
        body: uint8Array
    }).then(response => response.text()).then(console.log);
}

function makeTest() {
    const n = Math.random() * values.length | 0;
    const value = values[n];

    console.log("Testing " + value);

    const image = generateNumberImage(n, 32);

    fetch("/test", {
        method: "POST",
        body: new Uint8Array(image)
    }).then(response => response.text()).then(data => {
        console.log("Predicted " + data, "Expected " + n);
    });
}

window.createTest = createTest;
window.makeTest = makeTest;