/** Very simple regular expression module */

import {pipe} from 'effect'
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
