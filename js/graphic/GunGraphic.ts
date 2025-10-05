import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { degToRad, radToDeg } from 'canvas-lord/math/misc';
import type { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';

const up = Vec2.up;

export class GunGraphic extends Sprite {
	gun: GunData;

	get shootPos(): Vec2 {
		let pos = this.gun.origin.rotate(degToRad(this.angle));
		pos.x *= this.scaleX;
		return pos.add(new Vec2(this.x, this.y));
	}

	constructor(gun: GunData, x = 0, y = 0) {
		super(gun.image, x, y);

		this.gun = gun;
		this.setGun(gun);
	}

	setGun(gun: GunData) {
		this.gun = gun;
		this.asset = gun.image;
		this.originY = this.height / 2;
	}

	update(): void {
		const parent = this.parent as unknown as Actor;
		let offset = parent.aimDir.clone();
		offset.normalize();
		offset = offset.scale(this.gun.armLength);

		this.x = offset.x;
		this.y = offset.y;

		this.angle = radToDeg(Math.atan2(offset.y, offset.x));

		this.scaleX = offset.x < 0 ? -1 : 1;
		if (this.scaleX < 0) this.angle = 180 - this.angle;
	}
}
