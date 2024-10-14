/**
 * Very simple regular expression string module
 *
 * @since 0.5.0
 */

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
 * Both `low` and `high` must be positive integers with `high` >= `low`. `high` may receive the
 * `+Infinity` value.
 *
 * @since 0.5.0
 * @category Utils
 */
export const repeatBetween =
	(low: number, high: number) =>
	(self: string): string =>
		high === 0 ? '' : `(?:${self}){${low},${high === +Infinity ? '' : high}}`;

/**
 * Alias for `repeatBetween(0, high)`
 *
 * @since 0.5.0
 * @category Utils
 */
export const repeatAtMost = (high: number): ((self: string) => string) => repeatBetween(0, high);

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
export const non0Digit = '[1-9]';

/**
 * A regular expression string representing an unsigned integer
 *
 * @since 0.5.0
 * @category Instances
 */
export const unsignedInteger = either('0', non0Digit + zeroOrMore(digit));

/**
 * A regular expression string representing an unspaced integer
 *
 * @since 0.5.0
 * @category Instances
 */
export const unspacedInteger = optional(sign) + unsignedInteger;

/**
 * A regular expression string representing an integer
 *
 * @since 0.5.0
 * @category Instances
 */
export const integer = optional(sign + whitespaces) + unsignedInteger;

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
