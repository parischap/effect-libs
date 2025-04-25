/** A port of JSON.stringify and JSON.parse in the effect world */

import { Effect } from 'effect';
import * as MError from './Error.js';

/**
 * Port of JSON.stringify
 *
 * @category Utils
 */
export const stringify = (value: unknown, replacer?: Parameters<typeof JSON.stringify>[1]) =>
	Effect.try({
		try: () => JSON.stringify(value, replacer),
		catch: (e) =>
			new MError.EffectPort.Type({
				originalError: e,
				originalFunctionName: 'JSON.stringify',
				moduleName: 'json.ts',
				libraryName: 'effect-lib'
			})
	});

/**
 * Port of JSON.parse
 *
 * @category Utils
 */
export const parse = (text: string, reviver?: Parameters<typeof JSON.parse>[1]) =>
	Effect.try({
		try: () => JSON.parse(text, reviver) as unknown,
		catch: (e) =>
			new MError.EffectPort.Type({
				originalError: e,
				originalFunctionName: 'JSON.parse',
				moduleName: 'json.ts',
				libraryName: 'effect-lib'
			})
	});
