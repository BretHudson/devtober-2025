import { CSSColor } from 'canvas-lord/util/types';

const types = {
	basic: 'basic',
	superb: 'superb',
} as const;
export type ProjectileType = keyof typeof types;

interface ProjectileFlyweight {
	speed: number;
	color: CSSColor;
}

export const projectiles = new Map<ProjectileType, ProjectileFlyweight>();

const basic = { speed: 3, color: 'white' };
projectiles.set('basic', basic);
const superb = { speed: 6, color: 'black' };
projectiles.set('superb', superb);

for (let type in types) {
	if (!projectiles.has(type as ProjectileType))
		throw new Error(`Missing ${type} projectile type`);
}
