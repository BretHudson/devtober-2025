import type { Entity } from 'canvas-lord/core/entity';
import { Scene } from 'canvas-lord/core/scene';
import type { Player } from '~/entities/player';

export class GameScene extends Scene {
	player: Player | null = null;
	cameraTarget: Entity | null = null;

	constructor() {
		super();

		this.bounds = [-400, -300, 400, 300];
	}

	postUpdate(): void {
		this.updateCamera();
	}

	updateCamera() {
		let newX = this.camera.x;
		let newY = this.camera.y;
		if (this.cameraTarget) {
			let target = this.cameraTarget.pos;

			// TODO(bret): this is so hacked together lmao
			if (this.cameraTarget && this.cameraTarget === this.player) {
				const offset = this.player.aim.sub(this.player.pos).scale(0.1);
				offset.y *= 16 / 9;
				target = target.add(offset);
			}

			newX = target.x;
			newY = target.y;
		}

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
	}

	follow(entity: Entity) {
		this.cameraTarget = entity;
	}
}
