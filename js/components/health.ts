import { Ctx } from 'canvas-lord/util/canvas';
import { createComponent } from 'canvas-lord/util/components';
import { Draw } from 'canvas-lord/util/draw';
import { BaseEntity } from '~/entities/base-entity';
import { positionItemInRow } from '~/util/math';

export const healthComponent = createComponent({
	max: 3,
	cur: 3,
});

export const renderHealth = (ctx: Ctx, entity: BaseEntity) => {
	const health = entity.component(healthComponent);
	if (!health) {
		console.warn('this entity does not have a health component');
		return;
	}

	const size = 4;
	const padding = 6;

	const drawY = entity.y - 24;
	for (let i = 0; i < health.max; ++i) {
		Draw.circle(
			ctx,
			{
				color: i < health.cur ? 'red' : 'gray',
				originX: size,
				originY: size,
			},
			entity.x + positionItemInRow(i, health.max, size, padding),
			drawY,
			size,
		);
	}
};
