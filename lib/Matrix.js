export default class Matrix {
    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((_, i) => arr[i]);
    }

    static add(a, b) {
        return new Matrix(a.rows, a.columns).map((_, i, j) => a.data[i][j] + b.data[i][j]);
    }

    static subtract(a, b) {
        return new Matrix(a.rows, a.columns).map((_, i, j) => a.data[i][j] - b.data[i][j]);
    }

    static multiply(a, b) {
        return new Matrix(a.rows, b.columns).map((_, i, j) => {
            return a.data[i].reduce((sum, elm, k) => sum + elm * b.data[k][j], 0);
        });
    }

    static transpose(matrix) {
        return new Matrix(matrix.columns, matrix.rows).map((_, i, j) => matrix.data[j][i]);
    }

    static map(matrix, callback) {
        return new Matrix(matrix.rows, matrix.columns).map((elm, i, j) => callback(matrix.data[i][j], i, j));
    }

    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.data = new Array(rows).fill(0).map(() => new Array(columns).fill(0));
    }

    add(n) {
        if (n instanceof Matrix) {
            this.data = this.data.map((row, i) => row.map((elm, j) => elm + n.data[i][j]));
        } else {
            this.data = this.data.map(row => row.map(elm => elm + n));
        }
        return this;
    }

    subtract(n) {
        if (n instanceof Matrix) {
            this.data = this.data.map((row, i) => row.map((elm, j) => elm - n.data[i][j]));
        } else {
            this.data = this.data.map(row => row.map(elm => elm - n));
        }
        return this;
    }

    multiply(n) {
        if (n instanceof Matrix) {
            this.data = this.data.map((row, i) => row.map((elm, j) => elm * n.data[i][j]));
        } else {
            this.data = this.data.map(row => row.map(elm => elm * n));
        }
        return this;
    }

    map(callback) {
        this.data = this.data.map((row, i) => row.map((elm, j) => callback(elm, i, j)));
        return this;
    }

    toArray() {
        return this.data.reduce((arr, row) => arr.concat(row), []);
    }

    print() {
        console.table(this.data);
        return this;
    }

    randomize() {
        return this.map(() => Math.random() * 2 - 1);
    }
}