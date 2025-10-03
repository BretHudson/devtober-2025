import type { Input } from 'canvas-lord';
import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { BaseEntity } from '~/entities/base-entity';
import { COLLIDER_TAG } from '~/util/constants';

export class Projectile extends BaseEntity {
	timer = 60;
	dir: Vec2;
	speed: number;

	constructor(x: number, y: number, dir: Vec2, speed: number) {
		super(x, y);

		const sprite = Sprite.createRect(8, 8, 'white');
		sprite.centerOO();
		this.graphic = sprite;
		this.dir = dir;
		this.dir.normalize();
		this.speed = speed;

		const collider = new BoxCollider(8, 8);
		collider.tag = COLLIDER_TAG.PROJECTILE;
		collider.centerOO();
		this.collider = collider;

		this.colliderVisible = true;
	}

	update(): void {
		this.x += this.dir.x * this.speed;
		this.y += this.dir.y * this.speed;
	}

	postUpdate(_input: Input): void {
		if (--this.timer <= 0) {
			this.scene.removeEntity(this);
			this.scene.removeRenderable(this);
		}
	}
}
