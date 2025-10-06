import { GridCollider } from 'canvas-lord/collider';
import { Entity } from 'canvas-lord/core/entity';
import { Input, Keys } from 'canvas-lord/core/input';
import { Scene } from 'canvas-lord/core/scene';
import { NineSlice, Sprite, TiledSprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { Grid } from 'canvas-lord/util/grid';
import { ENEMIES } from '~/data/enemies';
import { allGunData } from '~/data/guns';
import { Enemy } from '~/entities/enemy';
import { Gun } from '~/entities/gun';
import { Player } from '~/entities/player';
import { POWERUP, Powerup } from '~/entities/powerup';
import { HUD } from '~/entities/ui/hud';
import { assetManager, ASSETS } from '~/util/assets';
import { renderPattern } from '~/util/background-pattern';
import { COLLIDER_TAG, DEPTH, FONTS } from '~/util/constants';
import { LDtk } from '~/util/types';

const types = [
	//
	['ammo', 99],
] as const;
type InventoryItemType = (typeof types)[number][0];
interface ItemData {
	quantity: number;
	max: number;
}

class Inventory {
	items: Record<InventoryItemType, ItemData>;

	constructor() {
		this.items = types.reduce(
			(map, [k, max]) => ((map[k] = { quantity: 0, max }), map),
			{} as typeof this.items,
		);
	}
}

export class GameScene extends Scene {
	player!: Player;
	cameraTarget: Entity | null = null;

	inventory = new Inventory();

	ldtkData: LDtk.Data;

	constructor(ldtkData: LDtk.Data) {
		super();

		// load level data
		this.ldtkData = ldtkData;
		const [level] = ldtkData.levels;
		if (!level) throw new Error('no levels found');

		const { pxWid, pxHei } = level;
		const layers = level.layerInstances;
		const gridLayer = layers.find((layer) => layer.__type === 'IntGrid');
		if (!gridLayer) throw new Error('Missing IntGrid layer');

		// set bounds
		const SIZE = 32;
		this.bounds = [-pxWid, -pxHei, pxWid, pxHei].map(
			(v) => v / 2,
		) as Exclude<typeof this.bounds, null>;

		// create grid
		const grid = Grid.fromArray(
			gridLayer.intGridCsv,
			pxWid,
			pxHei,
			SIZE,
			SIZE,
		);
		const walls = new Entity();
		const wallCollider = new GridCollider(
			grid,
			this.bounds[0],
			this.bounds[1],
		);
		wallCollider.tag = COLLIDER_TAG.WALL;
		walls.collider = wallCollider;
		walls.colliderVisible = true;
		this.addEntity(walls);

		grid.renderMode = Grid.RenderMode.BOXES;

		// add carpet & crown molding graphics
		const carpet = assetManager.sprites.get(ASSETS.GFX.CARPET)!;
		this.addGraphic(new TiledSprite(carpet)).depth = DEPTH.FLOOR;

		const crownMolding = assetManager.sprites.get(
			ASSETS.GFX.CROWN_MOLDING,
		)!;
		this.addGraphic(
			new NineSlice(crownMolding, -pxWid / 2, -pxHei / 2, pxWid, pxHei),
		);
	}

	begin(): void {
		const { revolver } = allGunData;

		this.addEntity(new HUD());

		this.player = new Player(0, 0, revolver);
		this.addEntity(this.player);
		this.follow(this.player);

		this.onRender.add(renderPattern(this));

		const [level] = this.ldtkData.levels;
		const layers = level.layerInstances;
		const entitiesLayer = layers.find(
			(layer) => layer.__type === 'Entities',
		);
		if (!entitiesLayer) throw new Error('Missing Entities layer');

		entitiesLayer.entityInstances.forEach((entity) => {
			let [x, y] = entity.px;
			x -= this.bounds![2];
			y -= this.bounds![3];

			switch (entity.__identifier) {
				case 'Player':
					break;

				case 'MouseTrap':
					this.addEntity(new Enemy(x, y, ENEMIES.MOUSE_TRAP));
					break;

				case 'Robovac':
					this.addEntity(new Enemy(x, y, ENEMIES.ROBOVAC));
					break;

				case 'Gun': {
					let value = entity.fieldInstances.find(
						(field) => field.__identifier === 'Type',
					)!.__value;
					value =
						value.substring(0, 1).toLowerCase() +
						value.substring(1);
					const type = allGunData[value as keyof typeof allGunData];
					this.addEntity(new Gun(type, x, y));
					break;
				}

				case 'Powerup': {
					const typeField = entity.fieldInstances.find(
						(field) => field.__identifier === 'Type',
					)!;
					const type =
						POWERUP[typeField.__value as keyof typeof POWERUP];
					this.addEntity(new Powerup(type, x, y));
					break;
				}

				default:
					console.warn(
						`Entity "${entity.__identifier}" not yet supported`,
					);
			}
		});

		this.updateCamera();
	}

	update(input: Input): void {
		if (this.player.dead && input.keyPressed(Keys.R)) {
			this.engine.popScenes();
			this.engine.pushScene(new GameScene(this.ldtkData));
		}
	}

	postUpdate(): void {
		this.updateCamera();
	}

	// NOTE(bret): please don't do this folks
	renderInternal(ctx: Ctx) {
		// draw the carpet

		super.renderInternal(ctx);
	}

	render(ctx: Ctx): void {
		if (this.player.dead) {
			Draw.text(
				ctx,
				{
					color: 'white',
					type: 'fill',
					size: 48,
					font: FONTS.SKULLBOY,
					align: 'center',
					baseline: 'middle',
				},
				this.engine.halfWidth,
				this.engine.halfHeight,
				'Press R to Restart',
			);
		}
	}

	updateCamera() {
		const { cameraTarget } = this;

		if (!cameraTarget) return;

		let newX = this.camera.x;
		let newY = this.camera.y;

		let offset = Vec2.zero;
		// TODO(bret): this is so hacked together lmao
		if (cameraTarget === this.player) {
			offset = this.player.aimDir.scale(0.1);
			offset.y *= 16 / 9;
		}

		const target = cameraTarget.pos.add(offset);

		newX = target.x;
		newY = target.y;

		if (this.bounds) {
			newX = Math.clamp(
				newX,
				this.bounds[0] + this.engine.halfWidth,
				this.bounds[2] - this.engine.halfWidth,
			);
			newY = Math.clamp(
				newY,
				this.bounds[1] + this.engine.halfHeight,
				this.bounds[3] - this.engine.halfHeight,
			);
		}

		this.camera.x = Math.round(newX - this.engine.halfWidth);
		this.camera.y = Math.round(newY - this.engine.halfHeight);
	}

	removePlayer() {
		this.player.removeSelf();
		this.cameraTarget = null;
	}

	follow(entity: Entity) {
		this.cameraTarget = entity;
	}
}
