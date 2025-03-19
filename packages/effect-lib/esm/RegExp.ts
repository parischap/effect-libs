/** Very simple regular expression module */

import { Array, flow, Option, pipe, Tuple } from 'effect';
import * as MArray from './Array.js';
import * as MFunction from './Function.js';
import * as MRegExpString from './RegExpString.js';
import * as MTypes from './types.js';

/**
 * Creates a RegExp from a string
 *
 * @category Constructors
 */
export const fromRegExpString =
	(flags?: string) =>
	(s: string): RegExp =>
		new RegExp(s, flags);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set. Good to use in a library when you have no control over the RegExp you receive.
 *
 * @category Destructors
 */
export const match =
	(s: string) =>
	(self: RegExp): Option.Option<string> =>
		pipe(self.exec(s), Option.fromNullable, Option.map(MArray.unsafeGet(0)));

/**
 * Same as match but also returns capturing groups.
 *
 * @category Destructors
 */
export const matchAndGroups =
	<N extends number>(s: string, capturingGroupNumber: N) =>
	(self: RegExp): Option.Option<[match: string, capturingGroups: MTypes.Tuple<string, N>]> =>
		pipe(
			self.exec(s),
			Option.fromNullable,
			// RegExpExecArray extends from Array<string>. But this is a Typescript bug. When there are optional capturing groups, there can be some undefined elements. So let's make javascript and Typescript coherent.
			Option.map(
				flow(
					Array.splitAt(1),
					Tuple.mapBoth({
						onFirst: MArray.unsafeGet(0),
						onSecond: flow(
							Array.pad(capturingGroupNumber, ''),
							Array.map(
								flow(
									Option.liftPredicate(MTypes.isNotUndefined),
									Option.getOrElse(MFunction.constEmptyString)
								)
							)
						)
					})
				)
			)
		) as never;

/**
 * Same as matchAndGroups but returns only the captured groups.
 *
 * @category Destructors
 */
export const capturedGroups = <N extends number>(
	s: string,
	capturingGroupNumber: N
): MTypes.OneArgFunction<RegExp, Option.Option<MTypes.Tuple<string, N>>> =>
	flow(matchAndGroups(s, capturingGroupNumber), Option.map(Tuple.getSecond));

/**
 * A regular expression representing a linebreak in all systems with the `g` flag. ATTENTION: MUST
 * NOT BE USED WITH `exec` or `test` because these functions will modify the lastIndex property of
 * this global RegExp
 *
 * @category Instances
 */
export const globalLineBreak: RegExp = new RegExp(MRegExpString.lineBreak, 'g');

/**
 * A regular expression representing a linebreak in all systems without the `g` flag.
 *
 * @category Instances
 */
export const lineBreak: RegExp = new RegExp(MRegExpString.lineBreak);

/**
 * A regular expression representing a path separator that will match on all systems
 *
 * @category Instances
 */
export const universalPathSep: RegExp = new RegExp(MRegExpString.universalPathSep);

/**
 * A regular expression representing a SemVer
 *
 * @category Instances
 */
export const semVer: RegExp = pipe(MRegExpString.semVer, MRegExpString.makeLine, RegExp);

/**
 * A regular expression representing an email
 *
 * @category Instances
 */
export const email: RegExp = pipe(MRegExpString.email, MRegExpString.makeLine, RegExp);

/**
 * A regular expression representing a strictly positive digit
 *
 * @category Instances
 */
export const nonZeroDigit: RegExp = pipe(MRegExpString.nonZeroDigit, RegExp);
