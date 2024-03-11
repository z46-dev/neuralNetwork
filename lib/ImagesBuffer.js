export default class ImagesBuffer {
    /**
     * @param {Buffer} buffer
     * @returns {ImagesBuffer}
     */
    static fromBuffer(buffer) {
        const numberOfImages = buffer.readUint8(0) << 8 | buffer.readUint8(1);
        const size = buffer.readUint8(2);

        const imagesBuffer = new ImagesBuffer(numberOfImages, size);

        for (let i = 0; i < numberOfImages; i++) {
            const image = new Uint8Array(size * size);

            for (let j = 3 + i * size * size, k = 0; k < size * size; j++, k++) {
                image[k] = buffer.readUint8(j);
            }

            imagesBuffer.images.push(image);
        }

        return imagesBuffer;
    }

    constructor(numberOfImages, size) {
        this.numberOfImages = numberOfImages;
        this.size = size;
        this.images = [];
    }

    /**
     * @returns {Buffer}
     */
    toBuffer() {
        const buffer = Buffer.alloc(3 + this.numberOfImages * this.size * this.size);
        buffer.writeUint8(this.numberOfImages >> 8, 0);
        buffer.writeUint8(this.numberOfImages & 0xFF, 1);
        buffer.writeUint8(this.size, 2);

        for (let i = 0; i < this.numberOfImages; i++) {
            for (let j = 0; j < this.size * this.size; j++) {
                buffer.writeUint8(this.images[i][j], 3 + i * this.size * this.size + j);
            }
        }

        return buffer;
    }
}