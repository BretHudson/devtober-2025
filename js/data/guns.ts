import { CSSColor } from 'canvas-lord/util/types';
import { ProjectileType } from './projectiles';
import { Ctx } from 'canvas-lord/util/canvas';
import { Owner } from '~/util/constants';
import { Draw } from 'canvas-lord/util/draw';

export interface GunData {
	color: CSSColor;
	projectile: ProjectileType;
}

export const playerGun: GunData = {
	color: 'pink',
	projectile: 'superb',
};

export const enemyGun: GunData = {
	color: 'blue',
	projectile: 'basic',
};

export const renderGun = (ctx: Ctx, owner: Owner) => {
	const { gun, aim } = owner;
	const w = 6;
	const h = 6;

	let offset = aim.sub(owner.pos);
	offset.normalize();
	offset = offset.scale(10);

	Draw.rect(
		ctx,
		{
			color: gun.color,
			originX: w / 2,
			originY: h / 2,
		},
		owner.x + offset.x,
		owner.y + offset.y,
		w,
		h,
	);
};
