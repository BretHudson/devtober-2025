import { Camera } from 'canvas-lord';
import { Sprite } from 'canvas-lord/graphic';
import { radToDeg } from 'canvas-lord/math/misc';
import { Ctx } from 'canvas-lord/util/canvas';
import type { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';

export class GunGraphic extends Sprite {
	gun: GunData;

	constructor(gun: GunData, x = 0, y = 0) {
		super(gun.image, x, y);

		this.gun = gun;

		this.centerOO();
		this.originX = 0;
	}

	render(ctx: Ctx, camera?: Camera): void {
		super.render(ctx, camera);

		const parent = this.parent as unknown as Actor;
		let offset = parent.aimDir.clone();
		offset.normalize();
		offset = offset.scale(30);

		this.x = offset.x;
		this.y = offset.y;

		this.angle = radToDeg(Math.atan2(offset.y, offset.x));

		this.scaleX = offset.x < 0 ? -1 : 1;
		if (this.scaleX < 0) this.angle = 180 - this.angle;
	}
}
