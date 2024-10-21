/**
 * Very simple regular expression string module
 *
 * @since 0.5.0
 */

import { Number, pipe, Tuple } from 'effect';
import * as MCore from './Core.js';
import * as MNumber from './Number.js';

export const DIGIT_GROUP_SIZE = 3;

/**
 * Creates a string representing a regular expression from a regular expression
 *
 * @since 0.5.0
 * @category Constructors
 */
export const fromRegExp = (regExp: RegExp): string => regExp.source;

/**
 * Returns a new regular expression string where `self` may appear 0 or more times
 *
 * @since 0.5.0
 * @category Utils
 */
export const zeroOrMore = (self: string): string => `(?:${self})*`;

/**
 * Returns a new regular expression string where `self` may appear 1 or more times
 *
 * @since 0.5.0
 * @category Utils
 */
export const oneOrMore = (self: string): string => `(?:${self})+`;

/**
 * Returns a new regular expression string where `self` may appear between `low` and `high` times.
 * Both `low` and `high` must be integers with `high` >= `low`. If `high` is null or negative, the
 * function returns an empry string. `high` may receive the `+Infinity` value.
 *
 * @since 0.5.0
 * @category Utils
 */
export const repeatBetween =
	(low: number, high: number) =>
	(self: string): string =>
		high <= 0 ? '' : `(?:${self}){${low},${high === +Infinity ? '' : high}}`;

/**
 * Returns a new regular expression string where `self` may appear between 0 and `high` times.
 * `high` must be an integer. If `high` is null or negative, the function returns an empry string.
 * If `high` is `+Infinity`, the function is an alias to `zeroOrMore`
 *
 * @since 0.5.0
 * @category Utils
 */
export const repeatAtMost = (high: number): ((self: string) => string) =>
	high === +Infinity ? zeroOrMore : repeatBetween(0, high);

/**
 * Returns a new regular expression string where `self` is optional
 *
 * @since 0.5.0
 * @category Utils
 */
export const optional = (self: string): string => `(?:${self})?`;

/**
 * Returns a regular expression string that will match one of the provided regular expression
 * strings
 *
 * @since 0.5.0
 * @category Utils
 */
export const either = (...args: ReadonlyArray<string>): string => `(?:${args.join('|')})`;

/**
 * Returns a new regular expression string where `self` must fill a whole line
 *
 * @since 0.5.0
 * @category Utils
 */
