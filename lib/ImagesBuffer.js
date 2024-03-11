export default class ImagesBuffer {
    /**
     * @param {Buffer} buffer
     * @returns {ImagesBuffer}
     */
    static fromBuffer(buffer) {
        const numberOfImages = buffer.readUint8(0) << 8 | buffer.readUint8(1);
        const size = buffer.readUint8(2);
        const labelsSize = buffer.readUint8(3);
        const imagesBuffer = new ImagesBuffer(numberOfImages, size, labelsSize);

        for (let i = 0; i < numberOfImages; i++) {
            const image = new Uint8Array(size * size);

            for (let j = 4 + numberOfImages + i * size * size, k = 0; k < size * size; j++, k++) {
                image[k] = buffer.readUint8(j);
            }

            imagesBuffer.labels.push(buffer.readUint8(4 + i));
            imagesBuffer.images.push(image);
        }

        return imagesBuffer;
    }

    constructor(numberOfImages, size, labelsSize) {
        this.numberOfImages = numberOfImages;
        this.size = size;
        this.labelsSize = labelsSize;
        this.labels = [];
        this.images = [];
    }

    /**
     * @returns {Buffer}
     */
    toBuffer() {
        const buffer = Buffer.alloc(4 + this.numberOfImages + this.numberOfImages * this.size * this.size);
        buffer.writeUint8(this.numberOfImages >> 8, 0);
        buffer.writeUint8(this.numberOfImages & 0xFF, 1);
        buffer.writeUint8(this.size, 2);
        buffer.writeUint8(this.labelsSize, 3);

        for (let i = 0; i < this.numberOfImages; i++) {
            buffer.writeUint8(this.labels[i], 4 + i);
            this.images[i].forEach((value, j) => {
                buffer.writeUint8(value, 4 + this.numberOfImages + i * this.size * this.size + j);
            });
        }

        return buffer;
    }
}