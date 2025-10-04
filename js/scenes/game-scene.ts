import type { Entity } from 'canvas-lord/core/entity';
import { Scene } from 'canvas-lord/core/scene';
import type { Player } from '~/entities/player';

export class GameScene extends Scene {
	player: Player | null = null;
	cameraTarget: Entity | null = null;

	postUpdate(): void {
		if (this.cameraTarget) {
			let target = this.cameraTarget.pos;

			// TODO(bret): this is so hacked together lmao
			if (this.cameraTarget && this.cameraTarget === this.player) {
				target = target.add(
					this.player.aim.sub(this.player.pos).scale(0.1),
				);
			}

			this.camera.x = target.x - this.engine.halfWidth;
			this.camera.y = target.y - this.engine.halfHeight;
		}
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
