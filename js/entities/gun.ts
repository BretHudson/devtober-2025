import { CircleCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { GunData } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { COLLIDER_TAG } from '~/util/constants';

export class Gun extends BaseEntity {
	gunData: GunData;

	constructor(x: number, y: number, gunData: GunData) {
		super(x, y);

		const sprite = Sprite.createRect(16, 8, gunData.color);
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.GUN;
		this.collider = collider;
		this.colliderVisible = true;

		this.gunData = gunData;
	}
}
