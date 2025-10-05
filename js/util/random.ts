import { Random } from 'canvas-lord/util/random';

export const SEEDS = {
	ENEMY_DROP: 999,
	ROBOVAC_INIT: 777,
};

const globalRandom = new Random();

export const randomSpreadAngle = (angle: number, random = globalRandom) => {
	return random.float(angle) - angle / 2;
};
