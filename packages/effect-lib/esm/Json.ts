import { Effect } from 'effect';
import * as MPortError from './PortError.js';

/**
 * Replacer function to make Json stringify support bigInts
 */
/*export const bigIntReplacer =
	(bigIntMark = 'n') =>
	(_: string, value: unknown): unknown =>
		pipe(
			value,
			MMatch.make,
			MMatch.when(MTypes.isBigInt, flow(MString.fromNonNullPrimitive, MString.append(bigIntMark))),
			MMatch.orElse(Function.identity)
		);*/

/**
 * Port of Json stringify
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
 * Reviver function to make Json parse support bigInts
 */
/*export const bigIntReviver = (bigIntMark = 'n'): ((_: string, value: unknown) => unknown) => {
	const regExp = new RegExp(`^\\d+${bigIntMark}$`);
	return (_, value) => 
		MTypes.isString(value) && regExp.test(value) ?
			BigInt(value.substring(0, value.length - bigIntMark.length))
		:	value;
};*/

/**
 * Port of Json parse
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
