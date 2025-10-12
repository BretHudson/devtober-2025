import { Collider } from 'canvas-lord/collider';
import { Sfx } from 'canvas-lord/core/asset-manager';
import { Input } from 'canvas-lord/core/input';
import type { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { GunComponent } from '~/components/gun';
import { healthComponent, renderHealth } from '~/components/health';
import { GunData } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { Timer } from '~/util/timer';
import type { DamageInfo } from '~/util/types';

type HurtBy = string;

export class Actor extends BaseEntity {
	aimDir = Vec2.right;
	hurtBy: HurtBy;
	renderHealth = true;

	hitStunTimer = new Timer(100);

	#gun?: GunComponent;
	get gun() {
		return this.#gun;
	}
	set gun(value: GunComponent | undefined) {
		this.#gun = value;
	}

	fractVel = new Vec2();
	velocity = new Vec2();

	get ammo(): number {
		throw new Error('ammo getter must be set in child class');
	}
	set ammo(_: number) {
		throw new Error('ammo setter must be set in child class');
	}

	get sprite() {
		return this.graphic as Sprite;
	}

	get health() {
		const health = this.component(healthComponent);
		if (!health) throw new Error('does not have health');
		return health;
	}

	get alive() {
		return this.health.cur > 0;
	}

	get dead() {
		return this.health.cur <= 0;
	}

	get solidCollider(): Collider {
		if (!this.collider) throw new Error('no collider');
		return this.collider;
	}

	constructor(x: number, y: number, hurtBy: HurtBy, gun?: GunData) {
		super(x, y);

		this.addComponent(healthComponent);

		// TODO(bret): Need to make sure this exists when setting gun
		this.switchGun(gun);

		this.hurtBy = hurtBy;

		this.hitStunTimer.onFinish.add(() => {
			this.sprite.color = undefined;
		});
	}

	switchGun(gunData?: GunData) {
		this.gun?.drop();
		this.gun = gunData && new GunComponent(gunData, this);
	}

	preUpdate(): void {
		this.gun?.tick();
		this.hitStunTimer.tick();
	}

	update(_input?: Input) {
		const { x, y } = this;

		this.fractVel.add(this.velocity);
		const whole = new Vec2(
			Math.trunc(this.fractVel.x),
			Math.trunc(this.fractVel.y),
		);
		this.fractVel.sub(whole);

		const xDir = Math.sign(whole.x);
		for (let i = 0; i < Math.abs(whole.x); ++i) {
			if (this.collide(this.x + xDir, this.y, COLLIDER_TAG.WALL)) {
				this.velocity.x = 0;
				this.fractVel.x = 0;
				break;
			} else {
				this.x += xDir;
			}
		}

		const yDir = Math.sign(whole.y);
		for (let i = 0; i < Math.abs(whole.y); ++i) {
			if (this.collide(this.x, this.y + yDir, COLLIDER_TAG.WALL)) {
				this.velocity.y = 0;
				this.fractVel.y = 0;
				break;
			} else {
				this.y += yDir;
			}
		}

		const bullet = this.collideEntity<Projectile>(x, y, this.hurtBy);
		if (bullet) {
			bullet.hitActor();
			this.takeDamage(bullet.type, bullet);
		}
	}

	takeDamage(damageInfo: DamageInfo, other: BaseEntity) {
		const health = this.component(healthComponent)!;
		health.cur -= damageInfo.damage;

		this.hitStunTimer.reset(4);
		this.sprite.color = 'white';

		let src: string = ASSETS.SFX.COLLISION.HIT_1;
		if (this.hurtBy === COLLIDER_TAG.ENEMY_PROJECTILE) {
			src = ASSETS.SFX.COLLISION.HIT_2;
		}
		const audio = assetManager.audio.get(src);
		if (!audio) throw new Error();
		Sfx.play(audio, 1, 0.3);

		if (health.cur <= 0) {
			this.die();
			return;
		}
	}

	heal(amount: number): void {
		const { health } = this;
		health.cur = Math.min(health.cur + amount, health.max);
	}

	die(): void {
		this.removeSelf();
	}

	shoot(target: Vec2) {
		this.gun?.shoot(target);
	}

	reload(gun: GunComponent) {
		if (this.ammo === 0) return false;
		const give = Math.min(this.ammo, gun.ammoCapacity);
		gun.ammo += give;
		this.ammo -= give;
		return true;
	}

	render(ctx: Ctx, camera: Camera): void {
		if (this.renderHealth) renderHealth(ctx, camera, this);

		// TODO(bret): remove this debug stuff
		if ((true as boolean) && this.gun) {
			Draw.circle(
				ctx,
				{
					color: 'black',
					type: 'fill',
					originX: 3,
					originY: 3,
				},
				this.x + this.gun.shootPos.x - camera.x,
				this.y + this.gun.shootPos.y - camera.y,
				3,
			);
		}
	}
}
