import { AudioAsset, ImageAsset } from 'canvas-lord/core/asset-manager';
import { Vec2 } from 'canvas-lord/math';
import { CSSColor } from 'canvas-lord/util/types';
import { ProjectileType } from '~/data/projectiles';
import { ASSETS } from '~/util/assets';

export interface GunData {
	name: string;
	imageSrc: string;
	image: ImageAsset;
	audioSrc: string;
	audio: AudioAsset;
	color: CSSColor;
	projectile: ProjectileType;
	cooldown: number;
	spreadAngle: number;
	armLength: number;
	origin: Vec2;
	ammoCapacity: number;
	reloadTime: number;
}

const nullImage = null as unknown as ImageAsset;
const nullAudio = null as unknown as AudioAsset;

const defaults: GunData = {
	name: 'NAME',
	imageSrc: 'null.png',
	image: nullImage,
	audioSrc: 'null.wav',
	audio: nullAudio,
	color: 'magenta',
	projectile: 'basic',
	cooldown: 10,
	spreadAngle: 0,
	armLength: 30,
	origin: Vec2.zero,
	ammoCapacity: 10,
	reloadTime: 0.4,
};

// damage
// rate
// spread
// fire mode (burst vs automatic)

export const allGunData = {
	revolver: {
		...defaults,
		name: 'Revolver',
		imageSrc: ASSETS.GFX.REVOLVER,
		audioSrc: ASSETS.SFX.SHOOT_1,
		color: 'pink',
		cooldown: 20,
		spreadAngle: 4,
		projectile: 'revolver',
		origin: new Vec2(38, -10),
		armLength: 20,
	} as GunData,
	rock: {
		...defaults,
		name: 'Rock',
		imageSrc: ASSETS.GFX.ROCK,
		audioSrc: ASSETS.SFX.THROW_ROCK,
		color: 'brown',
		cooldown: 60,
		spreadAngle: 0,
		projectile: 'rock',
		origin: new Vec2(20, 0),
		armLength: 30,
	} as GunData,
	machineGun: {
		//
		...defaults,
		name: 'Machine Gun',
		imageSrc: ASSETS.GFX.MACHINE_GUN,
		audioSrc: ASSETS.SFX.SHOOT_2,
		color: 'yellow',
		projectile: 'machine-gun',
		cooldown: 6,
		spreadAngle: 6,
	} as GunData,
	rifle: {
		...defaults,
		name: 'Rifle',
		imageSrc: ASSETS.GFX.RIFLE,
		audioSrc: ASSETS.SFX.SHOOT_3,
		color: 'silver',
		projectile: 'rifle',
		cooldown: 30,
	} as GunData,
	shotgun: {
		...defaults,
		name: 'Shotgun',
		imageSrc: ASSETS.GFX.SHOTGUN,
		audioSrc: ASSETS.SFX.SHOTGUN_1,
		color: 'lime',
		projectile: 'machine-gun',
		cooldown: 30,
	} as GunData,
	enemyGun: {
		...defaults,
		name: 'Enemy Gun',
		imageSrc: ASSETS.GFX.ENEMY_GUN,
		audioSrc: ASSETS.SFX.SHOOT_1,
		color: 'blue',
		projectile: 'basic',
		cooldown: 30,
	} as GunData,
} as const;
