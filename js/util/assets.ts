import { AssetManager } from 'canvas-lord/canvas-lord';

const GFX = {
	REVOLVER: 'gfx/revolver.png',
	MACHINE_GUN: 'gfx/machine-gun.png',
	SHOTGUN: 'gfx/shotgun.png',
	ENEMY_GUN: 'gfx/enemy-gun.png',
} as const;

const SFX = {
	//
} as const;

export const ASSETS = {
	GFX,
	SFX,
} as const;

export const assetManager = new AssetManager('./assets/');
