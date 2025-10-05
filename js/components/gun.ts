import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { degToRad, radToDeg } from 'canvas-lord/math/misc';
import type { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';

export class GunComponent {
	data: GunData;
	sprite: Sprite;
	owner: Actor;

	get shootPos(): Vec2 {
		let pos = this.data.origin.rotate(degToRad(this.sprite.angle));
		pos.x *= this.sprite.scaleX;
		return pos.add(new Vec2(this.sprite.x, this.sprite.y));
	}

	constructor(gun: GunData, owner: Actor) {
		this.data = gun;
		this.owner = owner;
		this.sprite = new Sprite(gun.image);
		this.setGun(gun);
	}

	setGun(gun?: GunData) {
		if (gun) {
			this.data = gun;
			this.sprite.asset = gun.image;
			this.sprite.originY = this.sprite.height / 2;
		}

		this.sprite.visible = gun !== undefined;
	}

	update(): void {
		const { owner } = this;
		let offset = owner.aimDir.clone();
		offset.normalize();
		offset = offset.scale(this.data.armLength);

		this.sprite.x = offset.x;
		this.sprite.y = offset.y;

		this.sprite.angle = radToDeg(Math.atan2(offset.y, offset.x));

		this.sprite.scaleX = offset.x < 0 ? -1 : 1;
		if (this.sprite.scaleX < 0) this.sprite.angle = 180 - this.sprite.angle;
	}
}
