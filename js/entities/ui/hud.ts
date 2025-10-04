import { GraphicList, Sprite } from 'canvas-lord/graphic';
import { healthComponent } from '~/components/health';
import { BaseEntity } from '~/entities/base-entity';
import { DEPTH } from '~/util/constants';

const padding = 30;
export class HUD extends BaseEntity {
	get player() {
		return this.scene.player!;
	}

	get graphic(): GraphicList {
		return super.graphic as GraphicList;
	}

	set graphic(graphic: GraphicList) {
		super.graphic = graphic;
	}

	healthSprites: Sprite[] = [];

	constructor() {
		super();

		this.graphic = new GraphicList();
		this.depth = DEPTH.HUD;
	}

	addHealthSprite(index: number) {
		const x = index * padding;
		const health = Sprite.createCircle(20, 'white');
		health.x = x;
		health.x += 10;
		health.y += 10;
		health.scrollX = health.scrollY = 0;
		this.healthSprites.push(health);
		this.graphic.add(health);
	}

	postUpdate(): void {
		this.updateHealth();
	}

	updateHealth() {
		const health = this.player.component(healthComponent)!;

		while (health.max > this.healthSprites.length) {
			this.addHealthSprite(this.healthSprites.length);
		}

		this.healthSprites.forEach((sprite, i) => {
			sprite.color = health.cur > i ? 'red' : 'gray';
			sprite.visible = health.max > i;
		});
	}
}
