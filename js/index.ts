import { Game } from 'canvas-lord/core/engine';
import { Scene } from 'canvas-lord/core/scene';
import { Vec2 } from 'canvas-lord/math';
import { Player } from '~/entities/player';
import { Enemy } from '~/entities/enemy';
import { Gun } from './entities/gun';
import { positionItemInRow } from './util/math';
import { machineGun, revolver, rifle } from './data/guns';

const game = new Game('game', {
	fps: 60,
	backgroundColor: '#323232',
});

const center = new Vec2(game.width, game.height).invScale(2);
const fourth = center.invScale(2);

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

export class GameScene extends Scene {
	player: Player | null;

	constructor() {
		super();

		this.player = new Player(center.x, center.y);
		this.addEntity(this.player);
	}

	removePlayer() {
		if (!this.player) return;

		this.player.removeSelf();
		this.player = null;
	}
}

const scene = new GameScene();

scene.addEntity(new Enemy(center.x - fourth.x, center.y - fourth.y));
scene.addEntity(new Enemy(center.x - fourth.x, center.y + fourth.y));
scene.addEntity(new Enemy(center.x + fourth.x, center.y + fourth.y));
scene.addEntity(new Enemy(center.x + fourth.x, center.y - fourth.y));

[revolver, machineGun, rifle].forEach((g, i) => {
	const x = positionItemInRow(i, 3, 16, 48);
	scene.addEntity(new Gun(center.x + x, center.y + fourth.y * 1.3, g));
});

const pattern = createPattern();
scene.onRender.add((ctx) => {
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});
game.pushScene(scene);

game.start();
