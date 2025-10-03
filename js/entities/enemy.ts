import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent, renderHealth } from '~/components/health';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG } from '~/util/constants';

const viewRadius = 100;

export class Enemy extends BaseEntity {
	aim = Vec2.zero;
	cooldown = 0;

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

		this.addComponent(healthComponent);
	}

	preUpdate(): void {
		this.cooldown--;
	}

	update(): void {
		const bullet = this.collideEntity<Projectile>(
			this.x,
			this.y,
			COLLIDER_TAG.PROJECTILE,
		);

		if (bullet) {
			bullet.removeSelf();

			const health = this.component(healthComponent)!;
			if (--health.cur <= 0) {
				this.removeSelf();
				return;
			}
		}

		const toPlayer = this.deltaToPlayer();
		if (toPlayer && toPlayer.magnitude < viewRadius) {
			if (this.cooldown > 0) return;

			this.shoot(toPlayer);

			this.cooldown = 30;
		}
	}
	shoot(target: Vec2) {
		this.scene.addEntity(new Projectile(this, target, 3));
	}

	render(ctx: Ctx): void {
		Draw.circle(
			ctx,
			{
				color: 'white',
				originX: viewRadius,
				originY: viewRadius,
				type: 'stroke',
			},
			this.x,
			this.y,
			viewRadius,
		);

		renderHealth(ctx, this);
	}
}
