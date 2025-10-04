import type { Input, Key } from 'canvas-lord/core/input';
import { Keys } from 'canvas-lord/core/input';
import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent } from '~/components/health';
import { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';
import type { Gun } from '~/entities/gun';
import { POWERUP, Powerup } from '~/entities/powerup';
import { Projectile } from '~/entities/projectile';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG, DEPTH } from '~/util/constants';
import { Timer } from '~/util/timer';

function getAxis(input: Input, neg: Key[], pos: Key[]) {
	return +input.keyCheck(pos) - +input.keyCheck(neg);
}

const leftKeys: Key[] = [Keys.ArrowLeft, Keys.A];
const rightKeys: Key[] = [Keys.ArrowRight, Keys.D];
const upKeys: Key[] = [Keys.ArrowUp, Keys.W];
const downKeys: Key[] = [Keys.ArrowDown, Keys.S];

export class Player extends Actor {
	timers: Timer[] = [];

	speedUp = false;

	get collider(): BoxCollider {
		return super.collider as BoxCollider;
	}

	set collider(collider: BoxCollider) {
		super.collider = collider;
	}

	constructor(x: number, y: number, gun: GunData) {
		super(x, y, gun, COLLIDER_TAG.ENEMY_PROJECTILE);

		const asset = assetManager.sprites.get(ASSETS.GFX.PLAYER);
		if (!asset) throw new Error();
		const sprite = new Sprite(asset);
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new BoxCollider(32, 32);
		collider.tag = COLLIDER_TAG.PLAYER;
		collider.centerOO();
		this.collider = collider;
		this.colliderVisible = true;

		this.addComponent(healthComponent);

		this.depth = DEPTH.PLAYER;
	}

	get health() {
		const health = this.component(healthComponent);
		if (!health) throw new Error('does not have health');
		return health;
	}

	addTimer(timer: Timer) {
		this.timers.push(timer);
		timer.onFinish.add(() => this.removeTimer(timer));
	}

	removeTimer(timer: Timer) {
		const index = this.timers.indexOf(timer);
		if (index < 0) return;

		this.timers.splice(index, 1);
	}

	preUpdate(): void {
		super.preUpdate();

		this.timers.forEach((timer) => timer.tick());
	}

	update(input: Input): void {
		const hInput = getAxis(input, leftKeys, rightKeys);
		const vInput = getAxis(input, upKeys, downKeys);

		const speed = this.speedUp ? 5 : 3;
		let vel = new Vec2(hInput, vInput);
		if (vel.magnitude > 0) vel.normalize();
		vel = vel.scale(speed);

		this.x += vel.x;
		this.y += vel.y;

		// for now, do the hacky dumb thing
		if (this.scene.bounds) {
			const offset = new Vec2(
				this.collider.width,
				this.collider.height,
			).invScale(2);
			offset.x += 32;
			offset.y += 32;
			this.x = Math.clamp(
				this.x,
				this.scene.bounds[0] + offset.x,
				this.scene.bounds[2] - offset.y,
			);
			this.y = Math.clamp(
				this.y,
				this.scene.bounds[1] + offset.x,
				this.scene.bounds[3] - offset.y,
			);
		}

		this.aim = this.scene.mouse;

		if (input.mouseCheck()) {
			this.shoot(this.aim.sub(this.pos));
		}

		const gun = this.collideEntity<Gun>(this.x, this.y, COLLIDER_TAG.GUN);
		if (gun && input.keyPressed(Keys.E)) {
			this.gun = gun.gunData;
			this.cooldown.earlyFinish();
		}

		const powerup = this.collideEntity<Powerup>(
			this.x,
			this.y,
			COLLIDER_TAG.POWERUP,
		);
		if (powerup) this.processPowerup(powerup);

		super.update();
	}

	die(): void {
		this.scene.removePlayer();
	}

	processPowerup(powerup: Powerup) {
		const { health } = this;

		let consumed = false;
		switch (powerup.type) {
			case POWERUP.HEAL:
				if (health.cur < health.max) {
					consumed = true;
					++health.cur;
				}
				break;
			case POWERUP.SPEED_UP: {
				this.speedUp = true;
				consumed = true;
				const timer = new Timer(60 * 5);
				timer.onFinish.add(() => (this.speedUp = false));
				this.addTimer(timer);
				break;
			}
			default:
				throw new Error(`unsupported powerup "${powerup.type}"`);
		}

		if (consumed) powerup.removeSelf();
	}

	render(ctx: Ctx, camera: Camera): void {
		super.render(ctx, camera);

		const r = 20;
		Draw.circle(
			ctx,
			{
				color: 'yellow',
				type: 'stroke',
				originX: r,
				originY: r,
			},
			this.aim.x - camera.x,
			this.aim.y - camera.y,
			r,
		);
	}
}
