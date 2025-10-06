import { BoxCollider } from 'canvas-lord/collider';
import { Sfx } from 'canvas-lord/core/asset-manager';
import type { Input, Key } from 'canvas-lord/core/input';
import { Keys } from 'canvas-lord/core/input';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent } from '~/components/health';
import { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';
import type { Gun } from '~/entities/gun';
import { POWERUP, Powerup, PowerupData } from '~/entities/powerup';
import { assetManager, ASSETS, settings } from '~/util/assets';
import { COLLIDER_TAG, DEPTH } from '~/util/constants';
import { Timer } from '~/util/timer';
import { DamageInfo } from '~/util/types';

function getAxis(input: Input, neg: Key[], pos: Key[]) {
	return +input.keyCheck(pos) - +input.keyCheck(neg);
}

const leftKeys: Key[] = [Keys.ArrowLeft, Keys.A];
const rightKeys: Key[] = [Keys.ArrowRight, Keys.D];
const upKeys: Key[] = [Keys.ArrowUp, Keys.W];
const downKeys: Key[] = [Keys.ArrowDown, Keys.S];

interface StatusEffect {
	powerup: PowerupData;
	timer: Timer;
}

export class Player extends Actor {
	statuses: StatusEffect[] = [];
	timers: Timer[] = [];

	speedUp = false;
	invincible = false;

	sinTimer = 0;

	get collider(): BoxCollider {
		return super.collider as BoxCollider;
	}

	set collider(collider: BoxCollider) {
		super.collider = collider;
	}

	get inventory() {
		return this.scene.inventory;
	}

	get ammo() {
		return this.inventory.items.ammo.quantity;
	}
	set ammo(value: number) {
		this.inventory.items.ammo.quantity = value;
	}

	constructor(x: number, y: number, gun?: GunData) {
		super(x, y, COLLIDER_TAG.ENEMY_PROJECTILE, gun);

		const asset = assetManager.sprites.get(ASSETS.GFX.MOUSE);
		if (!asset) throw new Error();
		const sprite = new Sprite(asset);
		sprite.centerOO();
		sprite.originX += 15;
		this.graphic = sprite;

		const collider = new BoxCollider(24, 100);
		collider.tag = COLLIDER_TAG.PLAYER;
		collider.centerOO();
		this.collider = collider;
		this.colliderVisible = true;

		this.addComponent(healthComponent);

		this.depth = DEPTH.PLAYER;

		this.renderHealth = false;

		this.onPreUpdate.add(this.updateTimers.bind(this));
	}

	addTimer(timer: Timer) {
		this.timers.push(timer);
		timer.onFinish.add(() => this.removeTimer(timer));
	}

	updateTimers(): void {
		this.timers.forEach((timer) => timer.tick());
	}

	removeTimer(timer: Timer) {
		const index = this.timers.indexOf(timer);
		if (index < 0) return;

		this.timers.splice(index, 1);
	}

	update(input: Input): void {
		const hInput = getAxis(input, leftKeys, rightKeys);
		const vInput = getAxis(input, upKeys, downKeys);

		let speed = settings.playerSpeed;
		if (this.speedUp) {
			speed *= settings.playerSpeedUp;
		}
		let vel = new Vec2(hInput, vInput);
		if (vel.magnitude > 0) {
			this.sinTimer += 1;

			vel.normalize();
			vel = vel.scale(speed);
		}
		this.velocity = vel;

		this.aimDir = this.scene.mouse.sub(this.pos);

		const gunEntity = this.collideEntity<Gun>(
			this.x,
			this.y,
			COLLIDER_TAG.GUN,
		);
		if (gunEntity && input.keyPressed(Keys.E)) {
			const asset = assetManager.audio.get(ASSETS.SFX.PICK_UP_WEAPON);
			if (!asset) throw new Error();
			Sfx.play(asset, 0.5, 0.2);
			this.switchGun(gunEntity.gunData);
		}

		const powerup = this.collideEntity<Powerup>(
			this.x,
			this.y,
			COLLIDER_TAG.POWERUP,
		);
		if (powerup) this.processPowerup(powerup);

		super.update();

		this.gun?.update();
		if (input.mouseCheck()) {
			this.shoot(this.aimDir);
		}
	}

	postUpdate(): void {
		this.sprite.color = undefined;
		const status = this.getStatus(POWERUP.INVINCIBILITY);
		if (status) {
			// TODO(bret): gonna want to adjust this to use actual framedate rather than percentages (as durations can change)
			const { percentLeft } = status.timer;
			const closeToOut = percentLeft < 0.3;
			const flash = (percentLeft * 20) % 2 < 1;

			this.sprite.color = closeToOut && flash ? 'pink' : 'deeppink';
		}

		this.sprite.scaleX = Math.sign(this.aimDir.dot(Vec2.right)) || 1;

		this.sprite.angle = Math.trunc(Math.sin(this.sinTimer / 12) * 1.4) * 5;
	}

	takeDamage(damageInfo: DamageInfo): void {
		if (this.invincible) return;
		if (settings.invincible) return;
		super.takeDamage(damageInfo);
	}

	die(): void {
		this.scene.removePlayer();
	}

	addStatus(powerup: PowerupData, callback?: () => void) {
		if (powerup.type !== 'status') return;

		// check if we already have one of that type
		if (!powerup.stacks) {
			const existingStatus = this.getStatus(powerup);
			if (existingStatus) {
				existingStatus.timer.restart();
				return;
			}
		}

		const timer = new Timer(60 * 5);
		const status: StatusEffect = {
			powerup,
			timer,
		};
		timer.onFinish.add(() => this.removeStatus(status));
		if (callback) timer.onFinish.add(callback);
		this.addTimer(timer);

		this.statuses.push(status);
	}

	getStatus(statusType: PowerupData) {
		return this.statuses.find((status) => status.powerup === statusType);
	}

	hasStatus(statusType: PowerupData) {
		return this.statuses.find((status) => status.powerup === statusType);
	}

	removeStatus(status: StatusEffect) {
		const index = this.statuses.indexOf(status);
		if (index < 0) return;

		this.statuses.splice(index, 1);
	}

	processPowerup(powerupEntity: Powerup) {
		const { health } = this;

		const { type: powerup } = powerupEntity;

		let consumed = false;
		let callback: (() => void) | undefined;
		switch (powerup) {
			case POWERUP.HEAL:
				if (health.cur < health.max) {
					consumed = true;
					this.heal(1);
				}
				break;
			case POWERUP.SPEED_UP: {
				consumed = true;
				this.speedUp = true;
				callback = () => (this.speedUp = false);
				break;
			}
			case POWERUP.INVINCIBILITY: {
				consumed = true;
				this.invincible = true;
				callback = () => (this.invincible = false);
				break;
			}
			default:
				throw new Error(`unsupported powerup "${powerup.type}"`);
		}

		if (powerup.type === 'status') {
			this.addStatus(powerup, callback);
		}

		if (consumed) powerupEntity.removeSelf();
	}

	render(ctx: Ctx, camera: Camera): void {
		super.render(ctx, camera);

		const aimAt = this.aimDir.add(this.pos);

		const r = 20;
		Draw.circle(
			ctx,
			{
				color: 'yellow',
				type: 'stroke',
				originX: r,
				originY: r,
			},
			aimAt.x - camera.x,
			aimAt.y - camera.y,
			r,
		);
	}
}
