/** Very simple regular expression string module */

import { Function, Number, pipe, Tuple } from 'effect';
import * as MArray from './Array.js';
import * as MCore from './Core.js';
import * as MNumber from './Number.js';
import * as MTypes from './types.js';

/**
 * Size of a group of digits
 *
 * @category Constants
 */
export const DIGIT_GROUP_SIZE = 3;

/**
 * Creates a string representing a regular expression from a regular expression
 *
 * @category Constructors
 */
export const fromRegExp = (regExp: RegExp): string => regExp.source;

/**
 * Returns a new regular expression string where `self` may appear 0 or more times
 *
 * @category Utils
 */
export const zeroOrMore = (self: string): string => `(?:${self})*`;

/**
 * Returns a new regular expression string where `self` may appear 1 or more times
 *
 * @category Utils
 */
export const oneOrMore: MTypes.StringTransformer = (self) => `(?:${self})+`;

/**
 * Returns a new regular expression string where `self` may appear between `low` and `high` times.
 * Both `low` and `high` must be integers. If `high` is null or negative or strictly less than
 * `low`, the function returns an empry string. `high` may receive the `+Infinity` value.
 *
 * @category Utils
 */
export const repeatBetween =
	(low: number, high: number): MTypes.StringTransformer =>
	(self) =>
		high <= 0 || high < low ? '' : `(?:${self}){${low},${high === +Infinity ? '' : high}}`;

/**
 * Returns a new regular expression string where `self` may appear between 0 and `high` times.
 * `high` must be an integer. If `high` is null or negative, the function returns an empry string.
 * If `high` is `+Infinity`, the function is an alias to `zeroOrMore`
 *
 * @category Utils
 */
export const repeatAtMost = (high: number): MTypes.StringTransformer =>
	high === +Infinity ? zeroOrMore : repeatBetween(0, high);

/**
 * Returns a new regular expression string where `self` is optional
 *
 * @category Utils
 */
export const optional: MTypes.StringTransformer = (self) => `(?:${self})?`;

/**
 * Returns a regular expression string that will match one of the provided regular expression
 * strings
 *
 * @category Utils
 */
export const either = (...args: ReadonlyArray<string>): string =>
	pipe(
		args,
		MArray.match012({
			onEmpty: () => '',
			onSingleton: Function.identity,
			onOverTwo: (args) => `(?:${args.join('|')})`
		})
	);

/**
 * Returns a regular expression string that will match one of the provided characters
 *
 * @category Utils
 */
export const characterClass = (...args: ReadonlyArray<string>): string =>
	pipe(
		args,
		MArray.match012({
			onEmpty: () => '',
			onSingleton: Function.identity,
			onOverTwo: (args) => `[${args.join('')}]`
		})
	);

/**
 * Returns a new regular expression string where `self` must fill a whole line
 *
 * @category Utils
 */
