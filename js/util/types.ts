export interface DamageInfo {
	damage: number;
}

declare global {
	interface Window {
		debugEnabled?: boolean;
	}
}
