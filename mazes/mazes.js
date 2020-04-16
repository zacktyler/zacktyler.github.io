var canvas = document.querySelector('canvas');
var pen = canvas.getContext('2d');
var rect = canvas.parentNode.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

var paused = false;
var running = false;
var solving = false;
var setWindow = document.querySelector('#settings');
var inputs = setWindow.querySelectorAll('.set');
var newButton = setWindow.querySelector('#new');
var solveButton = setWindow.querySelector('#solve');
var slider = setWindow.querySelector('#myRange');
var settings = [];
getAllSettings();

function getAllSettings() {
    settings = [];
    for(let input of inputs) {
        settings.push(input.value);
    }
}

window.addEventListener('resize', function () {
    rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    reset();
});

newButton.addEventListener('click', function () {
    getAllSettings();
    //toggleSettings();
    reset();
});

solveButton.addEventListener('click', function () {
    startSolve();
    //toggleSettings();
});

slider.addEventListener('input', function () {
    settings[0] = slider.value;
});

class Cell {
    constructor(r, c) {
        this.r = r;
        this.c = c;
        this.visited = false;
        this.root = this;
        this.branches = [];
        this.paths = [];
    }

    setRootTo(root) {
        this.root = root;
        root.branches.push(this);
        for (let branch of this.branches) {
            branch.setRootTo(root);
        }
        this.branches = [];
    }

    connectTo(other) {
        this.paths.push(other);
        other.paths.push(this);
    }
}

class Edge {
    constructor(cell1, cell2) {
        this.cell1 = cell1;
        this.cell2 = cell2;
    }

    removeEdge() {
        if (this.cell1.root === this.cell2.root) {
            return false;
        } else {
            let root1 = this.cell1.root;
            let root2 = this.cell2.root;
            if (root1.branches.length > root2.branches.length) {
                root2.setRootTo(root1);
            } else {
                root1.setRootTo(root2);
            }
            return true;
        }
    }
}

class Maze {
    constructor(width, height, interval) {
        //Structure
        this.rows = Math.floor(height / interval);
        this.cols = Math.floor(width / interval);

        //Visuals
        this.halfWidth = Math.floor(width/2);
        this.halfHeight = Math.floor(height/2);
        this.rInc = interval;
        this.cInc = interval;
        this.thickness = Math.floor(interval * (2 / 3));

        //More Structure
        this.activeCells = [];
        this.cells = [];
        for (let r = 0 ; r < this.rows ; r++) {
            let row = [];
            for (let c = 0 ; c < this.cols ; c++) {
                row.push(new Cell(r, c));
            }
            this.cells.push(row);
        }
        //Edges
        this.edges = [];
        for (let r = 0 ; r < this.rows - 1 ; r++) {
            for (let c = 0 ; c < this.cols ; c++) {
                this.edges.push(new Edge(this.cells[r][c], this.cells[r + 1][c]));
            }
        }
        for (let r = 0 ; r < this.rows ; r++) {
            for (let c = 0 ; c < this.cols - 1 ; c++) {
                this.edges.push(new Edge(this.cells[r][c], this.cells[r][c + 1]));
            }
        }
    }

    //Checks whether a given cell has been visited
    cellVisited(r, c) {
        return this.cells[r][c].visited;
    }

    //Checks whether a given cell is valid
    cellValid(r, c) {
        let validRow = (-1 < r && r < this.rows);
        let validCol = (-1 < c && c < this.cols);
        return validRow && validCol;
    }

    //Checks for a possible neighbor in the given direction
    checkDirection(cellNum, dir) {
        let activeCell = this.getActiveCell(cellNum);
        let r = activeCell.r;
        let c = activeCell.c;
        r -= Math.round(Math.sin((Math.PI / 2) * dir));
        c += Math.round(Math.cos((Math.PI / 2) * dir));
        if (this.cellValid(r, c) && !this.cellVisited(r, c)) {
            return this.cells[r][c];
        } else {
            return false;
        }
    }

    getRandomCell() {
        let r = Math.floor(Math.random() * this.rows);
        let c = Math.floor(Math.random() * this.cols);
        return this.cells[r][c];
    }

    //Pushes a given Cell to the activeCells stack
    pushActiveCell(cell) {
        cell.visited = true;
        this.activeCells.push(cell);
    }
    
    //Removes and returns the given Cell from the activeCells array
    removeActiveCell(n) {
        return this.activeCells.splice(n, 1);
    }

    //Returns the given Cell from the activeCells array
    getActiveCell(n) {
        return this.activeCells[n];
    }

