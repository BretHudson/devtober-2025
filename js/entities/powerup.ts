import { Sprite } from 'canvas-lord/graphic/sprite';
import { BaseEntity } from './base-entity';
import { CircleCollider } from 'canvas-lord/collider';
import { COLLIDER_TAG } from '~/util/constants';

export const POWERUP = {
	HEAL: 'heal',
	SPEED_UP: 'speed-up',
} as const;

type PowerupType = (typeof POWERUP)[keyof typeof POWERUP];

export class Powerup extends BaseEntity {
	type: PowerupType;

	constructor(type: PowerupType, x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createCircle(16, 'white');
		sprite.centerOO();
		this.graphic = sprite;

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.POWERUP;
		this.collider = collider;
		this.colliderVisible = true;

		this.type = type;

		switch (type) {
			case POWERUP.HEAL:
				sprite.color = 'red';
				break;
			case POWERUP.SPEED_UP: {
				sprite.color = '#77f';
				break;
			}
			default:
				throw new Error(`unsupported powerup "${type}"`);
		}
	}
}
