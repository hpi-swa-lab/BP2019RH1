# Diese Seite dient zur Implementierung eines einfachen Pong-Spiels

Der/Die linke SpielerIn steuert mit den Tasten `w` und `s`. 
Der/die rechte SpielerIn steuert mit den Pfeiltasten.

<script>
import {Game} from "./pong.js";
</script>

<style>
.playfield {
  position: relative;
  width: 600px;
  height: 400px;
  background-color: lightGray;
  border-color: black;
}

.ball {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: Red;
  border-color: black;
}

.paddle {
  width: 10px;
  height: 100px;
  background-color: Purple;
}

.scoreBoard {
  width: 50px;
  height: 20px;
  background-color: lightGreen;
  text-align: center;
}
</style>

<div class="playfield" id="playfield"></div>

<script>

let playfield = lively.query(this, "#playfield");
let ball = <div class="ball" id="ball"></div>;
let paddleLeft = <div class="paddle" id="paddleLeft"></div>;
let paddleRight = <div class="paddle" id="paddleRight"></div>;
let scoreBoard = <div class="scoreBoard" id="scoreBoard"></div>;

let game = new Game(playfield, ball, [paddleLeft, paddleRight], scoreBoard, this.parentElement);

(async () => {
  while(lively.isInBody(playfield)) {
    game.step();
    await lively.sleep(10);
  }
})()
""
</script>