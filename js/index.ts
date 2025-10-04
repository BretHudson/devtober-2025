import { Game } from 'canvas-lord/core/engine';
import { Vec2 } from 'canvas-lord/math';
import { Player } from '~/entities/player';
import { Enemy } from '~/entities/enemy';
import { Gun } from './entities/gun';
import { positionItemInRow } from './util/math';
import { machineGun, revolver, rifle } from './data/guns';
import { assetManager, ASSETS } from './util/assets';
import { GameScene } from './scenes/game-scene';
import { Powerup } from './entities/powerup';

// load assets
Object.values(ASSETS.GFX).forEach((asset) => {
	assetManager.addImage(asset);
});

let game;
assetManager.onLoad.add(() => {
	game = new Game('game', {
		fps: 60,
		backgroundColor: '#323232',
		assetManager,
	});

	const fourth = new Vec2(game.width, game.height).invScale(4);

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

	const scene = new GameScene();

	scene.player = new Player(0, 0);
	scene.addEntity(scene.player);
	scene.follow(scene.player);

	scene.addEntity(new Powerup('heal', 0, -fourth.y * 1.2));

	scene.addEntity(new Enemy(fourth.x, fourth.y));
	scene.addEntity(new Enemy(fourth.x, -fourth.y));
	scene.addEntity(new Enemy(-fourth.x, -fourth.y));
	scene.addEntity(new Enemy(-fourth.x, fourth.y));

	[revolver, machineGun, rifle].forEach((g, i) => {
		const x = positionItemInRow(i, 3, 16, 48);
		scene.addEntity(new Gun(g, x, fourth.y * 1.3));
	});

	const pattern = createPattern();
	const patternMatrix = new DOMMatrix();
	scene.onRender.add((ctx) => {
		pattern.setTransform(
			patternMatrix.translate(-scene.camera.x, -scene.camera.y),
		);
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	});
	game.pushScene(scene);

	game.start();
});
assetManager.loadAssets();
