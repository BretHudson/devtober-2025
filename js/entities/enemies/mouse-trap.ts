import { ENEMIES } from '~/data/enemies';
import { Enemy } from '~/entities/enemy';
import { COLLIDER_TAG } from '~/util/constants';

export class MouseTrap extends Enemy {
	activated = false;

	constructor(x: number, y: number) {
		super(x, y, ENEMIES.MOUSE_TRAP);
	}

	update(): void {
		super.update();

		if (
			!this.activated &&
			this.collide(this.x, this.y, COLLIDER_TAG.PLAYER)
		) {
			this.player.takeDamage({ damage: 1 }, this);
			this.activated = true;
		}
	}
}
