/**
 * Very simple regular expression module
 *
 * @since 0.4.0
 */

import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Inspectable,
	MutableHashMap,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Tuple
} from 'effect';
import * as MInspectable from './Inspectable.js';
import * as MNumber from './Number.js';
import * as MPipeable from './Pipeable.js';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/RegExp/';

const regExpCache = MutableHashMap.empty<string, RegExp>();

/**
 * Turns a string representing a regular expression into a regular expression
 *
 * @since 0.4.0
 * @category Destructors
 */
export const toRegExp = (self: string): RegExp => new RegExp(self);

/**
 * Creates a string representing a regular expression from a regular expression
 *
 * @since 0.4.0
 * @category Constructors
 */
export const fromRegExp = (regExp: RegExp): string => regExp.source;

/**
 * Returns a new regular expression string where `self` may appear 0 or more times
 *
 * @since 0.4.0
 * @category Utils
 */
export const zeroOrMore = (self: string): string => `(?:${self})*`;

/**
 * Returns a new regular expression string where `self` may appear 1 or more times
 *
 * @since 0.4.0
 * @category Utils
 */
export const oneOrMore = (self: string): string => `(?:${self})+`;

/**
 * Returns a new regular expression string where `self` may appear between `low` and `high` times.
 * Both `low` and `high` must be positive integers with `high` >= `low`. `high` may receive the
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
 * Returns a new regular expression string where `self` is optional
 *
 * @since 0.4.0
 * @category Utils
 */
export const optional = (self: string): string => `(?:${self})?`;

/**
 * Returns a regular expression string that will match one of the provided regular expression
 * strings
 *
 * @since 0.4.0
 * @category Utils
 */
export const either = (...args: ReadonlyArray<string>): string => `(?:${args.join('|')})`;

/**
 * Returns a new regular expression string where `self` must fill a whole line
 *
 * @since 0.4.0
 * @category Utils
 */