export const makeLine = (self: string): string => `^${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the end of a line
 *
 * @since 0.5.0
 * @category Utils
 */
export const atEnd = (self: string): string => `${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the start of a line
 *
 * @since 0.5.0
 * @category Utils
 */
export const atStart = (self: string): string => `^${self}`;

/**
 * Returns a new regular expression string where `self` will be used as negative lookahead
 *
 * @since 0.5.0
 * @category Utils
 */
export const negativeLookAhead = (self: string): string => `(?!${self})`;

/**
 * Returns a new regular expression string where `self` will be used as ppositive lookahead
 *
 * @since 0.5.0
 * @category Utils
 */
export const positiveLookAhead = (self: string): string => `(?=${self})`;

/**
 * Returns a new regular expression string where `self` will be captured
 *
 * @since 0.5.0
 * @category Utils
 */
export const capture = (self: string): string => `(${self})`;

/**
 * Escapes all regex special characters
 *
 * @since 0.5.0
 * @category Constructors
 */
export const escape = (s: string): string => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A regular expression string representing an empty capturing group
 *
 * @since 0.5.0
 * @category Instances
 */
export const emptyCapture = capture('');

/**
 * A regular expression string representing any character
 *
 * @since 0.5.0
 * @category Instances
 */
export const anyChar = '.';

/**
 * A regular expression string representing anything but a dot
 *
 * @since 0.5.0
 * @category Instances
 */
export const anythingButDot = '[^.]';

/**
 * A regular expression string representing a backslash
 *
 * @since 0.5.0
 * @category Instances
 */
export const backslash = '\\';

/**
 * A regular expression string representing a dollar sign
 *
 * @since 0.5.0
 * @category Instances
 */
export const dollar = backslash + '$';

/**
 * A regular expression string representing a plus sign
 *
 * @since 0.5.0
 * @category Instances
 */
export const plus = backslash + '+';

/**
 * A regular expression string representing a minus sign
 *
 * @since 0.5.0
 * @category Instances
 */
export const minus = '-';

/**
 * A regular expression string representing a plus or a minus sign
 *
 * @since 0.5.0
 * @category Instances
 */
export const sign = either(plus, minus);

/**
 * A regular expression string representing a star
 *
 * @since 0.5.0
 * @category Instances
 */
export const star = backslash + '*';

/**
 * A regular expression string representing a dot
 *
 * @since 0.5.0
 * @category Instances
 */
export const dot = backslash + '.';

/**
 * A regular expression string representing the arrowbase
 *
 * @since 0.5.0
 * @category Instances
 */
export const arrowbase = '@';

/**
 * A regular expression string representing a tab
 *
 * @since 0.0.8
 * @category Instances
 */
export const tab = backslash + 't';

/**
 * A regular expression string representing several whitespaces
 *
 * @since 0.0.8
 * @category Instances
 */
export const whitespaces = zeroOrMore(`[ ${tab}]`);

/**
 * A regular expression string representing a digit
 *
 * @since 0.5.0
 * @category Instances
 */
export const digit = backslash + 'd';

/**
 * A regular expression string representing a strictly positive digit
 *
 * @since 0.5.0
 * @category Instances
 */
export const nonZeroDigit = '[1-9]';

/**
 * A regular expression string representing a strictly positive integer in base 10 with at least 'm'
 * and at most `n` digits. `m` and `n` must be strictly positive integers with `n` greater than or
 * equal to `m`. `n` may receive the +Infinity value.
 *
 * @since 0.5.0
 * @category Instances
 */
export const strictlyPositiveIntWithNoSep = (n = +Infinity, m = 1): string =>
	pipe(digit, repeatBetween(m - 1, n - 1), MCore.prependString(nonZeroDigit));

const _all_group_values = strictlyPositiveIntWithNoSep(DIGIT_GROUP_SIZE);

/** A regular expression string representing a group of `DIGIT_GROUP_SIZE` digits. */
const _digitGroup: string = pipe(digit, repeatBetween(DIGIT_GROUP_SIZE, DIGIT_GROUP_SIZE));

/**
 * A regular expression string representing a strictly positive integer in base 10 with at most `n`
 * digits using thousandsSep as thousands separator. `n` must be a strictly positive integer. `n`
 * may receive the +Infinity value. If you want no thousands separator, pass an empty string to
 * `thousandsSep`.
 */
export const strictlyPositiveInt = (n = +Infinity, thousandsSep = ''): string => {
	if (thousandsSep === '' || n <= DIGIT_GROUP_SIZE) return strictlyPositiveIntWithNoSep(n);

	const [quotient, remainder] =
		n === +Infinity ?
			[+Infinity, DIGIT_GROUP_SIZE]
		:	pipe(n - 1, MNumber.quotientAndRemainder(DIGIT_GROUP_SIZE), Tuple.mapSecond(Number.sum(1)));

	const thousandGroup = escape(thousandsSep) + _digitGroup;

	if (remainder === DIGIT_GROUP_SIZE)
		return pipe(thousandGroup, repeatAtMost(quotient), MCore.prependString(_all_group_values));

	return either(
		pipe(thousandGroup, repeatAtMost(quotient - 1), MCore.prependString(_all_group_values)),
		pipe(
			thousandGroup,
			repeatBetween(quotient, quotient),
			MCore.prependString(strictlyPositiveIntWithNoSep(remainder))
		)
	);
};

/**
 * A regular expression string representing a positive integer in base 10 with at most `n` digits
 * using thousandsSep as thousands separator. `n` must be a strictly positive integer. `n` may
 * receive the +Infinity value. If you want no thousands separator, pass an empty string to
 * `thousandsSep`.
 *
 * @since 0.5.0
 * @category Instances
 */
export const positiveInt = (n = +Infinity, thousandsSep = ''): string =>
	either('0', strictlyPositiveInt(n, thousandsSep));

/**
 * A regular expression string representing an integer in base 10 with at most `n` digits using
 * thousandsSep as thousands separator. `n` must be a strictly positive integer. `n` may receive the
 * +Infinity value. If you want no thousands separator, pass an empty string to `thousandsSep`.
 *
 * @since 0.5.0
 * @category Instances
 */
export const int = (n = +Infinity, thousandsSep = ''): string =>
	optional(sign) + positiveInt(n, thousandsSep);

/**
 * A regular expression string representing an integer in base 2.
 *
 * @since 0.5.0
 * @category Instances
 */
export const binaryInt: string = oneOrMore('[0-1]');

/**
 * A regular expression string representing an integer in base 8.
 *
 * @since 0.5.0
 * @category Instances
 */
export const octalInt: string = oneOrMore('[0-7]');

/**
 * A regular expression string representing an integer in base 16.
 *
 * @since 0.5.0
 * @category Instances
 */
export const hexaInt: string = oneOrMore('[0-9A-Fa-f]');

/**
 * A regular expression string representing a letter
 *
 * @since 0.5.0
 * @category Instances
 */
export const letter = '[A-Za-z]';

/**
 * A regular expression string representing a lowercase letter
 *
 * @since 0.5.0
 * @category Instances
 */
export const lowerCaseLetter = '[a-z]';

/**
 * A regular expression string representing an uppercase letter
 *
 * @since 0.5.0
 * @category Instances
 */
export const upperCaseLetter = '[A-Z]';

/**
 * A regular expression string representing a lowercase letter
 *
 * @since 0.0.8
 * @category Instances
 */
export const lowerCaseLetterOrDigit = '[a-z0-9]';

/**
 * A regular expression string representing a word letter
 *
 * @since 0.5.0
 * @category Instances
 */
export const anyWordLetter = backslash + 'w';

/**
 * A regular expression string representing a word
 *
 * @since 0.5.0
 * @category Instances
 */
export const anyWord = oneOrMore(anyWordLetter);

/**
 * A regular expression string representing a slash
 *
 * @since 0.5.0
 * @category Instances
 */
export const slash = backslash + '/';

/**
 * A regular expression string representing a carriage return
 *
 * @since 0.5.0
 * @category Instances
 */
export const CR = backslash + 'r';

/**
 * A regular expression string representing a line-feed
 *
 * @since 0.5.0
 * @category Instances
 */
export const LF = backslash + 'n';

/**
 * A regular expression string representing a linebreak in Windows, Unix and Mac Os
 *
 * @since 0.5.0
 * @category Instances
 */
export const lineBreak = either(CR + LF, CR, LF);

/**
 * A regular expression string representing a SemVer. Imported from https://semver.org/
 *
 * @since 0.5.0
 * @category Instances
 */
export const semVer =
	/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
		.source;

/**
 * A regular expression string representing an email - Imported from
 * https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
 *
 * @since 0.5.0
 * @category Instances
 */
export const email =
	/* eslint-disable-next-line no-control-regex */
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		.source;
