import { ImageAsset } from 'canvas-lord/core/asset-manager';
import { CSSColor } from 'canvas-lord/util/types';
import { ASSETS } from '~/util/assets';

const types = {
	basic: 'basic',
	rock: 'rock',
	revolver: 'revolver',
	machineGun: 'machine-gun',
	rifle: 'rifle',
} as const;
export type ProjectileType = (typeof types)[keyof typeof types];

const nullImage = null as unknown as ImageAsset;
export interface ProjectileFlyweight {
	speed: number;
	color: CSSColor;
	damage: number;
	duration: number;
	size: number;
	imageSrc: string;
	image: ImageAsset;

	rotate: number;
}

export const projectiles = new Map<ProjectileType, ProjectileFlyweight>();

const defaults: ProjectileFlyweight = {
	speed: 5,
	color: 'magenta',
	damage: 1,
	duration: 60,
	size: 8,
	imageSrc: '',
	image: nullImage,

	rotate: 0,
};

const basic = {
	...defaults,
	speed: 3,
	color: 'white',
};
projectiles.set('basic', basic);

const rock = {
	...defaults,
	speed: 3,
	imageSrc: ASSETS.GFX.WEAPONS.ROCK,
	size: 32,
	rotate: 3,
};
projectiles.set('rock', rock);

const revolver = {
	...defaults,
	speed: 10,
	imageSrc: ASSETS.GFX.WEAPONS.BULLET,
	size: 16,
	duration: 1,
};
projectiles.set('revolver', revolver);

const machineGun = {
	...defaults,
	speed: 10,
	color: 'pink',
};
projectiles.set('machine-gun', machineGun);

const rifle = {
	...defaults,
	speed: 20,
	color: 'pink',
	damage: 3,
};
projectiles.set('rifle', rifle);

for (let type of Object.values(types)) {
	if (!projectiles.has(type as ProjectileType))
		throw new Error(`Missing ${type} projectile type`);
}
