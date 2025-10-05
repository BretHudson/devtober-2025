export interface DamageInfo {
	damage: number;
}

declare global {
	interface Window {
		debugEnabled?: boolean;
	}

	// Kudos to ford04 (https://stackoverflow.com/a/63029283)
	type DropFirst<T extends unknown[]> = T extends [any, ...infer U]
		? U
		: never;
}
