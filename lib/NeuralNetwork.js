import Matrix from "./Matrix.js";

export default class NeuralNetwork {
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static dsigmoid(y) {
        return y * (1 - y);
    }

    // Input node counts, array of hidden layer node counts, output node counts
    constructor(...nodes) {
        this.nodes = [nodes[0], ...nodes.slice(1, -1), nodes[nodes.length - 1]];
        this.weights = this.nodes.slice(1).map((n, i) => new Matrix(n, this.nodes[i]).randomize());
        this.biases = this.nodes.slice(1).map(n => new Matrix(n, 1).randomize());
    }

    predict(inputArray) {
        let inputs = Matrix.fromArray(inputArray);
        this.weights.forEach((w, i) => {
            inputs = Matrix.multiply(w, inputs).add(this.biases[i]).map(NeuralNetwork.sigmoid);
        });
        return inputs.toArray();
    }

    train(inputArray, targetArray) {
        let inputs = Matrix.fromArray(inputArray);
        const targets = Matrix.fromArray(targetArray);
        const outputs = [inputs];
        const weightedSums = [];

        this.weights.forEach((w, i) => {
            inputs = Matrix.multiply(w, inputs).add(this.biases[i]).map(NeuralNetwork.sigmoid);
            outputs.push(inputs);
            weightedSums.push(w);
        });

        let errors = Matrix.subtract(targets, inputs);
        let gradients = Matrix.map(outputs[outputs.length - 1], NeuralNetwork.dsigmoid).multiply(errors).multiply(.1);

        for (let i = this.weights.length - 1; i >= 0; i --) {
            const hiddenT = Matrix.transpose(outputs[i]);
            const weightDeltas = Matrix.multiply(gradients, hiddenT);
            this.weights[i].add(weightDeltas);
            this.biases[i].add(gradients);
            const whoT = Matrix.transpose(this.weights[i]);
            errors = Matrix.multiply(whoT, errors);
            gradients = Matrix.map(outputs[i], NeuralNetwork.dsigmoid).multiply(errors).multiply(.1);
        }
    }

    serialize() {
        return JSON.stringify(this);
    }

    fromSerialized(data) {
        const parsed = JSON.parse(data);
        this.nodes = parsed.nodes;
        this.weights = parsed.weights.map(w => Object.assign(new Matrix(1, 1), w));
        this.biases = parsed.biases.map(b => Object.assign(new Matrix(1, 1), b));
    }
}