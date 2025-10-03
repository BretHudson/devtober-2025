import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG } from '~/util/constants';
import { positionItemInRow } from '~/util/math';

export class Enemy extends BaseEntity {
	aim = Vec2.zero;
	curHealth = 3;
	maxHealth = 3;

	constructor(x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createRect(32, 32, 'orange');
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new BoxCollider(32, 32);
		collider.tag = COLLIDER_TAG.ENEMY;
		collider.centerOO();
		this.collider = collider;

		this.colliderVisible = true;
	}

	update(): void {
		const bullet = this.collideEntity<Projectile>(
			this.x,
			this.y,
			COLLIDER_TAG.PROJECTILE,
		);
		if (bullet) {
			bullet.removeSelf();
			if (--this.curHealth <= 0) {
				this.removeSelf();
			}
		}
	}

	render(ctx: Ctx): void {
		const size = 4;
		const padding = 6;

		const drawY = this.y - 24;
		for (let i = 0; i < this.maxHealth; ++i) {
			Draw.circle(
				ctx,
				{
					color: i < this.curHealth ? 'red' : 'gray',
					originX: size,
					originY: size,
				},
				this.x + positionItemInRow(i, this.maxHealth, size, padding),
				drawY,
				size,
			);
		}
	}
}
