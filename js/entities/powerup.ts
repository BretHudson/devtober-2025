import { Sprite } from 'canvas-lord/graphic/sprite';
import { BaseEntity } from './base-entity';
import { CircleCollider } from 'canvas-lord/collider';
import { COLLIDER_TAG } from '~/util/constants';

export const POWERUP = {
	HEAL: 'heal',
} as const;

type PowerupType = (typeof POWERUP)[keyof typeof POWERUP];

export class Powerup extends BaseEntity {
	type: PowerupType;

	constructor(type: PowerupType, x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createCircle(16, 'red');
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.POWERUP;
		this.collider = collider;
		this.colliderVisible = true;

		this.type = type;
	}
}
