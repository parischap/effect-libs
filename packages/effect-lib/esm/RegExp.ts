/** Very simple regular expression module */

import { Option, pipe } from 'effect';
import * as MArray from './Array.js';
import * as MRegExpString from './RegExpString.js';

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
	(s: string) =>
	(self: RegExp): Option.Option<RegExpExecArray> =>
		pipe(
			self.exec(s),
			Option.fromNullable,
			// RegExpExecArray extends from Array<string>. But this is a Typescript bug. When there are optional capturing groups, there can be some undefined elements. So let's make javascript and Typescript coherent.
			Option.map((arr) => {
				for (let loop = 1; loop < arr.length; loop++)
					/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements*/
					if (arr[loop] === undefined) arr[loop] = '';
				return arr;
			})
		);

/**
 * A regular expression representing a linebreak in all systems with the `g` flag. ATTENTION: MUST
 * NOT BE USED WITH `exec` or `test` because these functions will modify the lastIndex property of
 * this global RegExp
 *
 * @category Instances
 */
export const globalLineBreak = new RegExp(MRegExpString.lineBreak, 'g');

/**
 * A regular expression representing a linebreak in all systems without the `g` flag.
 *
 * @category Instances
 */
export const lineBreak = new RegExp(MRegExpString.lineBreak);

/**
 * A regular expression representing a path separator that will match on all systems
 *
 * @category Instances
 */
export const universalPathSep = new RegExp(MRegExpString.universalPathSep);

/**
 * A regular expression representing a SemVer
 *
 * @category Instances
 */
export const semVer = pipe(MRegExpString.semVer, MRegExpString.makeLine, fromRegExpString());

/**
 * A regular expression representing an email
 *
 * @category Instances
 */
export const email = pipe(MRegExpString.email, MRegExpString.makeLine, fromRegExpString());

/**
 * A regular expression representing a strictly positive digit
 *
 * @category Instances
 */
export const nonZeroDigit = pipe(MRegExpString.nonZeroDigit, fromRegExpString());

/**
 * A regular expression representing a string starting with an integer in base 2.
 *
 * @category Instances
 */
export const binaryIntAtStart = pipe(
	MRegExpString.binaryInt,
	MRegExpString.atStart,
	fromRegExpString()
);

/**
 * A regular expression representing a string starting with an integer in base 8.
 *
 * @category Instances
 */
export const octalIntAtStart = pipe(
	MRegExpString.octalInt,
	MRegExpString.atStart,
	fromRegExpString()
);

/**
 * A regular expression representing a string starting with an integer in base 16.
 *
 * @category Instances
 */
export const hexaIntAtStart = pipe(
	MRegExpString.hexaInt,
	MRegExpString.atStart,
	fromRegExpString()
);
