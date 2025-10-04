import { Input } from 'canvas-lord/core/input';
import type { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { healthComponent, renderHealth } from '~/components/health';
import { GunData, renderGun } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { Timer } from '~/util/timer';
import type { DamageInfo } from '~/util/types';

type HurtBy = string;

export class Actor extends BaseEntity {
	aim = Vec2.one;
	cooldown = new Timer();
	gun: GunData;
	hurtBy: HurtBy;

	hitStunTimer = new Timer(100);

	get sprite() {
		return this.graphic as Sprite;
	}

	constructor(x: number, y: number, gun: GunData, hurtBy: HurtBy) {
		super(x, y);

		this.addComponent(healthComponent);

		this.gun = gun;

		this.hurtBy = hurtBy;

		this.hitStunTimer.onFinish.add(() => {
			this.sprite.color = undefined;
		});
	}

	preUpdate(): void {
		this.cooldown.tick();
		this.hitStunTimer.tick();
	}

	update(_input?: Input) {
		const { x, y } = this;

		const bullet = this.collideEntity<Projectile>(x, y, this.hurtBy);
		if (bullet) {
			bullet.hitActor();
			this.takeDamage(bullet.type);
		}
	}

	takeDamage(damageInfo: DamageInfo) {
		const health = this.component(healthComponent)!;
		health.cur -= damageInfo.damage;

		this.hitStunTimer.reset(4);
		this.sprite.color = 'white';

		if (health.cur <= 0) {
			this.die();
			return;
		}
	}

	die(): void {
		this.removeSelf();
	}

	shoot(target: Vec2) {
		if (this.cooldown.running) return;

		this.scene.addEntity(new Projectile(this, target, this.gun.projectile));

		this.cooldown.reset(this.gun.cooldown);
	}

	render(ctx: Ctx, camera: Camera): void {
		renderHealth(ctx, camera, this);
		renderGun(ctx, camera, this);
	}
}
