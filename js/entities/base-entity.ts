import { Entity } from 'canvas-lord/core/entity';
import type { GameScene } from '~/scenes/game-scene';

export class BaseEntity extends Entity<GameScene> {
	get player() {
		return this.scene.player;
	}

	deltaToPlayer() {
		return this.player?.pos.sub(this.pos);
	}

	removeSelf() {
		this.scene.removeEntity(this);
		this.scene.removeRenderable(this);
	}
}
