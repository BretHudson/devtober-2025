import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import {
	ProjectileFlyweight,
	ProjectileType,
	projectiles,
} from '~/data/projectiles';
import type { Actor } from '~/entities/actor';
import { BaseEntity } from '~/entities/base-entity';
import { COLLIDER_TAG } from '~/util/constants';
import { Timer } from '~/util/timer';

export class Projectile extends BaseEntity {
	timer: Timer;
	dir: Vec2;
	speed: number;
	owner: Actor;
	type: ProjectileFlyweight;

	constructor(owner: Actor, dir: Vec2, typeName: ProjectileType) {
		super(owner.x, owner.y);

		const type = projectiles.get(typeName);
		if (!type) throw new Error(`Missing ${typeName} projectile type`);

		this.type = type;

		// timer logic
		this.timer = new Timer(60);
		this.timer.onFinish.add(() => {
			this.removeSelf();
		});
		this.onPostUpdate.add(() => this.timer.tick());

		const sprite = Sprite.createRect(8, 8, type.color);
		sprite.centerOO();
		this.graphic = sprite;

		this.owner = owner;

		this.dir = dir;
		this.dir.normalize();
		this.speed = type.speed;

		const collider = new BoxCollider(8, 8);
		// TODO(bret): this is hacky af
		collider.tag =
			owner.collider?.tag === COLLIDER_TAG.ENEMY
				? COLLIDER_TAG.ENEMY_PROJECTILE
				: COLLIDER_TAG.PROJECTILE;
		collider.centerOO();
		this.collider = collider;

		this.colliderVisible = true;
	}

	update(): void {
		this.x += this.dir.x * this.speed;
		this.y += this.dir.y * this.speed;
	}

	hitActor(): void {
		this.removeSelf();
	}

	hitWall(): void {
		this.removeSelf();
	}
}
