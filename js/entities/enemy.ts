import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Camera } from 'canvas-lord/util/camera';
import { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent } from '~/components/health';
import { enemyGun } from '~/data/guns';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG } from '~/util/constants';
import { Actor } from './actor';

const viewRadius = 100;

export class Enemy extends Actor {
	constructor(x: number, y: number) {
		super(x, y, enemyGun);

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

	update(): void {
		const bullet = this.collideEntity<Projectile>(
			this.x,
			this.y,
			COLLIDER_TAG.PROJECTILE,
		);

		if (bullet) {
			bullet.removeSelf();

			const health = this.component(healthComponent)!;
			health.cur -= bullet.type.damage;
			if (health.cur <= 0) {
				this.removeSelf();
				return;
			}
		}

		const toPlayer = this.deltaToPlayer();
		const canSeePlayer =
			toPlayer !== undefined && toPlayer.magnitude < viewRadius;
		if (this.player && canSeePlayer) {
			this.aim = this.player.pos;
			this.shoot(toPlayer);
		}
	}

	render(ctx: Ctx, camera: Camera): void {
		const drawPos = new Vec2(this.x, this.y).sub(camera);

		Draw.circle(
			ctx,
			{
				color: 'white',
				originX: viewRadius,
				originY: viewRadius,
				type: 'stroke',
			},
			drawPos.x,
			drawPos.y,
			viewRadius,
		);

		super.render(ctx, camera);
	}
}
