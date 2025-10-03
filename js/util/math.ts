export const positionItemInRow = (
	i: number,
	count: number,
	size: number,
	padding = 0,
) => {
	const spacing = size + padding;
	const start = -(count - 1) * 0.5 * spacing;
	return start + i * spacing;
};
