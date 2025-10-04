import { Random } from 'canvas-lord/util/random';

export const SEEDS = {
	ENEMY_DROP: 999,
};

const globalRandom = new Random();

export const randomSpreadAngle = (angle: number, random = globalRandom) => {
	return random.float(angle) - angle / 2;
};
