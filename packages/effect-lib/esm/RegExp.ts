/**
 * Very simple regular expression module
 *
 * @since 0.4.0
 */

/**
 * Returns the regexp as a string
 *
 * @since 0.4.0
 * @category Utils
 */
export const toString = (regexp: string | RegExp) =>
	typeof regexp === 'string' ? regexp : regexp.source;

/**
 * Returns a new regular expression where self may appear 0 or more times
 *
 * @since 0.4.0
 * @category Utils
 */
export const zeroOrMore = (self: string): string => `(?:${self})*`;

/**
 * Returns a new regular expression where self may appear 1 or more times
 *
 * @since 0.4.0
 * @category Utils
 */
export const oneOrMore = (self: string): string => `(?:${self})+`;

/**
 * Returns a new regular expression where `self` may appear between `low` and `high` times. Both
 * `low` and `high` must be positive integers with `high` >= `low`. `high` may receive the
 * `+Infinity` value.
 *
 * @since 0.4.0
 * @category Utils
 */
export const repeatBetween =
	(low: number, high: number) =>
	(self: string): string =>
		high === 0 ? '' : `(?:${self}){${low},${high === +Infinity ? '' : high}}`;

/**
 * Returns a new regular expression where self is optional
 *
 * @since 0.4.0
 * @category Utils
 */
export const optional = (self: string): string => `(?:${self})?`;

/**
 * Returns a regular expression that will match one of the provided sregular expressions
 *
 * @since 0.4.0
 * @category Utils
 */
export const either = (...args: ReadonlyArray<string>): string => `(?:${args.join('|')})`;

/**
 * Returns a new regular expression where self must fill a whole line
 *
 * @since 0.4.0
 * @category Utils
 */
export const makeLine = (self: string): string => `^${self}$`;

/**
 * Returns a new regular expression where self must be at the end of a line
 *
 * @since 0.4.0
 * @category Utils
 */
export const atEnd = (self: string): string => `${self}$`;

/**
 * Returns a new regular expression where self must be at the start of a line
 *
 * @since 0.4.0
 * @category Utils
 */
export const atStart = (self: string): string => `^${self}`;

/**
 * Returns a new regular expression where self will be used as negative lookahead
 *
 * @since 0.4.0
 * @category Utils
 */
export const negativeLookAhead = (self: string): string => `(?!${self})`;

/**
 * Returns a new regular expression where self will be used as ppositive lookahead
 *
 * @since 0.4.0
 * @category Utils
 */
export const positiveLookAhead = (self: string): string => `(?=${self})`;

/**
 * Returns a new regular expression where self will be captured
 *
 * @since 0.4.0
 * @category Utils
 */
export const capture = (self: string): string => `(${self})`;

/**
 * Returns a string from self in which all regex special characters are escaped
 *
 * @since 0.4.0
 * @category Destructor
 */
export const escape = (self: string) => self.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A regular expression representing any character
 *
 * @since 0.4.0
 * @category Instances
 */
export const anyChar = '.';

/**
 * A regular expression representing anything but a dot
 *
 * @since 0.4.0
 * @category Instances
 */
export const anythingButDot = '[^.]';

/**
 * A regular expression representing a backslash
 *
 * @since 0.4.0
 * @category Instances
 */
export const backslash = '\\';

/**
 * A regular expression representing a dollar sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const dollar = backslash + '$';

/**
 * A regular expression representing a plus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const plus = backslash + '+';

/**
 * A regular expression representing a minus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const minus = '-';

/**
 * A regular expression representing a plus or a minus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const sign = either(plus, minus);

/**
 * A regular expression representing a star
 *
 * @since 0.4.0
 * @category Instances
 */
export const star = backslash + '*';

/**
 * A regular expression representing a dot
 *
 * @since 0.4.0
 * @category Instances
 */
export const dot = backslash + '.';

/**
 * A regular expression representing the arrowbase
 *
 * @since 0.4.0
 * @category Instances
 */
export const arrowbase = '@';

/**
 * A regular expression representing a tab
 *
 * @since 0.0.8
 * @category Instances
 */
export const tab = backslash + 't';

/**
 * A regular expression representing several whitespaces
 *
 * @since 0.0.8
 * @category Instances
 */
export const whitespaces = zeroOrMore(`[ ${tab}]`);

/**
 * A regular expression representing a digit
 *
 * @since 0.4.0
 * @category Instances
 */
export const digit = backslash + 'd';

/**
 * Possible sign options for regular expressions representing a real number in floating point
 * notation
 *
 * @since 0.4.0
 * @category Models
 */
export enum SignOption {
	/** No sign allowed */
	None = 0,
	/** Sign must be present if value is positive */
	Mandatory = 1,
	/** A minus sign may be present */
	MinusOptional = 2,
	/** A plus sign and a minus sign may be present */
	PlusMinusOptional = 3
}

