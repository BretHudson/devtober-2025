import { CircleCollider } from 'canvas-lord/collider';
import { ImageAsset } from 'canvas-lord/core/asset-manager';
import { GraphicList } from 'canvas-lord/graphic';
import { Sprite } from 'canvas-lord/graphic/sprite';
import { CSSColor } from 'canvas-lord/util/types';
import { BaseEntity } from '~/entities/base-entity';
import { assetManager, ASSETS } from '~/util/assets';
import { COLLIDER_TAG } from '~/util/constants';
import { globalRandom } from '~/util/random';
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
	// pick ups
	HEAL: {
		name: 'Heal',
		color: 'red',
		type: 'one-time',
	} as PowerupData,
	AMMO: {
		name: 'Ammo',
		color: 'silver',
		type: 'one-time',
	} as PowerupData,
	ROCK: {
		name: 'Rock',
		color: 'brown',
		type: 'one-time',
	} as PowerupData,

	// statuses
	SPEED_UP: {
		name: 'Speed Up',
		color: '#77f',
		type: 'status',
		duration: 5,
		stacks: false,
	} as PowerupData,
	INVINCIBILITY: {
		name: 'Invincibility',
		// color: '#d7c823',
		color: 'deeppink',
		type: 'status',
		duration: 5,
		stacks: false,
	} as PowerupData,
} as const;

export class Powerup extends BaseEntity {
	type: PowerupData;

	bgSprite: Sprite;
	fgSprite: Sprite;

	time = 0;

	constructor(type: PowerupData, x: number, y: number, asset?: ImageAsset) {
		super(x, y);

		const bg = assetManager.sprites.get(ASSETS.GFX.ITEMS.POWERUP_BG)!;
		const fg =
			asset ?? assetManager.sprites.get(ASSETS.GFX.ITEMS.POWERUP_FG)!;

		this.bgSprite = new Sprite(bg);
		this.bgSprite.centerOO();
		this.fgSprite = new Sprite(fg);
		this.fgSprite.centerOO();

		this.graphic = new GraphicList(this.bgSprite, this.fgSprite);

		this.addGraphic(createTitle(type.name));

		const collider = new CircleCollider(16);
		collider.tag = COLLIDER_TAG.POWERUP;
		this.collider = collider;
		this.colliderVisible = true;

		this.type = type;

		if (!asset) this.fgSprite.color = type.color as string;
		collider.color = type.color;

		this.time = globalRandom.float(5);

		this.bgSprite.angle = globalRandom.float(360);
	}

	update(): void {
		this.time += 0.05;
		this.bgSprite.scale = 1.3 + Math.sin(this.time) * 0.1;

		this.bgSprite.angle += 0.5;
	}
}
