import { Sfx } from 'canvas-lord/core/asset-manager';
import { Input } from 'canvas-lord/core/input';
import type { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { degToRad } from 'canvas-lord/math/misc';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { healthComponent, renderHealth } from '~/components/health';
import { GunData, renderGun } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { randomSpreadAngle } from '~/util/random';
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

		let src: string = ASSETS.SFX.HIT_1;
		if (this.hurtBy === COLLIDER_TAG.ENEMY_PROJECTILE) {
			src = ASSETS.SFX.HIT_2;
		}
		const audio = assetManager.audio.get(src);
		if (!audio) throw new Error();
		Sfx.play(audio, 1, 0.3);

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

		const angleOffset = randomSpreadAngle(this.gun.spreadAngle);
		const dir = target.rotate(degToRad(angleOffset));

		this.scene.addEntity(new Projectile(this, dir, this.gun.projectile));

		Sfx.play(this.gun.audio, 0.2, 0.2);

		this.cooldown.reset(this.gun.cooldown);
	}

	render(ctx: Ctx, camera: Camera): void {
		renderHealth(ctx, camera, this);
		renderGun(ctx, camera, this);
	}
}