const _signRegExp = (signOption: SignOption) => {
	switch (signOption) {
		case SignOption.None:
			return '';
		case SignOption.Mandatory:
			return either(plus, minus) + whitespaces;
		case SignOption.MinusOptional:
			return optional(minus + whitespaces);
		case SignOption.PlusMinusOptional:
			return optional(sign + whitespaces);
		default:
			throw new Error('Unknown sign option');
	}
};

const _groupedDecimalDigits = (digitNumber: number, thousandSep: string) => {
	const groupNumber = Math.floor(digitNumber / 3);
	const remainingDigits = digitNumber === +Infinity ? 2 : digitNumber - groupNumber * 3;
	return (
		repeatBetween(0, remainingDigits)(digit) +
		repeatBetween(0, groupNumber)(thousandSep + repeatBetween(3, 3)(digit))
	);
};

/**
 * A regular expression representing a real number in floating point notation with `signOption`
 * indicating how a sign may be present, `fractionalSep` as separator between the decimal and
 * fractional parts, `thousandSep` as separator between 3-digit groups in the decimal part,
 * `maxDecimalDigits` the maximal number of digits in the decimal part and with between
 * `minFractionalDigits` and `maxFractionalDigits` fractional digits. `maxDecimalDigits` must be a
 * positive integer (+Infinity is allowed). `fractionalSep` and `thousandSep` must be escaped if
 * they contain regular expression special characters. `minFractionalDigits` and
 * `maxFractionalDigits` must be positive integers with `maxFractionalDigits` >=
 * `minFractionalDigits`. Pass 0 to `maxFractionalDigits`if you want a regular expression
 * representing an integer. `maxFractionalDigits` may receive the `+Infinity` value. Do not set
 * maxDecimalDigits and maxFractionalDigits to 0 at the same time unless yopu know whate you are
 * doing
 *
 * @since 0.0.8
 * @category Instances
 */
export const floatingPoint = (
	signOption = SignOption.MinusOptional,
	fractionalSep = dot,
	thousandSep = '',
	maxDecimalDigits = +Infinity,
	minFractionalDigits = 0,
	maxFractionalDigits = +Infinity,
	allowENotation = false
) => {
	const unsignedIntRegExp =
		maxDecimalDigits === 0 ? ''
		: maxDecimalDigits === 1 ? digit
		: either(
				'0',
				'[1-9]' +
					(thousandSep === '' ?
						repeatBetween(0, maxDecimalDigits - 1)(digit)
					:	_groupedDecimalDigits(maxDecimalDigits - 1, thousandSep))
			);

	const eNotation =
		allowENotation ?
			optional('[e|E]' + optional(sign) + either('0', '[1-9]' + zeroOrMore(digit)))
		:	'';
	if (maxFractionalDigits === 0) return _signRegExp(signOption) + unsignedIntRegExp + eNotation;
	const fractionalPart =
		fractionalSep + repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits)(digit);
	const numberPart =
		maxDecimalDigits === 0 ? [fractionalPart]
		: minFractionalDigits === 0 ?
			[fractionalPart, unsignedIntRegExp + fractionalPart, unsignedIntRegExp]
		:	[fractionalPart, unsignedIntRegExp + fractionalPart];

	return _signRegExp(signOption) + either(...numberPart) + eNotation;
};

/**
 * A regular expression representing a letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const letter = '[A-Za-z]';

/**
 * A regular expression representing a lowercase letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const lowerCaseLetter = '[a-z]';

/**
 * A regular expression representing an uppercase letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const upperCaseLetter = '[A-Z]';

/**
 * A regular expression representing a lowercase letter
 *
 * @since 0.0.8
 * @category Instances
 */
export const lowerCaseLetterOrDigit = '[a-z0-9]';

/**
 * A regular expression representing a word letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const anyWordLetter = backslash + 'w';

/**
 * A regular expression representing a word
 *
 * @since 0.4.0
 * @category Instances
 */
export const anyWord = oneOrMore(anyWordLetter);

/**
 * A regular expression representing a slash
 *
 * @since 0.4.0
 * @category Instances
 */
export const slash = backslash + '/';

/**
 * A regular expression representing a carriage return
 *
 * @since 0.4.0
 * @category Instances
 */
export const CR = backslash + 'r';

/**
 * A regular expression representing a line-feed
 *
 * @since 0.4.0
 * @category Instances
 */
export const LF = backslash + 'n';

/**
 * A regular expression representing a linebreak in all systems
 *
 * @since 0.4.0
 * @category Instances
 */
export const lineBreak = either(optional(CR) + LF, CR);

/**
 * A regular expression representing a SemVer. Imported from https://semver.org/
 *
 * @since 0.4.0
 * @category Instances
 */
export const semVer =
	/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
		.source;

/**
 * A regular expression representing an email - Imported from
 * https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
 *
 * @since 0.4.0
 * @category Instances
 */

export const email =
	/* eslint-disable-next-line no-control-regex */
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		.source;
