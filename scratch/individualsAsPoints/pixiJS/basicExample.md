
<div class="world" id="world"></div>

<script>

import * as PIXI from 'src/external/pixi.min.js';

const app = new PIXI.Application({width: 1000, height: 1000, backgroundColor: 0x1099bb });

let world = lively.query(this, "#world");
world.appendChild(app.view);

const bunny = PIXI.Sprite.from('https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/pixiJS/pictures/bunny.png');

bunny.anchor.set(0.5);

bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.stage.addChild(bunny);



const basicText = new PIXI.Text('Where is the bunny?!?');
basicText.x = 50;
basicText.y = 100;

app.stage.addChild(basicText);

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
});

const richText = new PIXI.Text('There is the bunny!', style);
richText.x = 50;
richText.y = 250;

app.stage.addChild(richText);
</script>