    drawPath(color, r1, c1, r2, c2) {
        pen.fillStyle = color;
        let x = this.halfWidth + Math.floor((Math.min(c1, c2) + 0.5 - this.cols / 2) * this.cInc - this.thickness / 2);
        let y = this.halfHeight + Math.floor((Math.min(r1, r2) + 0.5 - this.rows / 2) * this.rInc - this.thickness / 2);
        let w = Math.abs(c2 - c1) * this.cInc + this.thickness;
        let h = Math.abs(r2 - r1) * this.rInc + this.thickness;
        pen.fillRect(x, y, w, h);
    }

    //Now for ALL THE ALGORITHMS
    acAlgorithms(last, both) {
        if (this.activeCells.length === 0) {
            this.pushActiveCell(this.getRandomCell());
        }
        let cellNum = 0;
        if (last) { //Choose the cell to start from
            cellNum = this.activeCells.length - 1;
        } else {
            cellNum = Math.floor(Math.random() * this.activeCells.length);
        }
        let neighbors = [];
        for (let theta = 0 ; theta < 4 ; theta++) {
            let testCell = this.checkDirection(cellNum, theta);
            if (testCell) {
                neighbors.push(testCell);
            }
        }
        if (neighbors.length > 0) {
            let rdmNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            let currCell = this.getActiveCell(cellNum);
            this.pushActiveCell(rdmNeighbor);
            if (last) {
                let color = (both) ? '#ffffff' : '#808080';
                this.drawPath(color, currCell.r, currCell.c, rdmNeighbor.r, rdmNeighbor.c);
            } else {
                this.drawPath('#ffffff', currCell.r, currCell.c, rdmNeighbor.r, rdmNeighbor.c);
            }
            currCell.connectTo(rdmNeighbor);
        } else {
            let lastCell = this.removeActiveCell(cellNum)[0];
            if (last && !both && this.activeCells.length > 0) {
                let currCell = this.getActiveCell(cellNum - 1);
                this.drawPath('#ffffff', currCell.r, currCell.c, lastCell.r, lastCell.c);
            }
        }
        if (this.activeCells.length === 0) {
            running = false;
        }
    }

    kruskalgorithm() {
        if (this.edges.length > 0) {
            let merged = false;
            do {
                let edgeNum = Math.floor(Math.random() * this.edges.length);
                let edge = this.edges[edgeNum];
                merged = edge.removeEdge();
                if (merged) {
                    let cell1 = edge.cell1;
                    let cell2 = edge.cell2;
                    this.drawPath('#ffffff', cell1.r, cell1.c, cell2.r, cell2.c);
                    cell1.connectTo(cell2);
                }
                this.edges.splice(edgeNum, 1);
            } while (!merged && this.edges.length > 0);
        } else {
            running = false;
        }
    }

    solveAlgorithm() {
        if (this.activeCells.length === 0) {
            this.pushActiveCell(this.cells[0][0]);
        }
        let lastCell = this.getActiveCell(this.activeCells.length - 1);
        let possibleN = [];
        for(let neighbor of lastCell.paths) {
            if (!neighbor.visited) {
                possibleN.push(neighbor);
            }
        }
        if (possibleN.length > 0) {
            let rdmNeighbor = possibleN[Math.floor(Math.random() * possibleN.length)];
            this.drawPath('#ff0000', lastCell.r, lastCell.c, rdmNeighbor.r, rdmNeighbor.c);
            this.pushActiveCell(rdmNeighbor);
            if (rdmNeighbor.c === this.cols - 1 && rdmNeighbor.r === this.rows - 1) {
                running = false;
            }
        } else {
            this.removeActiveCell(this.activeCells.length - 1);
            let newLast = this.getActiveCell(this.activeCells.length - 1);
            this.drawPath('#ffffff', lastCell.r, lastCell.c, newLast.r, newLast.c);
        }
    }
}

var algorithms = {};
algorithms['RB'] = function () { maze.acAlgorithms(true, false); }
algorithms['PA'] = function () { maze.acAlgorithms(false, false); }
algorithms['PR'] = function () { maze.acAlgorithms(Math.random() > 0.25, true); }
algorithms['KA'] = function () { maze.kruskalgorithm(); }

var maze = {};
function reset() {
    solving = false;
    getAllSettings();
    pen.clearRect(0, 0, canvas.width, canvas.height);
    maze = new Maze(canvas.width, canvas.height, settings[1]);
    if (!running) {
        running = true;
        solveButton.disabled = true;
        step();
    }
}

function startSolve() {
    for(let cellRow of maze.cells) {
        for(let cell of cellRow) {
            cell.visited = false;
        }
    }
    solving = true;
    running = true;
    solveButton.disabled = true;
    step();
}

function step() {
    if (!paused) {
        for (let i = 0 ; i < Math.pow(10, settings[0] / 10) ; i++) {
            if (solving) {
                maze.solveAlgorithm();
            } else {
                algorithms[settings[2]]();
            }
            if (!running) {
                solveButton.disabled = solving;
                return;
            }
        }
    }
    requestAnimationFrame(step);
}

reset();