export const makeLine = (self: string): string => `^${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the end of a line
 *
 * @since 0.4.0
 * @category Utils
 */
export const atEnd = (self: string): string => `${self}$`;

/**
 * Returns a new regular expression string where `self` must be at the start of a line
 *
 * @since 0.4.0
 * @category Utils
 */
export const atStart = (self: string): string => `^${self}`;

/**
 * Returns a new regular expression string where `self` will be used as negative lookahead
 *
 * @since 0.4.0
 * @category Utils
 */
export const negativeLookAhead = (self: string): string => `(?!${self})`;

/**
 * Returns a new regular expression string where `self` will be used as ppositive lookahead
 *
 * @since 0.4.0
 * @category Utils
 */
export const positiveLookAhead = (self: string): string => `(?=${self})`;

/**
 * Returns a new regular expression string where `self` will be captured
 *
 * @since 0.4.0
 * @category Utils
 */
export const capture = (self: string): string => `(${self})`;

/**
 * Escapes all regex special characters
 *
 * @since 0.4.0
 * @category Constructors
 */
export const escape = (s: string): string => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A regular expression string representing any character
 *
 * @since 0.4.0
 * @category Instances
 */
export const anyChar = '.';

/**
 * A regular expression string representing anything but a dot
 *
 * @since 0.4.0
 * @category Instances
 */
export const anythingButDot = '[^.]';

/**
 * A regular expression string representing a backslash
 *
 * @since 0.4.0
 * @category Instances
 */
export const backslash = '\\';

/**
 * A regular expression string representing a dollar sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const dollar = backslash + '$';

/**
 * A regular expression string representing a plus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const plus = backslash + '+';

/**
 * A regular expression string representing a minus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const minus = '-';

/**
 * A regular expression string representing a plus or a minus sign
 *
 * @since 0.4.0
 * @category Instances
 */
export const sign = either(plus, minus);

/**
 * A regular expression string representing a star
 *
 * @since 0.4.0
 * @category Instances
 */
export const star = backslash + '*';

/**
 * A regular expression string representing a dot
 *
 * @since 0.4.0
 * @category Instances
 */
export const dot = backslash + '.';

/**
 * A regular expression string representing the arrowbase
 *
 * @since 0.4.0
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
 * @since 0.4.0
 * @category Instances
 */
export const digit = backslash + 'd';

/**
 * This namespace implements the possible sign options for regular expressions that represent a real
 * number.
 *
 * @since 0.4.0
 */
export namespace SignOption {
	/**
	 * Possible sign options for regular expressions that represent a real number
	 *
	 * @since 0.4.0
	 * @category Models
	 */
	export enum Type {
		/** No sign allowed */
		None = 0,
		/** Sign must be present if value is positive */
		Mandatory = 1,
		/** A minus sign may be present */
		MinusOptional = 2,
		/** A plus sign and a minus sign may be present */
		PlusMinusOptional = 3
	}

	/** Converts a SignOption to a regular expression string */
	export const toRegExp = (signOption: Type): string => {
		switch (signOption) {
			case Type.None:
				return '';
			case Type.Mandatory:
				return either(plus, minus) + whitespaces;
			case Type.MinusOptional:
				return optional(minus + whitespaces);
			case Type.PlusMinusOptional:
				return optional(sign + whitespaces);
			default:
				throw new Error('Unknown sign option');
		}
	};
}

/**
 * This namespace implements the options to the floatingPoint function.
 *
 * @since 0.4.0
 */
export namespace FloatingPointOptions {
	const namespaceTag = moduleTag + 'FloatingPointOptions/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Options to the floatingPoint function.
	 *
	 * @since 0.4.0
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Sign option
		 *
		 * @since 0.0.1
		 */
		readonly signOption: SignOption.Type;
		/**
		 * Fractional separator. Must be escaped if it containes regular expression special characters.
		 *
		 * @since 0.0.1
		 */
		readonly fractionalSep: string;
		/**
		 * Thousand separator. Must be escaped if it containes regular expression special characters.
		 * Use an empty string for no separator.
		 *
		 * @since 0.0.1
		 */
		readonly thousandSep: string;
		/**
		 * Maximum number of decimal digits. Must be a positive integer (+Infinity is allowed). Do not
		 * set `maxDecimalDigits` and `maxFractionalDigits` to 0 at the same time.
		 *
		 * @since 0.0.1
		 */
		readonly maxDecimalDigits: number;
		/**
		 * Minimum number of fractional digits. Must be a positive integer less than or equal to
		 * `maxFractionalDigits`. Use 0 for integers.
		 *
		 * @since 0.0.1
		 */
		readonly minFractionalDigits: number;
		/**
		 * Maximum number of fractional digits. Must be a positive integer greater than or equal to
		 * `minFractionalDigits` (+Infinity is allowed). Use 0 for integers. Do not set
		 * `maxDecimalDigits` and `maxFractionalDigits` to 0 at the same time.
		 *
		 * @since 0.0.1
		 */
		readonly maxFractionalDigits: number;
		/**
		 * Whether the number may end with an `e` notation (ex: 1e+5)
		 *
		 * @since 0.0.1
		 */
		readonly allowENotation: boolean;
		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.signOption === self.signOption &&
		that.fractionalSep === self.fractionalSep &&
		that.thousandSep === self.thousandSep &&
		that.maxDecimalDigits === self.maxDecimalDigits &&
		that.minFractionalDigits === self.minFractionalDigits &&
		that.maxFractionalDigits === self.maxFractionalDigits &&
		that.allowENotation === self.allowENotation;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return Hash.cached(this, Hash.structure(this));
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/** Returns a copy of self where any missing property is filled with its default value */
	export const withDefaults = (self: Partial<Type>): Type =>
		make({
			signOption: SignOption.Type.MinusOptional,
			fractionalSep: dot,
			thousandSep: '',
			maxDecimalDigits: +Infinity,
			minFractionalDigits: 0,
			maxFractionalDigits: +Infinity,
			allowENotation: false,
			...self
		});

	/**
	 * Returns a copy of self where `signOption` is set to MRegExp.SignOption.None
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoSign = (self: Type): Type =>
		make({ ...self, signOption: SignOption.Type.None });

	/**
	 * Returns a copy of self where `minFractionalDigits` and `maxFractionalDigits` are set to 0
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoFractionalPart = (self: Type): Type =>
		make({ ...self, minFractionalDigits: 0, maxFractionalDigits: 0 });

	/**
	 * Returns a copy of self where `maxDecimalDigits` is set to 0
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoDecimalPart = (self: Type): Type => make({ ...self, maxDecimalDigits: 0 });

	/**
	 * Returns a copy of self where `allowENotation` is set to false
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoENotation = (self: Type): Type => make({ ...self, allowENotation: false });

	/**
	 * Produces a name for `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const name = (self: Type): string =>
		`${self.signOption}-${self.fractionalSep}-${self.thousandSep}-${self.maxDecimalDigits}-${self.maxFractionalDigits}-${self.allowENotation}`;
}

const _flippedRepeatBetween0AndN = (s: string) => (n: number) => repeatBetween(0, n)(s);
/**
 * A regular expression string representing a real number with `signOption` indicating how a sign
 * may be present, `fractionalSep` as separator between the decimal and fractional parts,
 * `thousandSep` as separator between 3-digit groups in the decimal part, `maxDecimalDigits` the
 * maximal number of digits in the decimal part and with between `minFractionalDigits` and
 * `maxFractionalDigits` fractional digits. `maxDecimalDigits` must be a positive integer (+Infinity
 * is allowed). `fractionalSep` and `thousandSep` must be escaped if they contain regular expression
 * special characters. `minFractionalDigits` and `maxFractionalDigits` must be positive integers
 * with `maxFractionalDigits` >= `minFractionalDigits`. Pass 0 to `maxFractionalDigits`if you want a
 * regular expression string representing an integer. `maxFractionalDigits` may receive the
 * `+Infinity` value. Do not set maxDecimalDigits and maxFractionalDigits to 0 at the same time
 * unless yopu know whate you are doing
 *
 * @since 0.4.0
 * @category Instances
 */
