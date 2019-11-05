/*MD 
![](pictures/pong.png)
MD*/

import { pt } from "src/client/graphics.js"

class Paddle {
  constructor(parent, graphicRepresentation, startPosition, speed) {
    this.graphicRepresentation = graphicRepresentation;
    this.parent = parent;
    this.parent.appendChild(this.graphicRepresentation);
    this.position = startPosition;
    this.speed = speed;
    this.height = lively.getExtent(this.graphicRepresentation).y;
    this.width = lively.getExtent(this.graphicRepresentation).x;
  }

  draw() {
    lively.setPosition(this.graphicRepresentation, this.position);
  }

  stepUp() {
    this.position.y -= this.speed;
    if (this.position.y < 0) {
      this.position.y = 0;
    }
  }
  
  stepDown() {
    this.position.y += this.speed;
    if (this.position.y + this.height > lively.getExtent(this.parent).y) {
      this.position.y = lively.getExtent(this.parent).y - this.height;
    }
  }
}

class Ball {
  constructor(parent, graphicRepresentation) {
    this.graphicRepresentation = graphicRepresentation;
    this.parent = parent;
    this.parent.appendChild(this.graphicRepresentation);
    this.position = pt(
      lively.getExtent(this.parent).x / 2,
      lively.getExtent(this.parent).y / 2
    );
    this.speed = pt(0, 0);
    this.height = lively.getExtent(this.graphicRepresentation).y;
    this.width = lively.getExtent(this.graphicRepresentation).x;
    this.resetSpeed();
  }

  resetPosition() {
    this.position = pt(
      lively.getExtent(this.parent).x / 2,
      lively.getExtent(this.parent).y / 2
    );
  }

  resetSpeed() {
    let baseSpeeds = [-1, 1];
    this.speed = pt(
      baseSpeeds[Math.floor(Math.random() * baseSpeeds.length)],
      baseSpeeds[Math.floor(Math.random() * baseSpeeds.length)]
    );
  }

  draw() {
    lively.setPosition(this.graphicRepresentation, this.position);
  }

  step() {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  }

  bounceX() {
    this.speed.x *= -1;
  }

  bounceY() {
    this.speed.y *= -1;
  }

  increaseSpeed() {
    this.speed.x *= 1.1;
    this.speed.y *= 1.1;
  }
}

export class Game {
  constructor(playfield, ballGraphic, paddleGraphics, scoreBoard, parentElement) {
    this.playfield = playfield;
    this.bounds = lively.getExtent(playfield);

    this.ball = new Ball(this.playfield, ballGraphic);

    let paddleLeft = new Paddle(playfield, paddleGraphics[0], pt(20, 20), 20);
    let paddleRight = new Paddle(playfield, paddleGraphics[1], pt(this.bounds.x - 30, 20), 20);
    this.paddles = [paddleLeft, paddleRight];

    this.score = [0, 0];

    this.scoreBoard = scoreBoard;
    this.playfield.appendChild(scoreBoard);
    lively.setPosition(this.scoreBoard, pt((this.bounds.x - lively.getExtent(this.scoreBoard).x) / 2, 0));
    this.updateScoreBoard();

    parentElement.setAttribute("tabindex", 0);
    lively.addEventListener("pong", parentElement, "keydown", (event) => { this.handleKeyDown(event) });

  }

  handleKeyDown(event) {
    let key = event.keyCode;
    event.preventDefault();
    event.stopPropagation();

    switch (key) {
      case 87: //w
        this.paddles[0].stepUp();
        break;
      case 83: //s
        this.paddles[0].stepDown();
        break;
      case 38: //arrow up
        this.paddles[1].stepUp();
        break;
      case 40: //arrow down
        this.paddles[1].stepDown();
        break;
    }
  }

  ballHitsRightPaddle() {
    return this.ball.position.x + this.ball.width > this.paddles[1].position.x &&
      this.ball.position.y > this.paddles[1].position.y &&
      this.ball.position.y + this.ball.height < this.paddles[1].position.y + this.paddles[1].height;
  }

  ballHitsLeftPaddle() {
    return this.ball.position.x < this.paddles[0].position.x + this.paddles[0].width &&
      this.ball.position.y > this.paddles[0].position.y &&
      this.ball.position.y + this.ball.height < this.paddles[0].position.y + this.paddles[0].height;
  }

  ballHitsLeftSide() {
    return this.ball.position.x < 0;
  }

  ballHitsRightSide() {
    return this.ball.position.x + this.ball.width > this.bounds.x;
  }

  ballHitsTopSide() {
    return this.ball.position.y < 0;
  }

  ballHitsBottomSide() {
    return this.ball.position.y + this.ball.height > this.bounds.y;
  }

  updateScoreBoard() {
    this.scoreBoard.innerHTML = this.score[0] + " : " + this.score[1];
  }

  nextRound() {
    this.ball.resetPosition();
    this.ball.resetSpeed();
    this.updateScoreBoard();
  }

  step() {
    this.ball.draw();
    this.paddles[0].draw();
    this.paddles[1].draw();

    if (this.ballHitsLeftPaddle() || this.ballHitsRightPaddle()) {
      this.ball.bounceX();
      this.ball.increaseSpeed();
    } else if (this.ballHitsTopSide() || this.ballHitsBottomSide()) {
      this.ball.bounceY();
    } else if (this.ballHitsLeftSide()) {
      this.score[1] += 1;
      this.nextRound()
    } else if (this.ballHitsRightSide()) {
      this.score[0] += 1;
      this.nextRound();
    }

    this.ball.step();
  }

}
