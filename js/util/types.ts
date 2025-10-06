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

	interface FieldInstance {
		__identifier: string;
		__type: string;
		__value: string;
		realEditorValues: EditorValue[];
	}

	interface EntityInstance {
		__identifier: string;
		fieldInstances: FieldInstance[];
		width: number;
		height: number;
		px: [number, number];
		__grid: [number, number];
		__pivot: [number, number];
	}

	interface LayerInstance {
		__identifier: string;
		__type: 'Entities' | 'IntGrid';
		intGridCsv: number[];
		entityInstances: EntityInstance[];
	}

	export interface Level {
		pxWid: number;
		pxHei: number;
		layerInstances: LayerInstance[];
	}

	export interface Entity {
		identifier: string;
		uid: number;
		tags: string[];
		allowOutOfBounds: false;
		width: number;
		height: number;
		maxCount: number;
	}

	export interface EnumValue {
		id: string;
		tileRect: null;
		color: number;
	}

	export interface Enum {
		identifier: string;
		uid: number;
		values: EnumValue[];
		iconTilesetUid: null;
		externalRelPath: null;
		externalFileChecksum: null;
		tags: string[];
	}

	export interface Layer {
		__type: string;
		identifier: string;
		type: string;
		uid: number;
		doc: null;
		uiColor: number | null;
		gridSize: number;
		guideGridWid: number;
		guideGridHei: number;
		displayOpacity: number;
		inactiveOpacity: number;
		hideInList: boolean;
		hideFieldsWhenInactive: boolean;
		canSelectWhenInactive: boolean;
		renderInWorldView: boolean;
		pxOffsetX: number;
		pxOffsetY: number;
		parallaxFactorX: number;
		parallaxFactorY: number;
		parallaxScaling: boolean;
		requiredTags: [];
		excludedTags: [];
		autoTilesKilledByOtherLayerUid: null;
		uiFilterTags: [];
		useAsyncRender: boolean;
		intGridValues: [];
		intGridValuesGroups: [];
		autoRuleGroups: [];
		autoSourceLayerDefUid: null;
		tilesetDefUid: null;
		tilePivotX: number;
		tilePivotY: number;
		biomeFieldUid: null;
	}

	export interface Tileset {
		__cWid: number;
		__cHei: number;
		identifier: string;
		uid: number;
		relPath: string;
		embedAtlas: null;
		pxWid: number;
		pxHei: number;
		tileGridSize: number;
		spacing: number;
		padding: number;
		tags: [];
		tagsSourceEnumUid: null;
		enumTags: [];
		customData: [];
		savedSelections: [];
		cachedPixelData: {
			opaqueTiles: string;
			averageColors: string;
		};
	}

	export interface Data {
		levels: Level[];
		defs: {
			entities: Entity[];
			enums: Enum[];
			// externalEnums: any[];
			layers: Layer[];
			// levelFields: any[];
			tilesets: Tileset[];
		};
	}
}