export const floatingPoint = (options: Partial<FloatingPointOptions.Type> = {}) => {
	const {
		signOption,
		fractionalSep,
		thousandSep,
		maxDecimalDigits,
		minFractionalDigits,
		maxFractionalDigits,
		allowENotation
	} = FloatingPointOptions.withDefaults(options);

	const unsignedIntRegExp =
		maxDecimalDigits === 0 ? ''
		: maxDecimalDigits === 1 ? digit
		: either(
				'0',
				'[1-9]' +
					(thousandSep === '' ?
						repeatBetween(0, maxDecimalDigits - 1)(digit)
					:	pipe(
							maxDecimalDigits - 1,
							MNumber.quotientAndRemainder(3),
							Tuple.mapBoth({
								onFirst: _flippedRepeatBetween0AndN(thousandSep + repeatBetween(3, 3)(digit)),
								onSecond: flow(
									// quotientAndRemainder returns NaN if maxDecimalDigits === +Infinity
									Option.liftPredicate(MNumber.isFinite),
									Option.getOrElse(() => 2),
									_flippedRepeatBetween0AndN(digit)
								)
							}),
							Tuple.swap,
							Array.join('')
						))
			);

	const eNotation =
		allowENotation ?
			optional('[e|E]' + optional(sign) + either('0', '[1-9]' + zeroOrMore(digit)))
		:	'';
	if (maxFractionalDigits === 0)
		return SignOption.toRegExp(signOption) + unsignedIntRegExp + eNotation;
	const fractionalPart =
		fractionalSep + repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits)(digit);
	const numberPart =
		maxDecimalDigits === 0 ? [fractionalPart]
		: minFractionalDigits === 0 ?
			[fractionalPart, unsignedIntRegExp + fractionalPart, unsignedIntRegExp]
		:	[fractionalPart, unsignedIntRegExp + fractionalPart];

	return SignOption.toRegExp(signOption) + either(...numberPart) + eNotation;
};

const _floatingPointRegExp =
	(name: string, transformer: (s: string) => string) =>
	(options: Partial<FloatingPointOptions.Type> = {}) => {
		const withDefaults = FloatingPointOptions.withDefaults(options);
		return pipe(
			regExpCache,
			MutableHashMap.get(name + FloatingPointOptions.name(withDefaults)),
			Option.getOrElse(() => pipe(withDefaults, floatingPoint, transformer, toRegExp))
		);
	};
/**
 * A cached regular expression representing a real number
 *
 * @since 0.4.0
 * @category RegExps
 */
export const floatingPointRegExp = _floatingPointRegExp('FloatingPoint', makeLine);

/**
 * A cached regular expression representing a real number at the start of a line
 *
 * @since 0.4.0
 * @category RegExps
 */
export const floatingPointAtStartRegExp = _floatingPointRegExp('FloatingPointAtStart', atStart);

/**
 * A regular expression string representing a letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const letter = '[A-Za-z]';

/**
 * A regular expression string representing a lowercase letter
 *
 * @since 0.4.0
 * @category Instances
 */
export const lowerCaseLetter = '[a-z]';

/**
 * A regular expression string representing an uppercase letter
 *
 * @since 0.4.0
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
 * @since 0.4.0
 * @category Instances
 */
export const anyWordLetter = backslash + 'w';

/**
 * A regular expression string representing a word
 *
 * @since 0.4.0
 * @category Instances
 */
export const anyWord = oneOrMore(anyWordLetter);

/**
 * A regular expression string representing a slash
 *
 * @since 0.4.0
 * @category Instances
 */
export const slash = backslash + '/';

/**
 * A regular expression string representing a carriage return
 *
 * @since 0.4.0
 * @category Instances
 */
export const CR = backslash + 'r';

/**
 * A regular expression string representing a line-feed
 *
 * @since 0.4.0
 * @category Instances
 */
export const LF = backslash + 'n';

/**
 * A regular expression string representing a linebreak in all systems
 *
 * @since 0.4.0
 * @category Instances
 */
export const lineBreak = either(optional(CR) + LF, CR);

/**
 * A regular expression representing a linebreak in all systems with the `g` flag
 *
 * @since 0.4.0
 * @category RegExps
 */
export const globalLineBreakRegExp = new RegExp(lineBreak, 'g');

/**
 * A regular expression string representing a SemVer. Imported from https://semver.org/
 *
 * @since 0.4.0
 * @category Instances
 */
export const semVer =
	/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
		.source;

/**
 * A regular expression representing a SemVer
 *
 * @since 0.4.0
 * @category RegExps
 */
export const semVerRegExp = pipe(semVer, makeLine, toRegExp);

/**
 * A regular expression string representing an email - Imported from
 * https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
 *
 * @since 0.4.0
 * @category Instances
 */
export const email =
	/* eslint-disable-next-line no-control-regex */
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		.source;

/**
 * A regular expression representing an email
 *
 * @since 0.4.0
 * @category RegExps
 */
export const emailRegExp = pipe(email, makeLine, toRegExp);
