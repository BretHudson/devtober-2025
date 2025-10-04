import { Text } from 'canvas-lord/graphic';

export const createTitle = (str: string, y = -20) => {
	const title = new Text(str, 0, y);
	title.align = 'center';
	title.baseline = 'bottom';
	return title;
};
