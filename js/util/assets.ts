import { AssetManager } from 'canvas-lord/canvas-lord';

const GFX = {
	PLAYER: 'gfx/player.png',
	ENEMY: 'gfx/enemy.png',

	REVOLVER: 'gfx/revolver.png',
	MACHINE_GUN: 'gfx/machine-gun.png',
	RIFLE: 'gfx/shotgun.png',
	SHOTGUN: 'gfx/shotgun.png',
	ENEMY_GUN: 'gfx/enemy-gun.png',

	MOUSE: 'gfx/mouse.png',

	MOUSE_TRAP: 'gfx/mouse-trap.png',
	MOUSE_TRAP_2: 'gfx/mouse-trap-2.png',
	CHEESE: 'gfx/cheese.png',
	ROCK: 'gfx/rock.png',
} as const;

//
const SFX = {
	HIT_1: 'sfx/hit-1.wav',
	HIT_2: 'sfx/hit-2.wav',
	SHOOT_1: 'sfx/shoot-1.wav',
	SHOOT_2: 'sfx/shoot-2.wav',
	SHOOT_3: 'sfx/shoot-3.wav',
	SHOTGUN_1: 'sfx/shotgun-1.wav',
	POWERUP: 'sfx/powerup.wav',
	PICK_UP_WEAPON: 'sfx/pick-up-weapon.wav',
	THROW_ROCK: 'sfx/throw-rock.wav',
} as const;

export const ASSETS = {
	GFX,
	SFX,
} as const;

export const assetManager = new AssetManager('./assets/');
