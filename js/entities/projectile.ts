import { CircleCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import type { Vec2 } from 'canvas-lord/math';
import { radToDeg } from 'canvas-lord/math/misc';
import {
	ProjectileFlyweight,
	ProjectileType,
	projectiles,
} from '~/data/projectiles';
import type { Actor } from '~/entities/actor';
import { BaseEntity } from '~/entities/base-entity';
import { COLLIDER_TAG, DEPTH } from '~/util/constants';
import { Timer } from '~/util/timer';

export class Projectile extends BaseEntity {
	timer: Timer;
	dir: Vec2;
	speed: number;
	owner: Actor;
	type: ProjectileFlyweight;

	imageAngle = 0;
	startAngle = 0;

	get sprite() {
		return this.graphic as Sprite;
	}

	constructor(owner: Actor, dir: Vec2, typeName: ProjectileType) {
		const pos = owner.pos.add(owner.gunGfx!.shootPos);
		super(pos.x, pos.y);

		const type = projectiles.get(typeName);
		if (!type) throw new Error(`Missing ${typeName} projectile type`);

		this.type = type;

		// timer logic
		this.timer = new Timer(60 * type.duration);
		this.timer.onFinish.add(() => {
			this.removeSelf();
		});
		this.onPostUpdate.add(() => this.timer.tick());

		let sprite: Sprite;
		if (type.image) {
			sprite = new Sprite(type.image);
		} else {
			sprite = Sprite.createCircle(type.size, type.color);
		}
		sprite.centerOO();
		this.startAngle = radToDeg(Math.atan2(dir.y, dir.x));
		this.graphic = sprite;

		this.owner = owner;

		this.dir = dir;
		this.dir.normalize();
		this.speed = type.speed;

		const collider = new CircleCollider(type.size / 2);
		// TODO(bret): this is hacky af
		collider.tag =
			owner.collider?.tag === COLLIDER_TAG.ENEMY
				? COLLIDER_TAG.ENEMY_PROJECTILE
				: COLLIDER_TAG.PROJECTILE;
		// collider.centerOO();
		this.collider = collider;

		this.colliderVisible = true;

		this.depth = DEPTH.PROJECTILE;
	}

	update(): void {
		this.x += this.dir.x * this.speed;
		this.y += this.dir.y * this.speed;

		if (this.collide(this.x, this.y, COLLIDER_TAG.WALL)) this.hitWall();

		this.imageAngle += this.type.rotate;
		let segments = 10;
		let span = 360 / segments;
		this.sprite.angle =
			this.startAngle + Math.floor(this.imageAngle / span) * span;
	}

	hitActor(): void {
		this.removeSelf();
	}

	hitWall(): void {
		this.removeSelf();
	}
}
