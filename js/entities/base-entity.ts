import { Entity } from 'canvas-lord/core/entity';
import { Vec2 } from 'canvas-lord/math';
import type { GameScene } from '~/scenes/game-scene';
import { onUpdateHandleShowHitbox } from '~/util/assets';

export class BaseEntity extends Entity<GameScene> {
	get player() {
		return this.scene.player;
	}

	get isPlayerAlive() {
		return this.scene.player.alive;
	}

	added(): void {
		this.onUpdate.add(onUpdateHandleShowHitbox(this));
	}

	deltaToPlayer() {
		return Vec2.sub(this.player.pos, this.pos);
	}

	removeSelf() {
		this.scene.removeEntity(this);
		this.scene.removeRenderable(this);
	}
}
