/**
 * Very simple regular expression module
 *
 * @since 0.0.4
 */

/**
 * Returns the regexp as a string
 *
 * @since 0.0.4
 * @category Utils
 */
export const toString = (regexp: string | RegExp) =>
	typeof regexp === 'string' ? regexp : regexp.source;

/**
 * Returns a new regular expression where self may appear 0 or more times
 *
 * @since 0.0.4
 * @category Utils
 */
export const zeroOrMore = (self: string): string => `(?:${self})*`;

/**
 * Returns a new regular expression where self may appear 1 or more times
 *
 * @since 0.0.4
 * @category Utils
 */
export const oneOrMore = (self: string): string => `(?:${self})+`;

/**
 * Returns a new regular expression where self may appear between low and high times
 *
 * @since 0.0.4
 * @category Utils
 */
export const repeatBetween = (self: string, low: number, high?: number): string =>
	`(?:${self}){${low},${high === undefined ? '' : high}}`;

/**
 * Returns a new regular expression where self is optional
 *
 * @since 0.0.4
 * @category Utils
 */
export const optional = (self: string): string => `(?:${self})?`;

/**
 * Returns a regular expression that will match one of the provided sregular expressions
 *
 * @since 0.0.4
 * @category Utils
 */
export const either = (...args: ReadonlyArray<string>): string => `(?:${args.join('|')})`;

/**
 * Returns a new regular expression where self must fill a whole line
 *
 * @since 0.0.4
 * @category Utils
 */
export const makeLine = (self: string): string => `^${self}$`;

/**
 * Returns a new regular expression where self must be at the end of a line
 *
 * @since 0.0.4
 * @category Utils
 */
export const atEnd = (self: string): string => `${self}$`;

/**
 * Returns a new regular expression where self must be at the start of a line
 *
 * @since 0.0.4
 * @category Utils
 */
export const atStart = (self: string): string => `^${self}`;

/**
 * Returns a new regular expression where self will be used as negative lookahead
 *
 * @since 0.0.4
 * @category Utils
 */
export const negativeLookAhead = (self: string): string => `(?!${self})`;

/**
 * Returns a new regular expression where self will be used as ppositive lookahead
 *
 * @since 0.0.4
 * @category Utils
 */
export const positiveLookAhead = (self: string): string => `(?=${self})`;

/**
 * Returns a new regular expression where self will be captured
 *
 * @since 0.0.4
 * @category Utils
 */
export const capture = (self: string): string => `(${self})`;

/**
 * Returns a string from self in which all regex special characters are escaped
 *
 * @since 0.0.4
 * @category Destructor
 */
export const escape = (self: string) => self.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A regular expression representing any character
 *
 * @since 0.0.4
 * @category Instances
 */
export const anyChar = '.';

/**
 * A regular expression representing anything but a dot
 *
 * @since 0.0.4
 * @category Instances
 */
export const anythingButDot = '[^.]';

/**
 * A regular expression representing a backslash
 *
 * @since 0.0.4
 * @category Instances
 */
export const backslash = '\\';

/**
 * A regular expression representing a dollar sign
 *
 * @since 0.0.4
 * @category Instances
 */
export const dollar = backslash + '$';

/**
 * A regular expression representing a plus sign
 *
 * @since 0.0.4
 * @category Instances
 */
export const plus = backslash + '+';

/**
 * A regular expression representing a minus sign
 *
 * @since 0.0.4
 * @category Instances
 */
export const minus = '-';

/**
 * A regular expression representing a plus or a minus sign
 *
 * @since 0.0.4
 * @category Instances
 */
export const sign = either(plus, minus);

/**
 * A regular expression representing a star
 *
 * @since 0.0.4
 * @category Instances
 */
export const star = backslash + '*';

/**
 * A regular expression representing a dot
 *
 * @since 0.0.4
 * @category Instances
 */
export const dot = backslash + '.';

/**
 * A regular expression representing the arrowbase
 *
 * @since 0.0.4
 * @category Instances
 */
export const arrowbase = '@';

/**
 * A regular expression representing a digit
 *
 * @since 0.0.4
 * @category Instances
 */
export const digit = backslash + 'd';

/**
 * A regular expression representing a positive integer
 *
 * @since 0.0.4
 * @category Instances
 */
export const positiveInteger = either('0', '[1-9]' + zeroOrMore(digit));

/**
 * A regular expression representing a letter
 *
 * @since 0.0.4
 * @category Instances
 */
export const letter = '[A-Za-z]';

/**
 * A regular expression representing a lowercase letter
 *
 * @since 0.0.4
 * @category Instances
 */
export const lowerCaseLetter = '[a-z]';

/**
 * A regular expression representing an uppercase letter
 *
 * @since 0.0.4
 * @category Instances
 */
export const upperCaseLetter = '[A-Z]';

/**
 * A regular expression representing a word letter
 *
 * @since 0.0.4
 * @category Instances
 */
export const anyWordLetter = backslash + 'w';

/**
 * A regular expression representing a word
 *
 * @since 0.0.4
 * @category Instances
 */
export const anyWord = oneOrMore(anyWordLetter);

/**
 * A regular expression representing a slash
 *
 * @since 0.0.4
 * @category Instances
 */
export const slash = backslash + '/';

/**
 * A regular expression representing a carriage return
 *
 * @since 0.0.4
 * @category Instances
 */
export const CR = backslash + 'r';

/**
 * A regular expression representing a line-feed
 *
 * @since 0.0.4
 * @category Instances
 */
export const LF = backslash + 'n';

/**
 * A regular expression representing a linebreak in all systems
 *
 * @since 0.0.4
 * @category Instances
 */
export const lineBreak = either(optional(CR) + LF, CR);

/**
 * A regular expression representing a SemVer. Imported from https://semver.org/
 *
 * @since 0.0.4
 * @category Instances
 */
export const semVer =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * A regular expression representing an email - Imported from
 * https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
 *
 * @since 0.0.4
 * @category Instances
 */

export const email =
	/* eslint-disable-next-line no-control-regex */
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
