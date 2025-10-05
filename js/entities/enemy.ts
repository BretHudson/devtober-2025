import { BoxCollider, CircleCollider, Collider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { degToRad } from 'canvas-lord/math/misc';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { Random } from 'canvas-lord/util/random';
import { healthComponent } from '~/components/health';
import { ENEMIES, type EnemyFlyweight } from '~/data/enemies';
import { Actor } from '~/entities/actor';
import { Powerup, POWERUP } from '~/entities/powerup';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { SEEDS } from '~/util/random';

const directions = [
	Vec2.right,
	Vec2.right.scale(-1),
	Vec2.up,
	Vec2.up.scale(-1),
];

export class Enemy extends Actor {
	static dropRandom = new Random(SEEDS.ENEMY_DROP);
	static robovacInitRandom = new Random(SEEDS.ROBOVAC_INIT);
	random = new Random(Enemy.robovacInitRandom.int(9999));

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

		if (type === ENEMIES.ROBOVAC) {
			this.velocity = Enemy.robovacInitRandom.choose(directions).scale(3);
		}

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

		if (
			this.collide(this.x + this.velocity.x, this.y + this.velocity.y, [
				COLLIDER_TAG.PLAYER,
				COLLIDER_TAG.WALL,
				COLLIDER_TAG.ENEMY,
			])
		) {
			const mag = this.velocity.magnitude;
			this.velocity = this.velocity.rotate(degToRad(90));
			this.velocity.normalize();
			this.velocity.x = Math.round(this.velocity.x);
			this.velocity.y = Math.round(this.velocity.y);
			this.velocity = this.velocity.scale(mag);
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
