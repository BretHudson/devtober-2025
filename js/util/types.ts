declare global {
	interface Window {
		debugEnabled?: boolean;
	}

	// Kudos to ford04 (https://stackoverflow.com/a/63029283)
	type DropFirst<T extends unknown[]> = T extends [any, ...infer U]
		? U
		: never;
}

export interface DamageInfo {
	damage: number;
}

export namespace LDtk {
	interface EditorValue {
		id: string;
		params: string[];
	}

	interface Field {
		__identifier: string;
		__type: string;
		__value: string;
		realEditorValues: EditorValue[];
	}

	interface Entity {
		__identifier: string;
		fieldInstances: Field[];
		width: number;
		height: number;
		px: [number, number];
		__grid: [number, number];
		__pivot: [number, number];
	}

	interface Layer {
		__identifier: string;
		__type: 'Entities' | 'IntGrid';
		intGridCsv: number[];
		entityInstances: Entity[];
	}

	export interface Level {
		pxWid: number;
		pxHei: number;
		layerInstances: Layer[];
	}

	export interface Data {
		levels: Level[];
	}
}
