import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { healthComponent, renderHealth } from '~/components/health';
import { GunData, renderGun } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG } from '~/util/constants';
import { Timer } from '~/util/timer';
import type { DamageInfo } from '~/util/types';

type HurtBy = string;

export class Actor extends BaseEntity {
	aim = Vec2.one;
	cooldown = new Timer();
	gun: GunData;
	hurtBy: HurtBy;

	constructor(x: number, y: number, gun: GunData, hurtBy: HurtBy) {
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

		this.gun = gun;

		this.hurtBy = hurtBy;
	}

	preUpdate(): void {
		this.cooldown.tick();
	}

	update() {
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
