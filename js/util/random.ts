import { Random } from 'canvas-lord/util/random';
import { settings } from './assets';

export const SEEDS = {
	ENEMY_DROP: settings.seed ? 999 : undefined,
	ROBOVAC_INIT: settings.seed ? 777 : undefined,
};

const globalRandom = new Random(settings.seed);

export const randomSpreadAngle = (angle: number, random = globalRandom) => {
	return random.float(angle) - angle / 2;
};
