import { MArray, MFs, MString, MTypes } from '@parischap/effect-lib';
import { Array, Cause, FiberId, Function, String, flow, pipe } from 'effect';
import * as RErrors from './Errors.js';
import { formatError } from './utils.js';

export const toString =
	({
		eol,
		pathSep,
		stringify,
		tabChar,
		thisProgramPath
	}: {
		readonly eol: string;
		readonly pathSep: string;
		readonly stringify: (u: unknown) => string;
		readonly tabChar: string;
		readonly thisProgramPath: MFs.Folderpath;
	}) =>
	(self: Cause.Cause<unknown>): string => {
		const formatUnknownError = (title: string) => (error: unknown) =>
			Array.of(
				error instanceof RErrors.WithOriginalCause ?
					pipe(
						error.originalCause,
						toString({ eol, pathSep, stringify, tabChar, thisProgramPath })
					) +
						eol +
						JsANSI.yellow(`Rethrown in:${error.message}`)
				:	JsANSI.red(title) +
						eol +
						JsString.tabify(tabChar)(
							MTypes.isErrorish(error) ?
								formatError(error, {
									eol,
									pathSep,
									stringify,
									tabChar
								})
							:	stringify(error)
						)
			);
		return pipe(
			Cause.match(self, {
				onEmpty: Array.of(''),
				onFail: formatUnknownError('SCRIPT ERRORED WITH:'),
				onDie: formatUnknownError('SCRIPT DIED WITH FOLLOWING DEFECT:'),
				onInterrupt: (fiberId) =>
					Array.of(JsANSI.red(`FIBER ${FiberId.threadName(fiberId)} WAS INTERRUPTED`)),
				onSequential: (left, right) => Array.appendAll(left, right),
				onParallel: (left, right) => Array.appendAll(left, right)
			}),
			Array.filter(String.isNonEmpty),
			MArray.match012({
				onEmpty: () => '',
				onSingleton: Function.identity,
				onOverTwo: flow(
					Array.map(flow(MString.prepend('- '), JsString.tabify(tabChar))),
					Array.join(eol)
				)
			})
		);
	};
