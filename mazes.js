var canvas = document.querySelector('canvas');
var pen = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var paused = false;
var running = false;
var setButton = document.querySelector('#setButton');
var settings = document.querySelector('#settings');
var sizeInput = settings.querySelector('#size');
var speedInput = settings.querySelector('#speed');
var algInput = settings.querySelector('#algorithm');
var size = sizeInput.value;
var speed = speedInput.value;
var algorithm = algInput.value;

setButton.addEventListener('click', function () {
    paused = !paused;
    if (paused) {
        settings.style.display = 'block';
    } else {
        settings.style.display = 'none';
        speed = speedInput.value;
        if (sizeInput.value !== size || algInput.value !== algorithm) {
            size = sizeInput.value;
            algorithm = algInput.value;
            reset();
        }
    }
});

class Cell {
    constructor(r, c) {
        this.r = r;
        this.c = c;
        this.visited = false;
        this.connectsTo = [];
    }

    //Connects two Cells, this one and another given one
    connectTo(other) {
        this.connectsTo.push(other);
        other.connectsTo.push(this);
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
    checkDirection(dir) {
        let activeCell = this.getLastActiveCell();
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

    //Pops and returns the last Cell in the activeCells stack
    popActiveCell() {
        return this.activeCells.pop();
    }

    //Returns the last Cell in the activeCells stack
    getLastActiveCell() {
        return this.activeCells[this.activeCells.length - 1];
    }

    drawPath(color, r1, c1, r2, c2) {
        pen.fillStyle = color;
        let x = this.halfWidth + Math.floor((Math.min(c1, c2) + 0.5 - this.cols / 2) * this.cInc - this.thickness / 2);
        let y = this.halfHeight + Math.floor((Math.min(r1, r2) + 0.5 - this.rows / 2) * this.rInc - this.thickness / 2);
        let w = Math.abs(c2 - c1) * this.cInc + this.thickness;
        let h = Math.abs(r2 - r1) * this.rInc + this.thickness;
        pen.fillRect(x, y, w, h);
    }
}

var maze = {};
function reset() {
    pen.clearRect(0, 0, canvas.width, canvas.height);
    maze = new Maze(canvas.width, canvas.height, size);
    maze.pushActiveCell(maze.getRandomCell());
    if (!running) {
        running = true;
        step();
    }
}

function step() {
    if (!paused) {
        for (let i = 0 ; i < speed ; i++) {
            let neighbors = [];
            for (let theta = 0 ; theta < 4 ; theta++) {
                let testCell = maze.checkDirection(theta);
                if (testCell) {
                    neighbors.push(testCell);
                }
            }
            if (neighbors.length > 0) {
                let rdmNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                let currCell = maze.getLastActiveCell();
                maze.pushActiveCell(rdmNeighbor);
                maze.drawPath('#808080', currCell.r, currCell.c, rdmNeighbor.r, rdmNeighbor.c);
            } else {
                let lastCell = maze.popActiveCell();
                if (maze.activeCells.length > 0) {
                    let currCell = maze.getLastActiveCell();
                    maze.drawPath('#ffffff', currCell.r, currCell.c, lastCell.r, lastCell.c);
                }
            }
            if (maze.activeCells.length === 0) {
                running = false;
                return;
            }
        }
    }
    requestAnimationFrame(step);
}

reset();