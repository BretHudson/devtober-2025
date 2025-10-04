import { ImageAsset } from 'canvas-lord/core/asset-manager';
import { Vec2 } from 'canvas-lord/math';
import { radToDeg } from 'canvas-lord/math/misc';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { CSSColor } from 'canvas-lord/util/types';
import type { Actor } from '~/entities/actor';
import { ASSETS } from '~/util/assets';
import { ProjectileType } from './projectiles';

export interface GunData {
	imageSrc: string;
	image: ImageAsset;
	color: CSSColor;
	projectile: ProjectileType;
	cooldown: number;
}

const nullImage = null as unknown as ImageAsset;

const revolver: GunData = {
	imageSrc: ASSETS.GFX.REVOLVER,
	image: nullImage,
	color: 'pink',
	projectile: 'revolver',
	cooldown: 20,
};

const machineGun: GunData = {
	imageSrc: ASSETS.GFX.MACHINE_GUN,
	image: nullImage,
	color: 'yellow',
	projectile: 'machine-gun',
	cooldown: 6,
};

const rifle: GunData = {
	imageSrc: ASSETS.GFX.SHOTGUN,
	image: nullImage,
	color: 'silver',
	projectile: 'rifle',
	cooldown: 30,
};

const enemyGun: GunData = {
	imageSrc: ASSETS.GFX.ENEMY_GUN,
	image: nullImage,
	color: 'blue',
	projectile: 'basic',
	cooldown: 30,
};

export const allGunData = {
	revolver,
	machineGun,
	rifle,
	enemyGun,
} as const;

export const renderGun = (ctx: Ctx, camera: Camera, owner: Actor) => {
	const { gun, aim } = owner;

	const asset = gun.image;
	if (!asset.image) throw new Error();

	const drawPos = new Vec2(owner.x, owner.y).sub(camera);

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
		drawPos.x + offset.x,
		drawPos.y + offset.y,
	);
};
