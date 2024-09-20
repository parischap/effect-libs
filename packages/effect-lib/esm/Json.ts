/**
 * A port of JSON.stringify and JSON.parse in the effect world
 *
 * @since 0.0.6
 */

import { Effect } from 'effect';
import * as MPortError from './PortError.js';

/**
 * Port of JSON.stringify
 *
 * @since 0.0.6
 * @category Utils
 */
export const stringify = (value: unknown, replacer?: Parameters<typeof JSON.stringify>[1]) =>
	Effect.try({
		try: () => JSON.stringify(value, replacer),
		catch: (e) =>
			new MPortError.Type({
				originalError: e,
				originalFunctionName: 'JSON.stringify',
				moduleName: 'json.ts',
				libraryName: 'effect-lib'
			})
	});

/**
 * Port of JSON.parse
 *
 * @since 0.0.6
 * @category Utils
 */
export const parse = (text: string, reviver?: Parameters<typeof JSON.parse>[1]) =>
	Effect.try({
		try: () => JSON.parse(text, reviver) as unknown,
		catch: (e) =>
			new MPortError.Type({
				originalError: e,
				originalFunctionName: 'JSON.parse',
				moduleName: 'json.ts',
				libraryName: 'effect-lib'
			})
	});