export const makeLine: MTypes.StringTransformer = (self) => `^${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the end of a line
 *
 * @category Utils
 */
export const atEnd: MTypes.StringTransformer = (self) => `${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the start of a line
 *
 * @category Utils
 */
export const atStart: MTypes.StringTransformer = (self) => `^${self}`;

/**
 * Returns a new regular expression string where `self` will be used as negative lookahead
 *
 * @category Utils
 */
export const negativeLookAhead: MTypes.StringTransformer = (self) => `(?!${self})`;

/**
 * Returns a new regular expression string where `self` will be used as ppositive lookahead
 *
 * @category Utils
 */
export const positiveLookAhead: MTypes.StringTransformer = (self) => `(?=${self})`;

/**
 * Returns a new regular expression string where `self` will be captured
 *
 * @category Utils
 */
export const capture: MTypes.StringTransformer = (self) => `(${self})`;

/**
 * Escapes all regex special characters
 *
 * @category Constructors
 */
export const escape: MTypes.StringTransformer = (s) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A regular expression string representing an empty capturing group
 *
 * @category Instances
 */
export const emptyCapture = capture('');

/**
 * A regular expression string representing any character
 *
 * @category Instances
 */
export const anyChar = '.';

/**
 * A regular expression string representing anything but a dot
 *
 * @category Instances
 */
export const anythingButDot = '[^.]';

const backslashString = '\\';

/**
 * A regular expression string representing a backslashString
 *
 * @category Instances
 */
export const backslash = backslashString + backslashString;

/**
 * A regular expression string representing a slash
 *
 * @category Instances
 */
export const slash = backslashString + '/';

/**
 * A path separator regular expression string to split all possible paths
 *
 * @category Instances
 */
export const universalPathSep = characterClass(slash, backslash);

/**
 * A regular expression string representing a dollar sign
 *
 * @category Instances
 */
export const dollar = backslashString + '$';

/**
 * A regular expression string representing a plus sign
 *
 * @category Instances
 */
export const plus = backslashString + '+';

/**
 * A regular expression string representing a minus sign
 *
 * @category Instances
 */
export const minus = '-';

/**
 * A regular expression string representing a plus or a minus sign
 *
 * @category Instances
 */
export const sign = either(plus, minus);

/**
 * A regular expression string representing a star
 *
 * @category Instances
 */
export const star = backslashString + '*';

/**
 * A regular expression string representing a dot
 *
 * @category Instances
 */
export const dot = backslashString + '.';

/**
 * A regular expression string representing the arrowbase
 *
 * @category Instances
 */
export const arrowbase = '@';

/**
 * A regular expression string representing a tab
 *
 * @category Instances
 */
export const tab = backslashString + 't';

/**
 * A regular expression string representing several whitespaces
 *
 * @category Instances
 */
export const whitespaces = zeroOrMore(`[ ${tab}]`);

/**
 * A regular expression string representing a digit
 *
 * @category Instances
 */
export const digit = backslashString + 'd';

/**
 * A regular expression string representing a strictly positive digit
 *
 * @category Instances
 */
export const nonZeroDigit = '[1-9]';

/**
 * A regular expression string representing a strictly positive integer in base 10 with at least 'm'
 * and at most `n` digits. `m` and `n` must be strictly positive integers with `n` greater than or
 * equal to `m`. `n` may receive the +Infinity value.
 */
const _strictlyPositiveInt = (n: number, m: number): string =>
	pipe(digit, repeatBetween(m - 1, n - 1), MCore.prependString(nonZeroDigit));

/** A regular expression string representing a group of `DIGIT_GROUP_SIZE` digits. */
const _digitGroup: string = pipe(digit, repeatBetween(DIGIT_GROUP_SIZE, DIGIT_GROUP_SIZE));

/**
 * A regular expression string representing a strictly positive integer in base 10 with at least 'm'
 * and at most `n` digits using thousandsSep as thousand separator. `m` and `n` must be strictly
 * positive integers with `n` greater than or equal to `m`. `n` may receive the +Infinity value. If
 * you want no thousand separator, pass an empty string to `thousandsSep`.
 *
 * @category Instances
 */
export const strictlyPositiveInt = (n = +Infinity, m = 1, thousandsSep = ''): string => {
	if (thousandsSep === '' || n <= DIGIT_GROUP_SIZE) return _strictlyPositiveInt(n, m);

	const thousandGroup = escape(thousandsSep) + _digitGroup;

	const groupedDigit = (
		groupNumberMin: number,
		groupNumberMax: number,
		frontGroupDigitNumberMin: number,
		frontGroupDigitNumberMax: number
	): string =>
		pipe(
			thousandGroup,
			repeatBetween(groupNumberMin, groupNumberMax),
			MCore.prependString(_strictlyPositiveInt(frontGroupDigitNumberMax, frontGroupDigitNumberMin))
		);

	const [quotientHigh, remainderHigh] =
		n === +Infinity ?
			[+Infinity, DIGIT_GROUP_SIZE]
		:	pipe(n - 1, MNumber.quotientAndRemainder(DIGIT_GROUP_SIZE), Tuple.mapSecond(Number.sum(1)));

	const [quotientLow, remainderLow] = pipe(
		m - 1,
		MNumber.quotientAndRemainder(DIGIT_GROUP_SIZE),
		Tuple.mapSecond(Number.sum(1))
	);

	if (quotientLow >= quotientHigh)
		return groupedDigit(quotientHigh, quotientHigh, remainderLow, remainderHigh);

	const fullFirstGroup = remainderHigh === DIGIT_GROUP_SIZE;
	const fullLastGroup = remainderLow === 1;

	if (fullLastGroup && fullFirstGroup)
		return groupedDigit(quotientLow, quotientHigh, 1, DIGIT_GROUP_SIZE);

	if (fullLastGroup)
		return either(
			groupedDigit(quotientLow, quotientHigh - 1, 1, DIGIT_GROUP_SIZE),
			groupedDigit(quotientHigh, quotientHigh, 1, remainderHigh)
		);

	if (fullFirstGroup)
		return either(
			groupedDigit(quotientLow, quotientLow, remainderLow, DIGIT_GROUP_SIZE),
			groupedDigit(quotientLow + 1, quotientHigh, 1, DIGIT_GROUP_SIZE)
		);

	if (quotientLow === quotientHigh - 1)
		return either(
			groupedDigit(quotientLow, quotientLow, remainderLow, DIGIT_GROUP_SIZE),
			groupedDigit(quotientHigh, quotientHigh, 1, remainderHigh)
		);

	return either(
		groupedDigit(quotientLow, quotientLow, remainderLow, DIGIT_GROUP_SIZE),
		groupedDigit(quotientLow + 1, quotientHigh - 1, 1, DIGIT_GROUP_SIZE),
		groupedDigit(quotientHigh, quotientHigh, 1, remainderHigh)
	);
};

/**
 * A regular expression string representing a positive integer in base 10 with at least 'm' and at
 * most `n` digits using thousandsSep as thousand separator. `m` and `n` must be strictly positive
 * integers with `n` greater than or equal to `m`. `n` may receive the +Infinity value. If you want
 * no thousand separator, pass an empty string to `thousandsSep`.
 *
 * @category Instances
 */
export const positiveInt = (n?: number, m?: number, thousandsSep?: string): string =>
	either('0', strictlyPositiveInt(n, m, thousandsSep));

/**
 * A regular expression string representing an integer in base 10 with with at least 'm' and at most
 * `n` digits using thousandsSep as thousand separator. `m` and `n` must be strictly positive
 * integers with `n` greater than or equal to `m`. `n` may receive the +Infinity value. If you want
 * no thousand separator, pass an empty string to `thousandsSep`.
 *
 * @category Instances
 */
export const int = (n?: number, m?: number, thousandsSep?: string): string =>
	optional(sign) + positiveInt(n, m, thousandsSep);

/**
 * A regular expression string representing an integer in base 2.
 *
 * @category Instances
 */
export const binaryInt: string = oneOrMore('[0-1]');

/**
 * A regular expression string representing an integer in base 8.
 *
 * @category Instances
 */
export const octalInt: string = oneOrMore('[0-7]');

/**
 * A regular expression string representing an integer in base 16.
 *
 * @category Instances
 */
export const hexaInt: string = oneOrMore('[0-9A-Fa-f]');

/**
 * A regular expression string representing a letter
 *
 * @category Instances
 */
export const letter = '[A-Za-z]';

/**
 * A regular expression string representing a lowercase letter
 *
 * @category Instances
 */
export const lowerCaseLetter = '[a-z]';

/**
 * A regular expression string representing an uppercase letter
 *
 * @category Instances
 */
export const upperCaseLetter = '[A-Z]';

/**
 * A regular expression string representing a lowercase letter
 *
 * @category Instances
 */
export const lowerCaseLetterOrDigit = '[a-z0-9]';

/**
 * A regular expression string representing a word letter
 *
 * @category Instances
 */
export const anyWordLetter = backslashString + 'w';

/**
 * A regular expression string representing a word
 *
 * @category Instances
 */
export const anyWord = oneOrMore(anyWordLetter);

/**
 * A regular expression string representing a carriage return
 *
 * @category Instances
 */
export const CR = backslashString + 'r';

/**
 * A regular expression string representing a line-feed
 *
 * @category Instances
 */
export const LF = backslashString + 'n';

/**
 * A regular expression string representing a linebreak in Windows, Unix and Mac Os
 *
 * @category Instances
 */
export const lineBreak = either(CR + LF, CR, LF);

/**
 * A regular expression string representing a SemVer. Imported from https://semver.org/
 *
 * @category Instances
 */
export const semVer =
	/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
		.source;

/**
 * A regular expression string representing an email - Imported from
 * https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
 *
 * @category Instances
 */
export const email =
	/* eslint-disable-next-line no-control-regex */
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		.source;
