import { CSSColor } from 'canvas-lord/util/types';
import { ProjectileType } from './projectiles';
import { Ctx } from 'canvas-lord/util/canvas';
import { Owner } from '~/util/constants';
import { Draw } from 'canvas-lord/util/draw';
import { assetManager, ASSETS } from '~/util/assets';
import { radToDeg } from 'canvas-lord/math/misc';

export interface GunData {
	imageSrc: string;
	color: CSSColor;
	projectile: ProjectileType;
	cooldown: number;
}

export const revolver: GunData = {
	imageSrc: ASSETS.GFX.REVOLVER,
	color: 'pink',
	projectile: 'revolver',
	cooldown: 20,
};

export const machineGun: GunData = {
	imageSrc: ASSETS.GFX.MACHINE_GUN,
	color: 'yellow',
	projectile: 'machine-gun',
	cooldown: 6,
};

export const rifle: GunData = {
	imageSrc: ASSETS.GFX.SHOTGUN,
	color: 'silver',
	projectile: 'rifle',
	cooldown: 30,
};

export const enemyGun: GunData = {
	imageSrc: ASSETS.GFX.ENEMY_GUN,
	color: 'blue',
	projectile: 'basic',
	cooldown: 30,
};

export const renderGun = (ctx: Ctx, owner: Owner) => {
	const { gun, aim } = owner;
	// TODO(bret): fix this
	const asset = assetManager.sprites.get(gun.imageSrc);
	if (!asset || !asset.image) throw new Error('');

	let offset = aim.sub(owner.pos);
	offset.normalize();
	offset = offset.scale(10);

	const flipped = offset.x < 0;

	let angle = radToDeg(Math.atan2(offset.y, offset.x));
	if (flipped) angle = 180 - angle;

	Draw.image(
		ctx,
		{
			imageSrc: asset.image,
			originY: asset.image.height / 2,
			scaleX: flipped ? -1 : 1,
			angle,
		},
		owner.x + offset.x,
		owner.y + offset.y,
	);
};
