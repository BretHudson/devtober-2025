import { Entity } from 'canvas-lord/core/entity';

export class BaseEntity extends Entity {
	removeSelf() {
		this.scene.removeEntity(this);
		this.scene.removeRenderable(this);
	}
}
