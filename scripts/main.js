import {Game} from "/scripts/game.js";

const canvasTetris = document.getElementById("canvas-tetris");
const canvasNext = document.getElementById("canvas-next");
const canvasHold = document.getElementById("canvas-hold");
const score = document.getElementById("score");
const menu = document.getElementById("menu");
const btnMenu = document.getElementById("btn-start");
const levelDisplay = document.querySelector(".canvas1"); // Elemento para mostrar el nivel

const rows = 20;
const cols = 10;
const cellSize = 26;
const space = 2;

const game = new Game(canvasTetris,rows,cols,cellSize,space,canvasNext,canvasHold);

let linesCleared = 0; // Contador de líneas completadas
let level = 1; // Nivel inicial
const maxLevel = 15; // Nivel máximo
let dropSpeed = 1000; // Velocidad de caída inicial en milisegundos

const audio = new Audio('/audio/retro-game.mp3');
audio.loop = true; // Habilitar bucle
audio.volume = 0.5; // Ajusta el volumen según sea necesario

// Iniciar la música al comenzar el juego
function startMusic() {
    audio.play();
}

// Detener la música al finalizar el juego
function stopMusic() {
    audio.pause();
    audio.currentTime = 0; // Reiniciar la música
}

// Lógica para el botón de audio
const audioToggle = document.getElementById("audio-toggle");
const audioLabel = document.getElementById("audio-label");


audioToggle.checked = false; // Cambiar a OFF
stopMusic(); // Detener la música al cargar el juego


audioToggle.addEventListener("change", () => {
    if (audioToggle.checked) {
        startMusic(); 
    } else {
        stopMusic(); 
    }
});

if (audioToggle.checked) {
    startMusic(); 
} else {
    stopMusic(); 
}

function update() {
    if(game.gameOver) {
        stopMusic(); // Detener música al finalizar el juego
        menu.style.display = "flex";
    } else {
        game.update();
        score.innerHTML = game.score;
    }
    requestAnimationFrame(update);
}

btnMenu.addEventListener("click", () => {
    setTimeout(() => {
        menu.style.display = "none";
        game.reset(); // Reiniciar el juego
        game.level = 0; // Establecer el nivel a 0
        game.score = 0; // Reiniciar la puntuación
        levelDisplay.innerText = game.level; // Actualizar la visualización del nivel
        audioToggle.checked = false; 
        stopMusic(); 
    }, 200);
});

document.getElementById("btn-pause").addEventListener("click", () => {
    game.pauseGame();
    stopMusic(); 
    document.getElementById("btn-pause").style.display = "none";
    document.getElementById("btn-resume").style.display = "block";
});

document.getElementById("btn-resume").addEventListener("click", () => {
    game.resumeGame();
    if (audioToggle.checked) {
        startMusic();
    }
    document.getElementById("btn-resume").style.display = "none";
    document.getElementById("btn-pause").style.display = "block";
});

window.addEventListener("keydown", (evt) => {
    if (evt.key === "r" || evt.key === "R") {
        if (game.isPaused) {
            game.resumeGame();
            audioToggle.checked = true; 
            audioLabel.innerText = "OFF";
            startMusic(); 
        }
    }
});

// Reiniciar música 6 segundos antes de que termine
audio.addEventListener('timeupdate', () => {
    if (audio.currentTime >= audio.duration - 6 && !audio.paused) {
        audio.currentTime = 0; // Reiniciar la música
        audio.play(); // Reanudar la música
    }
});

update();