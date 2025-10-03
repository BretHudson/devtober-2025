import type { Input } from 'canvas-lord';
import { BoxCollider } from 'canvas-lord/collider';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { ProjectileType, projectiles } from '~/data/projectiles';
import { BaseEntity } from '~/entities/base-entity';
import { COLLIDER_TAG, Owner } from '~/util/constants';

export class Projectile extends BaseEntity {
	timer = 60;
	dir: Vec2;
	speed: number;
	owner: Owner;

	constructor(owner: Owner, dir: Vec2, typeName: ProjectileType) {
		super(owner.x, owner.y);

		const type = projectiles.get(typeName);
		if (!type) throw new Error(`Missing ${typeName} projectile type`);

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

	postUpdate(_input: Input): void {
		if (--this.timer <= 0) {
			this.scene.removeEntity(this);
			this.scene.removeRenderable(this);
		}
	}
}
