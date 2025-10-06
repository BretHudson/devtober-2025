import { Sfx } from 'canvas-lord/core/asset-manager';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { degToRad, radToDeg } from 'canvas-lord/math/misc';
import type { GunData } from '~/data/guns';
import { Actor } from '~/entities/actor';
import { Projectile } from '~/entities/projectile';
import { ASSETS } from '~/util/assets';
import { randomSpreadAngle } from '~/util/random';
import { playSound } from '~/util/sound';
import { Timer } from '~/util/timer';

export class GunComponent {
	data: GunData;
	sprite: Sprite;
	owner: Actor;
	cooldown = new Timer();
	reloadTimer = new Timer();

	ammo: number;
	ammoCapacity: number = 10;

	get shootPos(): Vec2 {
		let pos = this.data.origin.rotate(degToRad(this.sprite.angle));
		pos.x *= this.sprite.scaleX;
		return pos.add(new Vec2(this.sprite.x, this.sprite.y));
	}

	constructor(gun: GunData, owner: Actor) {
		this.data = gun;
		this.owner = owner;
		this.sprite = new Sprite(gun.image);
		this.owner.addGraphic(this.sprite);
		this.setGun(gun);

		this.ammo = 10;

		this.reloadTimer.onFinish.add(() => {
			playSound(ASSETS.SFX.WEAPONS.RELOAD_END, 0.2, 0.2);
			this.owner.reload(this);
		});
	}

	pickup(owner: Actor) {
		this.owner = owner;
		this.owner.addGraphic(this.sprite);
	}

	drop() {
		this.owner.removeGraphic(this.sprite);
		this.cooldown.stop();
		this.reloadTimer.stop();
	}

	tick() {
		this.cooldown.tick();
		this.reloadTimer.tick();
	}

	setGun(gun?: GunData) {
		if (gun) {
			this.data = gun;
			this.sprite.asset = gun.image;
			this.sprite.originY = this.sprite.height / 2;
		}

		this.sprite.visible = gun !== undefined;
	}

	update(): void {
		const { owner } = this;
		let offset = owner.aimDir.clone();
		offset.normalize();
		offset = offset.scale(this.data.armLength);

		this.sprite.x = offset.x;
		this.sprite.y = offset.y;

		this.sprite.angle = radToDeg(Math.atan2(offset.y, offset.x));

		this.sprite.scaleX = offset.x < 0 ? -1 : 1;
		if (this.sprite.scaleX < 0) this.sprite.angle = 180 - this.sprite.angle;
	}

	tryReload(): void {
		if (this.reloadTimer.running) return;

		const minAmmoNeeded = 1;
		if (this.owner.ammo < minAmmoNeeded) {
			// TODO(bret): add a failed sound effect
			return;
		}

		playSound(ASSETS.SFX.WEAPONS.RELOAD_START, 0.2, 0.2);
		this.reloadTimer.reset(60 * this.data.reloadTime);
	}

	shoot(target: Vec2): void {
		if (this.cooldown.running) return;

		if (this.ammo > 0) {
			const angleOffset = randomSpreadAngle(this.data.spreadAngle);
			const dir = target.rotate(degToRad(angleOffset));

			this.owner.scene.addEntity(
				new Projectile(this.owner, dir, this.data.projectile),
			);

			Sfx.play(this.data.audio, 0.2, 0.2);

			this.cooldown.reset(this.data.cooldown);
			--this.ammo;
		} else {
			this.tryReload();
		}
	}
}
