import { generateNumberImage, values } from "./lib/generateData.js";

window.onload = () => {
    const images = [];

    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < 100; j++) {
            images.push(generateNumberImage(i, 32));
        }
    }

    const uint8Array = new Uint8Array(images.length * 32 * 32 + 3);
    uint8Array.set([images.length >> 8, images.length & 0xFF, 32], 0);

    for (let i = 0; i < images.length; i++) {
        uint8Array.set(images[i], 3 + i * 32 * 32);
    }

    console.log(uint8Array);

    fetch("/uploadTestImages", {
        method: "POST",
        body: uint8Array
    }).then(response => response.text()).then(console.log);
}