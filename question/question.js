var canvas = document.querySelector('canvas');
var pen = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = {
    x: undefined,
    y: undefined
};

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('touchstart', function (e) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    if (i < bubbles.length) {
        bubbles[i].checkMouse();
    }
}); 

window.addEventListener('click', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (i < bubbles.length) {
        bubbles[i].checkMouse();
    }
});

function random(min, max) {
    let t = Math.random();
    return Math.floor(min * (1 - t) + max * t);
}

function clip(pos, vel, min, max) {
    if (pos < min) {
        return { pos: min, vel: -vel };
    } else if (pos > max) {
        return { pos: max, vel: -vel };
    } else {
        return { pos: pos, vel: vel };
    }
}

class Bubble {
    constructor(text) {
        this.r = 90;
        this.x = random(this.r, canvas.width - this.r);
        this.y = random(this.r, canvas.height - this.r);
        let theta = random(0, 360) * (2 * Math.PI) / 360;
        let magnitude = 3;
        this.xV = magnitude * Math.cos(theta);
        this.yV = magnitude * Math.sin(theta);
        this.msg = text;
        this.color = 'hsla(' + random(60, 260) + ', 100%, 50%, 0.35)';
    }

    draw() {
        this.x += this.xV;
        this.y += this.yV;
        let newX = clip(this.x, this.xV, this.r, canvas.width - this.r);
        let newY = clip(this.y, this.yV, this.r, canvas.height - this.r);
        this.x = newX.pos;
        this.y = newY.pos;
        this.xV = newX.vel;
        this.yV = newY.vel;
        pen.fillStyle = this.color;
        pen.beginPath();
        pen.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        pen.closePath();
        pen.fill();
        pen.fillStyle = '#000';
        pen.font = '42px Righteous';
        pen.textAlign = 'center';
        pen.fillText(this.msg, this.x, this.y + 10);
    }

    checkMouse() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = dx * dx + dy * dy;
        if (dist < this.r * this.r) {
            i++;
        }
    }
}

let message = 'Hey Mary, will you go to Mormon Prom with me? Email me at zack.tyler.938@gmail.com :)';
let messages = message.split(' ');

let bubbles = [];
bubbles.push(new Bubble('Click me!'));
for(let msg of messages) {
    bubbles.push(new Bubble(msg));
}

let extras = [];
for (let i = 0 ; i < 10 ; i++) {
    extras.push(new Bubble(''));
}

let i = 0;
function animate() {
    pen.clearRect(0, 0, canvas.width, canvas.height);
    for(let bubble of extras) {
        bubble.draw();
    }
    if (i < bubbles.length) {
        bubbles[i].draw();
    }
    requestAnimationFrame(animate);
}
animate();