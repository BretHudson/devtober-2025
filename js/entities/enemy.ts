import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent } from '~/components/health';
import { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';
import { COLLIDER_TAG } from '~/util/constants';

const viewRadius = 100;

export class Enemy extends Actor {
	constructor(x: number, y: number, gun: GunData) {
		super(x, y, gun, COLLIDER_TAG.PROJECTILE);

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
		super.update();

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
