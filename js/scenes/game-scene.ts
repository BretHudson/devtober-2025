import { GridCollider } from 'canvas-lord/collider';
import { Entity } from 'canvas-lord/core/entity';
import { Input, Keys } from 'canvas-lord/core/input';
import { Scene } from 'canvas-lord/core/scene';
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
import { renderPattern } from '~/util/background-pattern';
import { COLLIDER_TAG, FONTS } from '~/util/constants';
import { positionItemInRow } from '~/util/math';

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
	// @ts-expect-error - this gets assigned, dw
	player: Player;
	cameraTarget: Entity | null = null;

	inventory = new Inventory();

	constructor() {
		super();

		const SIZE = 32;
		const col = 50;
		const row = 40;
		this.bounds = [-col, -row, col, row].map(
			(v) => (v * SIZE) / 2,
		) as Exclude<typeof this.bounds, null>;

		const grid = new Grid(col * SIZE, row * SIZE, SIZE, SIZE);
		for (let x = 0; x < col; ++x) {
			grid.setTile(x, 0, 1);
			grid.setTile(x, row - 1, 1);
		}
		for (let y = 0; y < row; ++y) {
			grid.setTile(0, y, 1);
			grid.setTile(col - 1, y, 1);
		}
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
	}

	begin(): void {
		const quarterSize = new Vec2(
			this.engine.width,
			this.engine.height,
		).invScale(4);

		const { enemyGun, revolver, rock } = allGunData;

		this.addEntity(new HUD());

		this.player = new Player(0, 0, revolver);
		this.addEntity(this.player);
		this.follow(this.player);

		this.addEntity(new Powerup(POWERUP.INVINCIBILITY, 0, quarterSize.y));
		this.addEntity(new Powerup(POWERUP.SPEED_UP, 0, -quarterSize.y));

		this.addEntity(
			new Enemy(quarterSize.x, quarterSize.y, ENEMIES.ROBOVAC),
		);
		this.addEntity(
			new Enemy(quarterSize.x, -quarterSize.y, ENEMIES.MOUSE_TRAP),
		);
		this.addEntity(
			new Enemy(-quarterSize.x, -quarterSize.y, ENEMIES.MOUSE_TRAP),
		);
		this.addEntity(
			new Enemy(-quarterSize.x, quarterSize.y, ENEMIES.ROBOVAC),
		);

		Object.values(allGunData).forEach((g, i, arr) => {
			const x = positionItemInRow(i, arr.length, 16, 48);
			const y = quarterSize.y * 2 + (i % 2 ? 64 : 0);
			this.addEntity(new Gun(g, x, y));
		});

		const ammoPickups = 20;
		for (let i = 0; i < ammoPickups; ++i) {
			const x = positionItemInRow(i, ammoPickups, 16, 32);
			this.addEntity(new Powerup(POWERUP.AMMO, x, quarterSize.y * 3));
		}

		this.onRender.add(renderPattern(this));

		this.updateCamera();
	}

	update(input: Input): void {
		if (this.player.dead && input.keyPressed(Keys.R)) {
			this.engine.popScenes();
			this.engine.pushScene(new GameScene());
		}
	}

	postUpdate(): void {
		this.updateCamera();
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
