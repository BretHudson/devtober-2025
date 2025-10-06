import fs from 'node:fs/promises';
import path from 'node:path';

const assetsPath = path.join('bin', 'assets');

const ASSETS = {};

const readFolder = async (parent, dirPath) => {
	const entries = await fs.readdir(dirPath);
	const promises = entries.sort().map(async (entry) => {
		if (entry.startsWith('.')) return;

		const entryPath = path.join(dirPath, entry);
		const stat = await fs.stat(entryPath);
		const name = entry
			.split('.')[0]
			.replaceAll(/\s/g, '')
			.replaceAll('-', '_')
			.toUpperCase();

		if (stat.isFile()) return [name, entry];

		const dir = {};
		await readFolder(dir, entryPath);
		return [name.toUpperCase(), dir];
	});
	const items = await Promise.all(promises);
	items.filter(Boolean).forEach(([name, entry]) => {
		parent[name] = entry;
	});
};

await readFolder(ASSETS, assetsPath);

const obj = JSON.stringify(ASSETS, null, '\t');
const data = `export const RAW_ASSET_DATA = ${obj} as const;`;
fs.writeFile(path.join('js', 'data', 'raw-assets.ts'), data);
