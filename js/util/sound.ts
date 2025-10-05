import { Sfx } from 'canvas-lord/core/asset-manager';
import { assetManager } from '~/util/assets';

export const playSound = (
	src: string,
	...args: DropFirst<Parameters<typeof Sfx.play>>
) => {
	const asset = assetManager.audio.get(src);
	if (!asset) throw new Error(`"${src}" is not loaded`);

	Sfx.play(asset, ...args);
};
