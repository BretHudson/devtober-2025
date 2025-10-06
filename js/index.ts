import { Game } from 'canvas-lord/core/engine';
import { Text } from 'canvas-lord/graphic';
import { ENEMIES } from '~/data/enemies';
import { allGunData } from '~/data/guns';
import { projectiles } from '~/data/projectiles';
import { initDebug } from '~/debug';
import { GameScene } from '~/scenes/game-scene';
import { assetManager, ASSETS, defaultSettings, settings } from '~/util/assets';
import { FONTS } from '~/util/constants';
import type { LDtk } from './util/types';

// load assets
type PossibleAsset = string | Record<string, any>;
type Callback = (src: string) => void;
function registerAsset(asset: PossibleAsset, callback: Callback) {
	if (typeof asset === 'string') {
		callback(asset);
		return;
	}

	Object.values(asset).forEach((childAsset: PossibleAsset) => {
		registerAsset(childAsset, callback);
	});
}

registerAsset(ASSETS.GFX, (src) => assetManager.addImage(src));
registerAsset(ASSETS.SFX, (src) => assetManager.addAudio(src));

const loadFont = async (name: string, fileName: string) => {
	const font = new FontFace(name, `url("./assets/${fileName}")`);
	await font.load();
	// @ts-ignore - this is valid despite TS saying it's not
	document.fonts.add(font);
};
await loadFont(FONTS.SKULLBOY, ASSETS.FONTS.CHEVYRAY_SKULLBOY);

// levels
const levelFile = 'assets/devtober-2025.ldtk';
const ldtkData: LDtk.Data = await fetch(levelFile).then((res) => res.json());

Text.updateDefaultOptions({
	font: FONTS.SKULLBOY,
	size: 24,
	color: '#111',
});

let game;
assetManager.onLoad.add(() => {
	// init guns
	Object.values(allGunData).forEach((gun) => {
		try {
			const image = assetManager.sprites.get(gun.imageSrc);
			if (!image) throw new Error(gun.imageSrc);
			gun.image = image;

			const audio = assetManager.audio.get(gun.audioSrc);
			if (!audio) throw new Error(gun.audioSrc);
			gun.audio = audio;
		} catch (e) {
			const error = e as Error;
			const fileName = error.message;
			error.message = `[Gun] Cannot find "${fileName}" ("${gun.name}")`;

			throw error;
		}
	});

	// init projectiles
	[...projectiles.values()].forEach((projectile) => {
		try {
			if (projectile.imageSrc === '') return;

			const image = assetManager.sprites.get(projectile.imageSrc);
			if (!image) throw new Error(projectile.imageSrc);
			projectile.image = image;
		} catch (e) {
			const error = e as Error;
			const fileName = error.message;
			error.message = `[Projectile] Cannot find "${fileName}"`;

			throw error;
		}
	});

	// load enemies
	Object.values(ENEMIES).forEach((enemy) => {
		try {
			if (enemy.imageSrc === '') return;

			const image = assetManager.sprites.get(enemy.imageSrc);
			if (!image) throw new Error(enemy.imageSrc);
			enemy.image = image;
		} catch (e) {
			const error = e as Error;
			const fileName = error.message;
			error.message = `[Enemy] Cannot find "${fileName}" ("${enemy.name}")`;

			throw error;
		}
	});

	game = new Game('game', {
		fps: 60,
		backgroundColor: '#323232',
		assetManager,
		// devMode: window.debugEnabled,
		gameLoopSettings: {
			updateMode: 'always',
			renderMode: 'onUpdate',
		},
	});

	if (window.debugEnabled) {
		initDebug(game, settings, defaultSettings);
	}

	game.pushScene(new GameScene(ldtkData));

	game.start();
});
assetManager.loadAssets();
