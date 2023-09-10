let boardWidth = 500;
let boardHeight = 500;
let context;

// Players
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 10;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

// Ball
let ballRadius = 5;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    radius: ballRadius,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

// Blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

let blockHitCounts = {};

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    requestAnimationFrame(update);

    // Add a mousemove event listener to control the player's paddle
    document.addEventListener("mousemove", movePlayerWithMouse);

    // Add a keydown event listener to restart the game with the spacebar
    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && gameOver) {
            resetGame();
        }
    });

    // Call createBlocks only once at the beginning
    createBlocks();
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = "white";
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.y + ball.radius >= player.y &&
        ball.y - ball.radius <= player.y + player.height &&
        ball.x + ball.radius >= player.x &&
        ball.x - ball.radius <= player.x + player.width) {
        if (ball.velocityY > 0) {
            ball.velocityY *= -1;
        }
    }

    if (ball.y - ball.radius <= 0) {
        ball.velocityY *= -1;
    } else if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= boardWidth) {
        ball.velocityX *= -1;
    } else if (ball.y + ball.radius >= boardHeight) {
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
    }

    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (circleRectCollision(ball, block)) {
                if (!blockHitCounts[i]) {
                    blockHitCounts[i] = 1;
                } else {
                    blockHitCounts[i] += 1;
                }
                if (blockHitCounts[i] === 3) {
                    block.break = true;
                    // Adjust ball velocity based on collision direction
                    const dx = ball.x - Math.max(block.x, Math.min(ball.x, block.x + block.width));
                    const dy = ball.y - Math.max(block.y, Math.min(ball.y, block.y + block.height));
                    if (Math.abs(dx) < Math.abs(dy)) {
                        ball.velocityY *= -1;
                    } else {
                        ball.velocityX *= -1;
                    }
                    score += 100;
                    blockCount -= 1;
                } else {
                    ball.velocityY *= -1;
                }
            }

            context.fillStyle = getBlockColor(Math.floor(i / blockColumns));
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns;
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        //createBlocks();
    }

    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

// Function to check collision between a circle (ball) and a rectangle (block)
function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < (circle.radius * circle.radius);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayerWithMouse(e) {
    if (gameOver) {
        return;
    }
    const newPlayerX = e.clientX - board.getBoundingClientRect().left - playerWidth / 2;
    if (newPlayerX >= 0 && newPlayerX + playerWidth <= boardWidth) {
        player.x = newPlayerX;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.radius) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.radius) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

// Add a new function to check collision between the ball and a block
function ballCollision(ball, block) {
    return ball.x + ball.radius > block.x &&
        ball.x - ball.radius < block.x + block.width &&
        ball.y + ball.radius > block.y &&
        ball.y - ball.radius < block.y + block.height;
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        radius: ballRadius,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    blockHitCounts = {};
    createBlocks();
}

// Define block colors based on row
function getBlockColor(rowIndex) {
    if (rowIndex === 0) {
        return "green";
    } else if (rowIndex === 1) {
        return "skyblue";
    } else {
        return "orange";
    }
}