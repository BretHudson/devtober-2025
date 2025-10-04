import { Sprite } from 'canvas-lord/graphic/sprite';
import { BaseEntity } from './base-entity';
import { CircleCollider } from 'canvas-lord/collider';
import { COLLIDER_TAG } from '~/util/constants';
import { CSSColor } from 'canvas-lord/util/types';
import { createTitle } from '~/util/ui';

export type PowerupData = {
	name: string;
	color: CSSColor;
} & (
	| {
			type: 'one-time';
	  }
	| {
			type: 'status';
			duration: number;
			stacks: boolean;
	  }
);

export const POWERUP = {
	HEAL: {
		//
		name: 'Heal',
		color: 'red',
		type: 'one-time',
	} as PowerupData,
	SPEED_UP: {
		//
		name: 'Speed Up',
		color: '#77f',
		type: 'status',
		duration: 5, // seconds
		stacks: false,
	} as PowerupData,
} as const;

export class Powerup extends BaseEntity {
	type: PowerupData;

	constructor(type: PowerupData, x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createCircle(16, 'white');
		sprite.centerOO();
		this.graphic = sprite;

		this.addGraphic(createTitle(type.name));

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.POWERUP;
		this.collider = collider;
		this.colliderVisible = true;

		this.type = type;

		sprite.color = type.color as string;
		collider.color = type.color;
	}
}
