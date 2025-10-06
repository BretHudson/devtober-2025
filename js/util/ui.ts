import { Title } from '~/graphic/title';

export const createTitle = (str: string, y = -36) => {
	const title = new Title(str, y);
	return title;
};
