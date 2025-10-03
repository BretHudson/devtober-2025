import { Game } from 'canvas-lord/core/engine';
import { Scene } from 'canvas-lord/core/scene';
import { Player } from './entities/player';
import { Vec2 } from 'canvas-lord/math';
import { Enemy } from './entities/enemy';

const game = new Game('game', {
	fps: 60,
	backgroundColor: '#323232',
});

const createPattern = () => {
	const offscreenCanvas = new OffscreenCanvas(128, 128);
	const offscreenCtx = offscreenCanvas.getContext('2d');
	if (!offscreenCtx) throw new Error('could not create offscreen canvas');
	offscreenCtx.fillStyle = '#4056aa';
	offscreenCtx.fillRect(0, 0, 128, 128);
	for (let x = 128; x >= 0; x -= 32) {
		offscreenCtx.fillStyle = x === 0 ? '#6179CF' : '#5168BD';
		offscreenCtx.fillRect(x, 0, 1, 128);
		offscreenCtx.fillRect(0, x, 128, 1);
	}
	const pattern = offscreenCtx.createPattern(offscreenCanvas, 'repeat');
	if (!pattern) throw new Error('pattern could not be created');
	return pattern;
};

const scene = new Scene();

const center = new Vec2(game.width, game.height).invScale(2);
const fourth = center.invScale(2);

scene.addEntity(new Player(center.x, center.y));

scene.addEntity(new Enemy(center.x - fourth.x, center.y - fourth.y));
scene.addEntity(new Enemy(center.x - fourth.x, center.y + fourth.y));
scene.addEntity(new Enemy(center.x + fourth.x, center.y + fourth.y));
scene.addEntity(new Enemy(center.x + fourth.x, center.y - fourth.y));

const pattern = createPattern();
scene.onRender.add((ctx) => {
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});
game.pushScene(scene);

game.start();
