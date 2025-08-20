/** Very simple regular expression string module */

import { Array, Function, pipe, RegExp, String } from 'effect';
import * as MArray from './Array.js';
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
 * `low` must be a positive integer inferior or equal to `high`. `high` must be a strictly positive
 * integer that may receive the `+Infinity` value.
 *
 * @category Utils
 */
export const repeatBetween =
	(low: number, high: number): MTypes.OneArgFunction<string> =>
	(self) =>
		`(?:${self}){${low},${high === +Infinity ? '' : high}}`;

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
		Array.filter(String.isNonEmpty),
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
 * Returns a new regular expression string where `self` is made optional and captured
 *
 * @category Utils
 */
export const optionalCapture: MTypes.StringTransformer = (self) => `(${self})?`;

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
 * A regular expression string representing a space
 *
 * @category Instances
 */
export const space = backslashString + 's';

/**
 * A regular expression string representing zero or more spaces
 *
 * @category Instances
 */
export const spaces = zeroOrMore(space);

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

// A regular expression string representing a group of `DIGIT_GROUP_SIZE` digits.
const _digitGroup: string = repeatBetween(DIGIT_GROUP_SIZE, DIGIT_GROUP_SIZE)(digit);
// A regular expression representing an unsigned non-null integer in base 10 to (10^(n+1))-1 without thousand separator
const _unsignedNonNullIntNPlusOneDigits = (n: number) => nonZeroDigit + repeatBetween(0, n)(digit);
// A regular expression representing an unsigned non-null integer in base 10 without thousand separator
const _unsignedNonNullInt = _unsignedNonNullIntNPlusOneDigits(+Infinity);
// A regular expression representing an unsigned non-null integer in base 10 to 999 without thousand separator
const _unsignedNonNullIntTo999 = _unsignedNonNullIntNPlusOneDigits(2);

/**
 * Returns a regular expression string representing an unsigned non-null integer in base 10 using
 * `thousandSeparator` as thousand separator. Pass an empty string for no thousand separator.
 *
 * @category Instances
 */
export const unsignedNonNullBase10Int = (thousandSeparator: string): string =>
	thousandSeparator === '' ? _unsignedNonNullInt : (
		_unsignedNonNullIntTo999 + zeroOrMore(RegExp.escape(thousandSeparator) + _digitGroup)
	);

/**
 * Returns a regular expression string representing an unsigned integer in base 10 using
 * `thousandSeparator` as thousand separator. Pass an empty string for no thousand separator.
 *
 * @category Instances
 */
export const unsignedBase10Int = (thousandSeparator: string): string =>
	either('0', unsignedNonNullBase10Int(thousandSeparator));

// Regular expression string representing a captured optional sign
const _signPart = pipe(sign, capture, optional);
// Regular expression string representing the captured exponent of a number
const _expPart = pipe(sign, optional, String.concat(unsignedBase10Int('')), capture);
// Regular expression string representing the captured fractional part of a floating-point number
const _fractionalPart = repeatBetween(0, +Infinity)(digit);
const _tupledCharacterClass = Function.tupled(characterClass);

/**
 * Returns a regular expression string representing a number in base 10 using `thousandSeparator` as
 * thousand separator, `fractionalSeparator` as fractional separator and `eNotationChars` as
 * possible characters for scientific notation.
 *
 * - `thousandSeparator`: Usually a string made of at most one character but not mandatory. Should be
 *   different from `fractionalSeparator`. Will not throw otherwise but unexpected results might
 *   occur. Use '' for no thousand separator.
 * - `fractionalSeparator`: usually a one-character string but not mandatory (e.g. '.'). Should not be
 *   an empty string and be different from `thousandSeparator`. Will not throw otherwise but
 *   unexpected results might occur.
 * - `eNotationChars`: array of possible chracters that can be used to represent an exponent (e.g.
 *   value: ['E', 'e']).
 * - `fillChar`: usually a one-character string but not mandatory (e.g. ' '). If not an empty string,
 *   zero or more fillChars are tolerated between the sign and the number (or at the start of the
 *   number if it is unsigned). Beware if you use a number as fillChar (e.g. you use '0' as
 *   `fillChar` and try to parse '0000')
 *
 * @category Instances
 */
export const base10Number = ({
	thousandSeparator,
	fractionalSeparator,
	eNotationChars,
	fillChar
}: {
	readonly thousandSeparator: string;
	readonly fractionalSeparator: string;
	readonly eNotationChars: ReadonlyArray<string>;
	readonly fillChar: string;
}): string =>
	_signPart +
	(fillChar === '' ? '' : zeroOrMore(fillChar)) +
	pipe(thousandSeparator, unsignedBase10Int, optionalCapture) +
	pipe(fractionalSeparator, RegExp.escape, String.concat(capture(_fractionalPart)), optional) +
	pipe(
		eNotationChars,
		Array.map(RegExp.escape),
		_tupledCharacterClass,
		String.concat(_expPart),
		optional
	);

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
