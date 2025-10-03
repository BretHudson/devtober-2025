import { Entity } from 'canvas-lord/core/entity';
import { GameScene } from '~/.';

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
