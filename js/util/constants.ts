export const COLLIDER_TAG = {
	PLAYER: 'player',
	ENEMY: 'enemy',
	PROJECTILE: 'projectile',
	ENEMY_PROJECTILE: 'enemy_projectile',
};

import type { Enemy } from '~/entities/enemy';
import type { Player } from '~/entities/player';

export type Owner = Player | Enemy;
