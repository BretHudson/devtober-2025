import { Text } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import type { Camera } from 'canvas-lord/util/camera';
import type { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';

export class Title extends Text {
	renderBG = false;

	constructor(str: string, y: number) {
		super(str, 0, y);

		this.align = 'center';
		this.baseline = 'middle';
		this.color = 'black';
	}

	render(ctx: Ctx, camera: Camera = Vec2.zero): void {
		if (this.renderBG) {
			let x = this.x - camera.x * this.scrollX;
			let y = this.y - camera.y * this.scrollY;
			if (this.relative) {
				x += this.parent?.x ?? 0;
				y += this.parent?.y ?? 0;
			}

			const paddingX = 5;
			const paddingY = 0;
			const { width } = this;

			const height = this.size;

			Draw.rect(
				ctx,
				{
					type: 'fill',
					color: '#ffffff88',
				},
				x - width / 2 - paddingX,
				y - height / 2 - paddingY,
				width + 2 * paddingX,
				height + 2 * paddingY,
			);
		}

		super.render(ctx, camera);
	}
}
