import { Input } from 'canvas-lord';
import type { Entity } from 'canvas-lord/core/entity';
import { Scene } from 'canvas-lord/core/scene';
import type { Player } from '~/entities/player';

export class GameScene extends Scene {
	player: Player | null = null;
	cameraTarget: Entity | null = null;

	postUpdate(): void {
		if (this.cameraTarget) {
			const target = this.cameraTarget.pos;
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
