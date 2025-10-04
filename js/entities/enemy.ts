import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { Random } from 'canvas-lord/util/random';
import { healthComponent } from '~/components/health';
import { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';
import { Powerup, POWERUP } from '~/entities/powerup';
import { GunGraphic } from '~/graphic/GunGraphic';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { SEEDS } from '~/util/random';

const viewRadius = 100;

export class Enemy extends Actor {
	static dropRandom = new Random(SEEDS.ENEMY_DROP);

	constructor(x: number, y: number, gun: GunData) {
		super(x, y, gun, COLLIDER_TAG.PROJECTILE);

		const asset = assetManager.sprites.get(ASSETS.GFX.MOUSE_TRAP_2);
		if (!asset) throw new Error();
		const sprite = new Sprite(asset);
		sprite.centerOO();
		this.graphic = sprite;

		{
			const asset = assetManager.sprites.get(ASSETS.GFX.CHEESE);
			if (!asset) throw new Error();
			const cheese = new Sprite(asset);
			cheese.x += 1;
			cheese.y += 12;
			cheese.centerOO();
			this.addGraphic(cheese);
		}

		const collider = new BoxCollider(48, 72);
		collider.tag = COLLIDER_TAG.ENEMY;
		collider.centerOO();
		this.collider = collider;
		this.colliderVisible = true;

		this.addComponent(healthComponent);

		this.addGraphic(new GunGraphic(gun));
	}

	update(): void {
		const toPlayer = this.deltaToPlayer();
		const canSeePlayer = toPlayer.magnitude < viewRadius;
		if (this.player.alive && canSeePlayer) {
			this.aimDir = toPlayer;
			this.shoot(toPlayer);
		}

		super.update();
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
