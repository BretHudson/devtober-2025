import { Game } from 'canvas-lord/core/engine';
import { Vec2 } from 'canvas-lord/math';
import { Player } from '~/entities/player';
import { Enemy } from '~/entities/enemy';
import { Gun } from './entities/gun';
import { positionItemInRow } from './util/math';
import { allGunData } from './data/guns';
import { assetManager, ASSETS } from './util/assets';
import { GameScene } from './scenes/game-scene';
import { Powerup } from './entities/powerup';
import { renderPattern } from './util/background-pattern';

// load assets
Object.values(ASSETS.GFX).forEach((asset) => {
	assetManager.addImage(asset);
});

let game;
assetManager.onLoad.add(() => {
	// init guns
	Object.values(allGunData).forEach((gun) => {
		const image = assetManager.sprites.get(gun.imageSrc);
		if (!image) throw new Error();
		gun.image = image;
	});

	game = new Game('game', {
		fps: 60,
		backgroundColor: '#323232',
		assetManager,
	});

	const fourth = new Vec2(game.width, game.height).invScale(4);

	const scene = new GameScene();

	const { enemyGun, machineGun, revolver, rifle } = allGunData;

	scene.player = new Player(0, 0, revolver);
	scene.addEntity(scene.player);
	scene.follow(scene.player);

	scene.addEntity(new Powerup('heal', 0, -fourth.y * 1.2));

	scene.addEntity(new Enemy(fourth.x, fourth.y, enemyGun));
	scene.addEntity(new Enemy(fourth.x, -fourth.y, enemyGun));
	scene.addEntity(new Enemy(-fourth.x, -fourth.y, enemyGun));
	scene.addEntity(new Enemy(-fourth.x, fourth.y, enemyGun));

	[revolver, machineGun, rifle].forEach((g, i) => {
		const x = positionItemInRow(i, 3, 16, 48);
		scene.addEntity(new Gun(g, x, fourth.y * 1.3));
	});

	scene.onRender.add(renderPattern(scene));
	game.pushScene(scene);

	game.start();
});
assetManager.loadAssets();
