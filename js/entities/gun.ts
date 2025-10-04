import { CircleCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { GunData } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { assetManager } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';

export class Gun extends BaseEntity {
	gunData: GunData;

	constructor(gunData: GunData, x: number, y: number) {
		super(x, y);

		const boxSprite = Sprite.createCircle(16 * 2, gunData.color);
		boxSprite.centerOO();
		this.graphic = boxSprite;

		const asset = assetManager.sprites.get(gunData.imageSrc);
		if (!asset) throw new Error(`${gunData.imageSrc} not a valid sprite`);
		const sprite = new Sprite(asset);
		sprite.centerOO();
		this.addGraphic(sprite);

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.GUN;
		this.collider = collider;
		this.colliderVisible = true;

		this.gunData = gunData;
	}
}
