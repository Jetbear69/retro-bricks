import { TetrominosBag } from "/scripts/tetromino.js";
import { BoardTetris,BoardNext,BoardHold } from "/scripts/boardTetris.js";
export class Game{
    constructor(canvas,rows,cols,cellSize,space,canvasNext,canvasHold){
        this.boardTetris = new BoardTetris(canvas, rows, cols, cellSize, space);
        this.tetrominosBag = new TetrominosBag(canvas,cellSize);
        this.currentTetromino = this.tetrominosBag.nextTetromino();
        this.keyboard();
        this.keys = {up:false,down:false};

        this.lastTime = 0;
        this.lastTime2 = 0;

        this.next = new BoardNext(canvasNext,8,4,cellSize,space,this.tetrominosBag.getThreeNextTetrominos());
        this.hold = new BoardHold(canvasHold,2,4,cellSize,space);
        this.canHold = true;

        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.pointsPerLevel = 1000;
        this.speed = 1000;
        this.isPaused = false;
    }
    update(){
        if (this.isPaused) return;
        let currentTime = Date.now();
        let deltaTime = currentTime - this.lastTime;
        let deltaTime2 = currentTime - this.lastTime2;

        if(deltaTime >= this.speed){
            this.autoMoveTetrominoDown();
            this.lastTime = currentTime;
        }
        if(deltaTime2 >= 50){
            this.boardTetris.draw();
            this.currentTetromino.draw(this.boardTetris);

            this.next.draw2();
            this.hold.draw2();

            if(this.keys.down){
                this.moveTetrominoDown();
            }
            

            this.lastTime2 = currentTime;
        }  
    }
    autoMoveTetrominoDown(){
        this.currentTetromino.move(1,0);
        if(this.blockedTetromino()) {
            this.currentTetromino.move(-1,0);
            this.placeTetromino();
        }
    }
    blockedTetromino(){
        const tetrominoPositions = this.currentTetromino.currentPositions();
        for(let i = 0; i <tetrominoPositions.length; i++){
            if(!this.boardTetris.isEmpty(tetrominoPositions[i].row,tetrominoPositions[i].column)) {
                return true;
            }
        }
        return false;
    }
    moveTetrominoLeft(){
        this.currentTetromino.move(0,-1);
        if(this.blockedTetromino()) {
            this.currentTetromino.move(0,1);
        }
    }
    moveTetrominoRight(){
        this.currentTetromino.move(0,1);
        if(this.blockedTetromino()) {
            this.currentTetromino.move(0,-1);
        }
    }
    moveTetrominoDown(){
        this.currentTetromino.move(1,0);
        if(this.blockedTetromino()) {
            this.currentTetromino.move(-1,0);
        }
    }
    rotationTetrominoCW(){
        this.currentTetromino.rotation++;
        if(this.currentTetromino.rotation > this.currentTetromino.shapes.length-1) {
            this.currentTetromino.rotation = 0;
        }
        if(this.blockedTetromino()) {
            this.rotationTetrominoCCW();
        }
    }
    rotationTetrominoCCW(){
        this.currentTetromino.rotation--;
        if(this.currentTetromino.rotation < 0) {
            this.currentTetromino.rotation = this.currentTetromino.shapes.length - 1;
        }
        if(this.blockedTetromino()){
            this.rotationTetrominoCW();
        }
    }
    placeTetromino(){
        const tetrominoPositions = this.currentTetromino.currentPositions();
        for(let i = 0; i < tetrominoPositions.length; i++) {
            this.boardTetris.matriz
                [tetrominoPositions[i].row]
                [tetrominoPositions[i].column] = this.currentTetromino.id;
        }

        if (this.blockedTetromino()) {
            this.currentTetromino.move(-1, 0);
        }

        this.currentTetromino.reset();

        this.score += this.boardTetris.clearFullRows() * 100;

        if (this.score >= this.level * this.pointsPerLevel && this.level < 15) {
            this.level++;
            this.speed = Math.max(100, this.speed - 100);
            this.updateLevelDisplay();
        }

        if(this.boardTetris.gameOver()) {
            setTimeout(()=>{
                this.gameOver = true;
                document.getElementById("menu-title").innerText = "GAME OVER";
                document.getElementById("btn-start").style.display = "block";
                document.getElementById("btn-pause").style.display = "none";
                document.getElementById("menu").style.display = "flex";
            }, 500);
            return true;
        } else {
            this.currentTetromino = this.tetrominosBag.nextTetromino();
            this.next.listTetrominos = this.tetrominosBag.getThreeNextTetrominos();
            this.next.updateMatriz();
            this.canHold = true;
        }
    }
    holdTetromino(){
        if(!this.canHold) return;
        if(this.hold.tetromino === null) {
            this.hold.tetromino = this.currentTetromino;
            this.currentTetromino = this.tetrominosBag.nextTetromino();
        }else{
            [this.currentTetromino, this.hold.tetromino] = [this.hold.tetromino, this.currentTetromino];
        }
        this.hold.updateMatriz();
        this.canHold = false;
    }
    reset(){
        this.gameOver = false;
        this.boardTetris.restartMatriz();
        this.score = 0;
        this.hold.tetromino = null;
        this.tetrominosBag.reset();
        this.currentTetromino = this.tetrominosBag.nextTetromino();
        this.hold.drawBackground();

        this.canHold = true;
        this.hold.restartMatriz();
        this.next.restartMatriz();
        this.next.listTetrominos = this.tetrominosBag.getThreeNextTetrominos();
        this.next.updateMatriz();
        this.next.draw2();
    }
    keyboard(){
        window.addEventListener("keydown",(evt)=>{
            if(evt.key === "ArrowLeft") {
                this.moveTetrominoLeft();
            }
            if(evt.key === "ArrowRight") {
                this.moveTetrominoRight();
            }
            if(evt.key === "ArrowUp" && !this.keys.up) {
                this.rotationTetrominoCCW();
                this.keys.up = true;
            }
            if(evt.key === "ArrowDown") {
                this.keys.down = true;
            }
            if(evt.key === "c" || evt.key === "C") {
                this.holdTetromino();
            }
            if(evt.key === "p" || evt.key === "P") {
                this.pauseGame();
                document.getElementById("menu-title").innerText = "PAUSED";
                document.getElementById("btn-start").style.display = "none";
                document.getElementById("btn-pause").style.display = "none";
                document.getElementById("btn-resume").style.display = "block";
                document.getElementById("menu").style.display = "flex";
            }
        });
        window.addEventListener("keyup",(evt)=>{
            if(evt.key === "ArrowUp") {
                this.keys.up = false;
            }
            if(evt.key === "ArrowDown") {
                this.keys.down = false;
            }
        });
        window.addEventListener("click",(evt)=>{
            if(this.gameOver) {
                this.dropBlock();
            }
        });
    }
    pauseGame() {
        this.isPaused = true;
    }
    resumeGame() {
        this.isPaused = false;
        document.getElementById("menu").style.display = "none";
    }
    updateLevelDisplay() {
        document.querySelector(".canvas1").innerText = this.level;
    }
}