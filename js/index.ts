import { Game } from 'canvas-lord/core/engine';
import { allGunData } from './data/guns';
import { GameScene } from './scenes/game-scene';
import { assetManager, ASSETS } from './util/assets';
import { FONTS } from './util/constants';

// load assets
Object.values(ASSETS.GFX).forEach((asset) => {
	assetManager.addImage(asset);
});

const loadFont = async (name: string, fileName: string) => {
	const font = new FontFace(name, `url("${fileName}")`);
	await font.load();
	// @ts-ignore - this is valid despite TS saying it's not
	document.fonts.add(font);
};
await loadFont(FONTS.SKULLBOY, './assets/fonts/ChevyRay - Skullboy.ttf');

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

	game.pushScene(new GameScene());

	game.start();
});
assetManager.loadAssets();
