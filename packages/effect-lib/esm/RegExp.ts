/**
 * Very simple regular expression module
 *
 * @since 0.5.0
 */

import { Option, pipe, Tuple } from 'effect';
import * as MArray from './Array.js';
import * as MCache from './Cache.js';
import * as MRegExpString from './RegExpString.js';

/**
 * Creates a RegExp from a string
 *
 * @since 0.5.0
 * @category Constructors
 */
export const fromRegExpString = (s: string): RegExp => new RegExp(s);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set.
 *
 * @since 0.5.0
 * @category Destructors
 */
export const match =
	(s: string) =>
	(self: RegExp): Option.Option<string> =>
		pipe(self.exec(s), Option.fromNullable, Option.map(MArray.unsafeGet(0)));

/** Cache for regular expression strings representing real numbers in differente formats */
const _realNumberAtStartCache = MCache.make({
	lookUp: ({ key }: { readonly key: MRegExpString.RealNumberOptions.Type }) =>
		pipe(
			key,
			MRegExpString.realNumber,
			MRegExpString.atStart,
			fromRegExpString,
			Tuple.make,
			Tuple.appendElement(true)
		),
	capacity: 200
});

/**
 * A cached regular expression representing a real number at the start of a line
 *
 * @since 0.5.0
 * @category Instances
 */
export const realNumberAtStart = (options: Partial<MRegExpString.RealNumberOptions.Type> = {}) =>
	pipe(_realNumberAtStartCache, MCache.get(MRegExpString.RealNumberOptions.withDefaults(options)));

/**
 * A regular expression representing a linebreak in all systems with the `g` flag. ATTENTION: MUST
 * NOT BE USED WITH `exec` or `test` because these functions will modify the lastIndex property of
 * this global RegExp
 *
 * @since 0.5.0
 * @category Instances
 */
export const globalLineBreak = new RegExp(MRegExpString.lineBreak, 'g');

/**
 * A regular expression representing a linebreak in all systems without the `g` flag.
 *
 * @since 0.5.0
 * @category Instances
 */
export const lineBreak = new RegExp(MRegExpString.lineBreak);

/**
 * A regular expression representing a SemVer
 *
 * @since 0.5.0
 * @category Instances
 */
export const semVer = pipe(MRegExpString.semVer, MRegExpString.makeLine, fromRegExpString);

/**
 * A regular expression representing an email
 *
 * @since 0.5.0
 * @category Instances
 */
export const email = pipe(MRegExpString.email, MRegExpString.makeLine, fromRegExpString);
