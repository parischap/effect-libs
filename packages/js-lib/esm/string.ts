/**
 * A very simple string module
 *
 * @since 0.0.4
 */

import * as JsColor from './color.js';
import * as JsRegExp from './regexp.js';

/**
 * Converts date in `YYYY-MM-DD` format to `YYYYMMDD` format.
 *
 * @since 0.0.4
 * @category Utils
 */
export const isoToYyyymmdd = (s: string) => s.slice(0, 4) + s.slice(5, 7) + s.slice(8, 10);

/**
 * Converts date from `YYYY-MM-DD` format to `YYYYMMDD` format .
 *
 * @since 0.0.4
 * @category Utils
 */
export const yyyymmddToIso = (s: string) =>
	s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);

/**
 * Adds a tab count times at the beginning of each new line in string
 *
 * @since 0.0.4
 * @category Utils
 */
export const tabify =
	(tabChar: string, count = 1) =>
	(s: string) => {
		const tab = tabChar.repeat(count);
		return tab + s.replace(tabifyRegExp, '$&' + tab);
	};
const tabifyRegExp = new RegExp(JsRegExp.lineBreak, 'g');

/**
 * Returns true if the line contains an eol character
 *
 * @since 0.0.4
 * @category Utils
 */
export const isMultiLine = (s: string): boolean => isMultiLineRegExp.test(s);
const isMultiLineRegExp = new RegExp(JsRegExp.lineBreak);

/**
 * Applies an ANSI color to a string
 *
 * @since 0.0.4
 * @category Utils
 */
export const colorize = (color: JsColor.Type) => (self: string) =>
	JsColor.applyToString(self)(color);
