import type { BoxCollider } from 'canvas-lord/collider';
import { Vec2 } from 'canvas-lord/math';
import { Camera } from 'canvas-lord/util/camera';
import { Ctx } from 'canvas-lord/util/canvas';
import { createComponent } from 'canvas-lord/util/components';
import { Draw } from 'canvas-lord/util/draw';
import { Actor } from '~/entities/actor';
import { positionItemInRow } from '~/util/math';

export const healthComponent = createComponent({
	max: 3,
	cur: 3,
});

export const renderHealth = (ctx: Ctx, camera: Camera, entity: Actor) => {
	const { health } = entity;
	if (!health) {
		console.warn('this entity does not have a health component');
		return;
	}

	const drawPos = new Vec2(entity.x, entity.y).sub(camera);
	drawPos.y -= (entity.collider as BoxCollider).height / 2;

	const size = 4;
	const padding = 6;

	for (let i = 0; i < health.max; ++i) {
		Draw.circle(
			ctx,
			{
				color: i < health.cur ? 'red' : 'gray',
				originX: size,
				originY: size,
			},
			drawPos.x + positionItemInRow(i, health.max, size, padding),
			drawPos.y,
			size,
		);
	}
};
