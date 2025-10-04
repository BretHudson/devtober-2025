import type { Entity } from 'canvas-lord/core/entity';
import { Input, Keys } from 'canvas-lord/core/input';
import { Scene } from 'canvas-lord/core/scene';
import { Vec2 } from 'canvas-lord/math';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';
import { allGunData } from '~/data/guns';
import { Enemy } from '~/entities/enemy';
import { Gun } from '~/entities/gun';
import { Player } from '~/entities/player';
import { POWERUP, Powerup } from '~/entities/powerup';
import { renderPattern } from '~/util/background-pattern';
import { FONTS } from '~/util/constants';
import { positionItemInRow } from '~/util/math';

export class GameScene extends Scene {
	player: Player | null = null;
	cameraTarget: Entity | null = null;

	constructor() {
		super();

		this.bounds = [-400, -300, 400, 300];
	}

	begin(): void {
		const fourth = new Vec2(this.engine.width, this.engine.height).invScale(
			4,
		);

		const { enemyGun, machineGun, revolver, rifle } = allGunData;

		this.player = new Player(0, 0, revolver);
		this.addEntity(this.player);
		this.follow(this.player);

		this.addEntity(new Powerup(POWERUP.HEAL, 0, -fourth.y * 1.2));
		this.addEntity(new Powerup(POWERUP.SPEED_UP, 0, -fourth.y * 0.9));

		this.addEntity(new Enemy(fourth.x, fourth.y, enemyGun));
		this.addEntity(new Enemy(fourth.x, -fourth.y, enemyGun));
		this.addEntity(new Enemy(-fourth.x, -fourth.y, enemyGun));
		this.addEntity(new Enemy(-fourth.x, fourth.y, enemyGun));

		[revolver, machineGun, rifle].forEach((g, i) => {
			const x = positionItemInRow(i, 3, 16, 48);
			this.addEntity(new Gun(g, x, fourth.y * 1.3));
		});

		this.onRender.add(renderPattern(this));

		this.updateCamera();
	}

	get playerDead() {
		return this.player === null;
	}

	update(input: Input): void {
		if (this.playerDead && input.keyPressed(Keys.R)) {
			this.engine.popScenes();
			this.engine.pushScene(new GameScene());
		}
	}

	postUpdate(): void {
		this.updateCamera();
	}

	render(ctx: Ctx): void {
		if (this.playerDead) {
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
			offset = this.player.aim.sub(this.player.pos).scale(0.1);
			offset.y *= 16 / 9;
		}

		const target = cameraTarget.pos.add(offset);

		newX = target.x;
		newY = target.y;

		if (this.bounds) {
			newX = Math.clamp(newX, this.bounds[0], this.bounds[2]);
			newY = Math.clamp(newY, this.bounds[1], this.bounds[3]);
		}

		this.camera.x = newX - this.engine.halfWidth;
		this.camera.y = newY - this.engine.halfHeight;
	}

	removePlayer() {
		if (!this.player) return;

		this.player.removeSelf();
		this.player = null;
		this.cameraTarget = null;
	}

	follow(entity: Entity) {
		this.cameraTarget = entity;
	}
}
