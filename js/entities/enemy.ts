import { BoxCollider, CircleCollider, Collider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { Random } from 'canvas-lord/util/random';
import { healthComponent } from '~/components/health';
import type { EnemyFlyweight } from '~/data/enemies';
import { Actor } from '~/entities/actor';
import { Powerup, POWERUP } from '~/entities/powerup';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { SEEDS } from '~/util/random';

const viewRadius = 100 * 2;

export class Enemy extends Actor {
	static dropRandom = new Random(SEEDS.ENEMY_DROP);

	type: EnemyFlyweight;

	get viewRadius() {
		return this.type.viewRadius;
	}

	constructor(x: number, y: number, type: EnemyFlyweight) {
		super(x, y, COLLIDER_TAG.PROJECTILE);

		const sprite = new Sprite(type.image);
		sprite.centerOO();
		this.graphic = sprite;

		if (false as boolean) {
			const asset = assetManager.sprites.get(ASSETS.GFX.CHEESE);
			if (!asset) throw new Error();
			const cheese = new Sprite(asset);
			cheese.x += 1;
			cheese.y += 12;
			cheese.centerOO();
			this.addGraphic(cheese);
		}

		let collider: Collider;
		if (Array.isArray(type.hitbox)) {
			const boxCollider = new BoxCollider(...type.hitbox);
			boxCollider.centerOO();
			collider = boxCollider;
		} else {
			collider = new CircleCollider(type.hitbox);
		}
		collider.tag = COLLIDER_TAG.ENEMY;
		this.collider = collider;
		this.colliderVisible = true;

		this.type = type;

		this.addComponent(healthComponent);
	}

	update(): void {
		super.update();

		this.gunGfx?.update();
		const toPlayer = this.deltaToPlayer();
		if (this.viewRadius) {
			const canSeePlayer = toPlayer.magnitude < this.viewRadius;
			if (this.player.alive && canSeePlayer) {
				this.aimDir = toPlayer;
				this.shoot(toPlayer);
			}
		}
	}

	die(): void {
		if (Enemy.dropRandom.chance(1, 2)) {
			const powerupType = Enemy.dropRandom.choose([
				POWERUP.HEAL,
				POWERUP.SPEED_UP,
			]);
			this.scene.addEntity(new Powerup(powerupType, this.x, this.y));
		}
		super.die();
	}

	render(ctx: Ctx, camera: Camera): void {
		if (this.viewRadius) {
			const drawPos = new Vec2(this.x, this.y).sub(camera);

			Draw.circle(
				ctx,
				{
					color: 'white',
					originX: this.viewRadius,
					originY: this.viewRadius,
					type: 'stroke',
				},
				drawPos.x,
				drawPos.y,
				this.viewRadius,
			);
		}

		super.render(ctx, camera);
	}
}
