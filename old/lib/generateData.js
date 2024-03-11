export const fonts = [
    "Arial",
    "Arial Black",
    "Comic Sans MS",
    "Courier New",
    "Georgia",
    "Impact",
    "Lucida Console",
    "Lucida Sans Unicode",
    "Palatino Linotype",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS",
    "Verdana",
    "sans-serif",
    "serif",
    "monospace"
];

export const values = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

// Purpose: Generate data for the neural network.
export function generateNumberImage(number, size = 32, font = fonts[Math.random() * fonts.length | 0]) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");

    canvas.width = size;
    canvas.height = size;

    ctx.font = (Math.random() > .5 ? "bold " : "") + (size * .8 | 0) + "px " + font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "white";
    ctx.fillText(values[number % values.length], size / 2, size / 2);

    const data = ctx.getImageData(0, 0, size, size).data;

    return Array(data.length / 4).fill(0).map((_, i) => data[i * 4] / 255);
}