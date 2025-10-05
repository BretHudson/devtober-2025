import type { ImageAsset } from 'canvas-lord/core/asset-manager';
import { ASSETS } from '~/util/assets';

export interface EnemyFlyweight {
	name: string;
	imageSrc: string;
	hitbox: number | [number, number];
	image: ImageAsset;

	viewRadius?: number;
}

const nullImage = null as unknown as ImageAsset;

const createEnemy = (
	name: EnemyFlyweight['name'],
	imageSrc: EnemyFlyweight['imageSrc'],
	hitbox: EnemyFlyweight['hitbox'],
	options: Partial<Omit<EnemyFlyweight, 'name' | 'imageSrc' | 'hitbox'>> = {},
): EnemyFlyweight => {
	return {
		name,
		imageSrc,
		hitbox,
		...options,
		image: nullImage,
	};
};

const mouseTrap = createEnemy('mouseTrap', ASSETS.GFX.MOUSE_TRAP_2, [48, 72]);
// const robovac = createEnemy('robovac', ASSETS.GFX.ROBOVAC, [200, 100]);
const robovac = createEnemy('robovac', ASSETS.GFX.ROBOVAC, 100);

export const ENEMIES = {
	MOUSE_TRAP: mouseTrap,
	ROBOVAC: robovac,
} as const;
