const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const nextLetterButton = document.getElementById('nextLetter');
const showExampleButton = document.createElement('button');
showExampleButton.textContent = 'Show Example';
document.getElementById('game-container').appendChild(showExampleButton);

let currentLetter = 'a';
let userPath = [];
let examplePath = [];
let isDrawing = false;
let showingExample = false;

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.6;

const letterPaths = {
    'a': [
        [[0.2, 0.8], [0.5, 0.2], [0.8, 0.8]],
        [[0.35, 0.5], [0.65, 0.5]]
    ],
    'b': [
        [[0.2, 0.8], [0.2, 0.2]],
        [[0.2, 0.2], [0.6, 0.2], [0.8, 0.4], [0.6, 0.6], [0.2, 0.6]],
        [[0.2, 0.6], [0.6, 0.6], [0.8, 0.8], [0.6, 1.0], [0.2, 1.0]]
    ],
    // 다른 알파벳들의 경로를 여기에 추가...
};

function drawLetter(color = 'rgba(0, 0, 0, 0.2)') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${canvas.height * 0.8}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentLetter, canvas.width / 2, canvas.height / 2);
}

function startDrawing(e) {
    if (showingExample) return;
    isDrawing = true;
    userPath = [];
    draw(e);
}

function stopDrawing() {
    if (showingExample) return;
    isDrawing = false;
    calculateAccuracy();
}

function draw(e) {
    if (!isDrawing || showingExample) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    userPath.push([x, y]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLetter();

    const pathData = perfectFreehand.getStroke(userPath);
    ctx.beginPath();
    ctx.moveTo(pathData[0][0], pathData[0][1]);
    for (let i = 1; i < pathData.length; i++) {
        ctx.lineTo(pathData[i][0], pathData[i][1]);
    }
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fill();
}

function calculateAccuracy() {
    // 실제 정확도 계산 로직을 여기에 구현해야 합니다.
    // 이 예시에서는 간단히 랜덤한 정확도를 반환합니다.
    const accuracy = Math.floor(Math.random() * 101);
    scoreElement.textContent = `Accuracy: ${accuracy}%`;
}

function nextLetter() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const currentIndex = alphabet.indexOf(currentLetter);
    currentLetter = alphabet[(currentIndex + 1) % 26];
    userPath = [];
    examplePath = [];
    drawLetter();
    scoreElement.textContent = 'Accuracy: 0%';
}

function showExample() {
    showingExample = true;
    examplePath = [];
    const paths = letterPaths[currentLetter];
    let currentPathIndex = 0;
    let currentPointIndex = 0;

    function drawNextSegment() {
        if (currentPathIndex >= paths.length) {
            showingExample = false;
            drawLetter();
            return;
        }

        const currentPath = paths[currentPathIndex];
        const startPoint = currentPath[currentPointIndex];
        const endPoint = currentPath[currentPointIndex + 1];

        if (!endPoint) {
            currentPathIndex++;
            currentPointIndex = 0;
            setTimeout(drawNextSegment, 500);
            return;
        }

        const startX = startPoint[0] * canvas.width;
        const startY = startPoint[1] * canvas.height;
        const endX = endPoint[0] * canvas.width;
        const endY = endPoint[1] * canvas.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLetter('rgba(0, 255, 0, 0.5)');

        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 15 * Math.cos(angle - Math.PI / 6), endY - 15 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 15 * Math.cos(angle + Math.PI / 6), endY - 15 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fill();

        currentPointIndex++;
        setTimeout(drawNextSegment, 500);
    }

    drawNextSegment();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
nextLetterButton.addEventListener('click', nextLetter);
showExampleButton.addEventListener('click', showExample);

drawLetter();

// Service Worker 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}