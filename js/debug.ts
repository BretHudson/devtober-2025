import type { Game } from 'canvas-lord/core/engine';
import type { Settings } from './util/assets';

let inspector: HTMLDivElement;
let settings: Settings;
type SettingsKey = keyof Settings;

const titleOverrides = {
	seed: 'Use Seed',
};
type TitleKey = keyof typeof titleOverrides;

const callbacks = {
	seed: (v: number) => (v ? 78493 : undefined),
};
type CallbackKey = keyof typeof callbacks;

const types = {
	showHitboxes: 'checkbox',
	invincible: 'checkbox',
	seed: 'checkbox',
	playerSpeed: 'number',
	playerSpeedUp: 'number',
};
type TypesKey = keyof typeof types;

const values = {
	playerSpeed: { min: 1, max: 20, step: 0.1 },
	playerSpeedUp: { min: 1, max: 20, step: 0.1 },
};
type ValuesKey = keyof typeof values;

const saveSettings = () => {
	const json = JSON.stringify(settings);
	localStorage.setItem('settings', json);
	console.log('saved', json);
};

const camelToWords = (name: string) => {
	const str = name.replaceAll(/([a-z])([A-Z])/g, (...args) => {
		const [_, lower, upper] = args;
		return lower + ' ' + upper;
	});
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const _createInput = <T>(
	type: 'number' | 'checkbox',
	name: string,
	defaultValue: T,
	callback: (...args: any[]) => void,
) => {
	const wrapper = document.createElement('div');
	wrapper.classList.add('input');

	const label = document.createElement('label');
	const labelText = titleOverrides[name as TitleKey] ?? camelToWords(name);
	label.textContent = labelText;
	const input = document.createElement('input');
	input.type = type;
	input.name = name;

	const _callback = (...args: any[]) => {
		callback(...args);
		saveSettings();
	};

	switch (type) {
		case 'checkbox':
			input.addEventListener('change', (e) => {
				// @ts-ignore
				_callback(e.target.checked);
			});
			// @ts-ignore
			input.checked = defaultValue;
			break;
		case 'number':
			input.addEventListener('change', (e) => {
				// @ts-ignore
				_callback(e.target.value);
			});
			// @ts-ignore
			input.value = defaultValue;
			break;
		default:
			throw new Error(`"${type}" is not a valid input type`);
	}

	wrapper.append(label, input);
	inspector.append(wrapper);

	return input;
};

const createCheckbox = (name: SettingsKey | CallbackKey) => {
	const defaultValue = Boolean(settings[name]);
	const callback = (v: string | number) => {
		// @ts-expect-error
		settings[name as SettingsKey] =
			callbacks[name as CallbackKey]?.(+v) ?? +v;
	};
	_createInput.bind(0, 'checkbox')(name, defaultValue, callback);
};

const createNumber = (name: SettingsKey | CallbackKey) => {
	const defaultValue = settings[name];
	const callback = (v: string | number) => {
		// @ts-expect-error
		settings[name as SettingsKey] =
			callbacks[name as CallbackKey]?.(+v) ?? +v;
	};
	const input = _createInput.bind(0, 'number')(name, defaultValue, callback);
	const { min, max, step } = values[name as ValuesKey] as {
		min: number;
		max: number;
		step: number;
	};
	input.min = min.toString();
	input.max = max.toString();
	input.step = step.toString();
};

const createInput = (name: TypesKey) => {
	const type = types[name];
	switch (type) {
		case 'checkbox':
			createCheckbox(name);
			break;
		case 'number':
			createNumber(name);
			break;
		default: {
			throw new Error(`createInput() | "${type}" (${name}) is invalid`);
		}
	}
};

export const initDebug = (
	game: Game,
	_settings: Settings,
	defaultSettings: Settings,
) => {
	const { canvas } = game;

	settings = _settings;

	inspector = document.createElement('div');
	inspector.classList.add('inspector');
	canvas.after(inspector);

	// @ts-ignore
	Object.keys(_settings).forEach(createInput);

	const reset = () => {
		Object.entries(defaultSettings).forEach(([k, v]) => {
			const input = document.querySelector(
				`[name=${k}]`,
			) as HTMLInputElement;
			switch (input.type) {
				case 'checkbox':
					input.checked = Boolean(v);
					break;
				case 'number':
					// @ts-ignore
					input.value = v;
					break;
				default:
					// @ts-ignore
					input.value = v;
					break;
			}
			// @ts-ignore
			settings[k as SettingsKey] = v;
		});
		saveSettings();
	};
	const resetButton = document.createElement('button');
	resetButton.textContent = 'Reset';
	resetButton.addEventListener('click', () => {
		reset();
	});
	inspector.append(resetButton);
};
