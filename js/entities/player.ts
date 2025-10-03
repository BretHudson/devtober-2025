import type { Input, Key } from 'canvas-lord';
import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { healthComponent, renderHealth } from '~/components/health';
import { BaseEntity } from '~/entities/base-entity';
import { Projectile } from '~/entities/projectile';
import { COLLIDER_TAG } from '~/util/constants';

function getAxis(input: Input, neg: Key[], pos: Key[]) {
	return +input.keyCheck(pos) - +input.keyCheck(neg);
}

const leftKeys: Key[] = ['ArrowLeft', 'KeyA'];
const rightKeys: Key[] = ['ArrowRight', 'KeyD'];
const upKeys: Key[] = ['ArrowUp', 'KeyW'];
const downKeys: Key[] = ['ArrowDown', 'KeyS'];

export class Player extends BaseEntity {
	aim = Vec2.zero;
	cooldown = 0;

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

		this.aim = input.mouse.pos;

		if (input.mouseCheck()) {
			this.shoot(this.aim);
		}

		const bullet = this.collideEntity<Projectile>(
			this.x,
			this.y,
			COLLIDER_TAG.ENEMY_PROJECTILE,
		);

		if (bullet) {
			bullet.removeSelf();

			const health = this.component(healthComponent)!;
			if (--health.cur <= 0) {
				this.scene.removePlayer();
				return;
			}
		}
	}

	shoot(target: Vec2) {
		if (this.cooldown > 0) return;

		this.scene.addEntity(new Projectile(this, target.sub(this.pos), 6));

		this.cooldown = 10;
	}

	render(ctx: Ctx): void {
		renderHealth(ctx, this);

		const r = 20;
		Draw.circle(
			ctx,
			{
				color: 'yellow',
				type: 'stroke',
			},
			this.aim.x - r,
			this.aim.y - r,
			r,
		);
	}
}
