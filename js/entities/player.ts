import type { Input, Key } from 'canvas-lord';
import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent, renderHealth } from '~/components/health';
import { GunData, renderGun, revolver } from '~/data/guns';
import { BaseEntity } from '~/entities/base-entity';
import type { Gun } from '~/entities/gun';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG, DEPTH } from '~/util/constants';
import { POWERUP, Powerup } from './powerup';

function getAxis(input: Input, neg: Key[], pos: Key[]) {
	return +input.keyCheck(pos) - +input.keyCheck(neg);
}

const leftKeys: Key[] = ['ArrowLeft', 'KeyA'];
const rightKeys: Key[] = ['ArrowRight', 'KeyD'];
const upKeys: Key[] = ['ArrowUp', 'KeyW'];
const downKeys: Key[] = ['ArrowDown', 'KeyS'];

export class Player extends BaseEntity {
	aim = Vec2.one;
	cooldown = 0;
	gun: GunData;

	constructor(x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createRect(32, 32, 'cyan');
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new BoxCollider(32, 32);
		collider.tag = COLLIDER_TAG.PLAYER;
		collider.centerOO();
		this.collider = collider;
		this.colliderVisible = true;

		this.addComponent(healthComponent);

		this.gun = revolver;

		this.depth = DEPTH.PLAYER;
	}

	get health() {
		const health = this.component(healthComponent);
		if (!health) throw new Error('does not have health');
		return health;
	}

	preUpdate(): void {
		this.cooldown--;
	}

	update(input: Input): void {
		const hInput = getAxis(input, leftKeys, rightKeys);
		const vInput = getAxis(input, upKeys, downKeys);

		const move = new Vec2(hInput, vInput);
		if (move.magnitude > 0) move.normalize();

		this.x += move.x * 3;
		this.y += move.y * 3;

		this.aim = input.mouse.pos.add(this.scene.camera);

		if (input.mouseCheck()) {
			this.shoot(this.aim);
		}

		const gun = this.collideEntity<Gun>(this.x, this.y, COLLIDER_TAG.GUN);
		if (gun && input.keyPressed('KeyE')) {
			this.gun = gun.gunData;
			this.cooldown = 0;
		}

		const powerup = this.collideEntity<Powerup>(
			this.x,
			this.y,
			COLLIDER_TAG.POWERUP,
		);
		if (powerup) this.processPowerup(powerup);

		const bullet = this.collideEntity<Projectile>(
			this.x,
			this.y,
			COLLIDER_TAG.ENEMY_PROJECTILE,
		);
		if (bullet) {
			bullet.removeSelf();
			this.health.cur -= bullet.type.damage;
			if (this.health.cur <= 0) {
				this.scene.removePlayer();
				return;
			}
		}
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
			default:
				throw new Error(`unsupported powerup "${powerup.type}"`);
		}

		if (consumed) powerup.removeSelf();
	}

	shoot(target: Vec2) {
		if (this.cooldown > 0) return;

		this.scene.addEntity(
			new Projectile(this, target.sub(this.pos), this.gun.projectile),
		);

		this.cooldown = this.gun.cooldown;
	}

	render(ctx: Ctx, camera: Camera): void {
		renderHealth(ctx, camera, this);
		renderGun(ctx, camera, this);

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
