import { CSSColor } from 'canvas-lord/util/types';

const types = {
	basic: 'basic',
	revolver: 'revolver',
	machineGun: 'machine-gun',
	rifle: 'rifle',
} as const;
export type ProjectileType = (typeof types)[keyof typeof types];

export interface ProjectileFlyweight {
	speed: number;
	color: CSSColor;
	damage: number;
}

export const projectiles = new Map<ProjectileType, ProjectileFlyweight>();

const basic = { speed: 3, color: 'white', damage: 1 };
projectiles.set('basic', basic);
const revolver = { speed: 6, color: 'black', damage: 1 };
projectiles.set('revolver', revolver);
const machineGun = { speed: 10, color: 'pink', damage: 1 };
projectiles.set('machine-gun', machineGun);
const rifle = { speed: 20, color: 'pink', damage: 3 };
projectiles.set('rifle', rifle);

for (let type of Object.values(types)) {
	if (!projectiles.has(type as ProjectileType))
		throw new Error(`Missing ${type} projectile type`);
}
