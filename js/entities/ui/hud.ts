import { GraphicList, Sprite, Text } from 'canvas-lord/graphic';
import { healthComponent } from '~/components/health';
import { BaseEntity } from '~/entities/base-entity';
import { DEPTH } from '~/util/constants';

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
	statusBGSprites: Sprite[] = [];
	statusSprites: Sprite[] = [];

	ammoText: Text;
	rocksText: Text;

	constructor() {
		super();

		this.graphic = new GraphicList();
		this.depth = DEPTH.HUD;

		this.addStatusSprite(0);
		this.addStatusSprite(1);
		this.addStatusSprite(2);

		const ammoText = this.addGraphic(new Text('AMMO', 10, 50));
		ammoText.scrollX = 0;
		ammoText.scrollY = 0;
		this.ammoText = ammoText;

		const rocksText = this.addGraphic(new Text('ROCKS', 10, 50 + 30));
		rocksText.scrollX = 0;
		rocksText.scrollY = 0;
		this.rocksText = rocksText;
	}

	addHealthSprite(index: number) {
		const padding = 30;
		const x = index * padding;
		const health = Sprite.createCircle(20, 'white');
		health.x = x;
		health.x += 10;
		health.y += 10;
		health.scrollX = health.scrollY = 0;
		this.healthSprites.push(health);
		this.graphic.add(health);
	}

	addStatusSprite(index: number) {
		const padding = 18;
		const x = 10;
		const y = 10 + 30 + index * padding;

		const bg = Sprite.createRect(100, 10, 'black');
		bg.x = x;
		bg.y = y;
		bg.scrollX = bg.scrollY = 0;
		this.statusBGSprites.push(bg);

		const status = Sprite.createRect(100 - 4, 10 - 4, 'white');
		status.x = x + 2;
		status.y = y + 2;
		status.scrollX = status.scrollY = 0;
		this.statusSprites.push(status);

		this.graphic.add(bg, status);
	}

	postUpdate(): void {
		this.updateHealth();
		this.updateStatuses();
		this.updateAmmo();
		this.updateRocks();
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

	updateStatuses() {
		const { statuses } = this.player;
		this.statusSprites.forEach((sprite, i) => {
			const bg = this.statusBGSprites[i];
			const status = statuses[i];
			if (status === undefined) {
				sprite.visible = bg.visible = false;
				return;
			}
			sprite.visible = bg.visible = true;
			sprite.color = status.powerup.color as string;

			sprite.scaleX = status.timer.percentLeft;
		});
		statuses.forEach((status, i) => {});
	}

	updateAmmo() {
		const { ammo, gun } = this.player;
		const str = [
			//
			'Ammo:',
			gun?.ammo ?? '-',
			`(${ammo} remaining)`,
			,
		].join(' ');
		this.ammoText.str = str;
	}

	updateRocks() {
		const { rock: rocks } = this.player;
		const str = ['Rocks:', rocks].join(' ');
		this.rocksText.str = str;
	}
}
