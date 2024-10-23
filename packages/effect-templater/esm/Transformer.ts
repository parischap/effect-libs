/**
 * This module implements a Transformer<A> which is used to transform a string into a value of type
 * A and vice versa. It is used within a Token (see Token.ts).
 *
 * @since 0.0.1
 */

import {
	MArray,
	MBrand,
	MCache,
	MFunction,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MRegExp,
	MRegExpString,
	MString,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Inspectable,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple,
	Types
} from 'effect';
import * as Error from './Error.js';

const moduleTag = '@parischap/effect-templater/Transformer/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a Transformer.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in out A> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this Transformer instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Reads as much as it can from the start of the input string so that the read string can be
	 * converted into an A. If nothing can be read, returns a `left`. Otherwise carries out the
	 * conversion, and returns a `right` of the converted value and the rest of string
	 *
	 * @since 0.0.1
	 */
	readonly read: MTypes.OneArgFunction<
		string,
		Either.Either<readonly [value: A, rest: string], Error.Type>
	>;
	/**
	 * Tries to convert a value of type A into a string. Returns a `right` of the string if the
	 * conversion was successful. Otherwise, returns a `left`
	 *
	 * @since 0.0.1
	 */
	readonly write: MTypes.OneArgFunction<A, Either.Either<string, Error.Type>>;
	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Invariant<A>;
	};
}

type _Type<in out A> = Type<A>;

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const equivalence: Equivalence.Equivalence<Type<any>> = (self, that) =>
	that.name === self.name;

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.invariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON<A>(this: Type<A>) {
		return this.name;
	},
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);

/** This namespace implements the string Transformer */
namespace TString {
	export type Type = _Type<string>;

	/**
	 * Transformer instance that reads/writes a string
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const any: Type = make({
		name: 'string',
		read: flow(Tuple.make, Tuple.appendElement(''), Either.right),
		write: Either.right
	});
}

export {
	/**
	 * This namespace implements the string Transformer
	 *
	 * @since 0.0.1
	 */
	TString as String
};

/**
 * This namespace implements a Transformer for positive integers expressed in a basis other than 10
 *
 * @since 0.0.1
 */
export namespace Bases {
	/**
	 * Type of a Bases Transformer
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = _Type<MBrand.PositiveInt.Type>;

	/**
	 * Transformer instance for a positive integer expressed in basis `radix` whose string
	 * representation must comply with `regExp`
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const any = (name: string, regExp: RegExp, radix: number): Type =>
		make({
			name,
			read: (input) =>
				pipe(
					input,
					MString.match(regExp),
					Option.map(
						MTuple.makeBothBy({
							toFirst: flow(
								MNumber.unsafeIntFromString(radix),
								MBrand.PositiveInt.unsafeFromNumber
							),
							toSecond: flow(String.length, Function.flip(MString.takeRightBut)(input))
						})
					),
					Either.fromOption(
						() =>
							new Error.Type({ message: `Could not read ${name} number from start of '${input}'` })
					)
				),
			write: flow(MString.fromNumber(radix), Either.right)
		});

	/**
	 * Transformer instance that reads/writes a binary positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const binary = any('binary', MRegExp.binaryIntAtStart, 2);

	/**
	 * Transformer instance that reads/writes an octal positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const octal = any('octal', MRegExp.octalIntAtStart, 8);

	/**
	 * Transformer instance that reads/writes an hexadecimal positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const hexadecimal = any('hexadecimal', MRegExp.hexaIntAtStart, 16);
}

export namespace Real {
	const MAX_MAX_FRACTIONAL_DIGITS = 100;

	/**
	 * Type of a Real Transformer
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = _Type<MBrand.Real.Type>;

	/**
	 * Type of an Int Transformer
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type IntType = _Type<MBrand.Int.Type>;

	/**
	 * Type of a PositiveInt Transformer
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type PositiveIntType = _Type<MBrand.PositiveInt.Type>;

	/**
	 * This namespace implements a Transformer for base 10 real numbers.
	 *
	 * @since 0.0.1
	 */
	export namespace Options {
		const namespaceTag = moduleTag + 'Real/Options/';
		const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
		type TypeId = typeof TypeId;

		/**
		 * Possible sign options
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export enum Sign {
			/**
			 * No sign allowed - Negative numbers cannot be converted to a string with that option.
			 *
			 * @since 0.0.1
			 */
			None = 0,
			/**
			 * A sign must be present
			 *
			 * @since 0.0.1
			 */
			Mandatory = 1,
			/**
			 * A minus sign may be present
			 *
			 * @since 0.0.1
			 */
			MinusAllowed = 2,
			/**
			 * A plus sign and a minus sign may be present when reading from string. When writing to
			 * string, plus sign is not displayed.
			 *
			 * @since 0.0.1
			 */
			Optional = 3
		}

		/**
		 * Namespace for sign options
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export namespace Sign {
			/**
			 * Turns a sign option into a regular expression string
			 *
			 * @since 0.0.1
			 * @category Destructors
			 */
			export const toRegExpString: (self: Sign) => string = flow(
				MMatch.make,
				MMatch.whenIs(Sign.None, () => ''),
				MMatch.whenIs(Sign.Mandatory, () => MRegExpString.sign),
				MMatch.whenIs(Sign.MinusAllowed, () => MRegExpString.optional(MRegExpString.minus)),
				MMatch.whenIs(Sign.Optional, () => MRegExpString.optional(MRegExpString.sign)),
				MMatch.exhaustive,
				MRegExpString.capture
			);

			/**
			 * Turns a sign option into a function that takes a number and returns a string representing
			 * its sign, or an error if the sign cannot be represented with these options.
			 *
			 * @since 0.0.1
			 * @category Destructors
			 */
			export const toWriter: (
				self: Sign
			) => MTypes.OneArgFunction<MBrand.Real.Type, Either.Either<string, Error.Type>> = flow(
				MMatch.make,
				MMatch.whenIs(Sign.None, () =>
					flow(
						Either.liftPredicate<MBrand.Real.Type, Error.Type>(
							Number.greaterThanOrEqualTo(0),
							(input) =>
								new Error.Type({
									message: `Negative number '${input}' cannot be displayed with signOption 'None'`
								})
						),
						Either.map(() => '')
					)
				),
				MMatch.whenIs(Sign.Mandatory, () =>
					flow(
						Option.liftPredicate(Number.greaterThanOrEqualTo(0)),
						Option.map(() => '+'),
						Option.getOrElse(() => '-'),
						Either.right
					)
				),
				MMatch.whenIsOr(Sign.MinusAllowed, Sign.Optional, () =>
					flow(
						Option.liftPredicate(Number.greaterThanOrEqualTo(0)),
						Option.map(() => ''),
						Option.getOrElse(() => '-'),
						Either.right
					)
				),
				MMatch.exhaustive
			);

			/**
			 * Turns a sign option into its name
			 *
			 * @since 0.0.1
			 * @category Destructors
			 */
			export const name: (self: Sign) => string = flow(
				MMatch.make,
				MMatch.whenIs(Sign.None, () => 'no sign'),
				MMatch.whenIs(Sign.Mandatory, () => 'mandatory sign'),
				MMatch.whenIs(Sign.MinusAllowed, () => 'optional - sign'),
				MMatch.whenIs(Sign.Optional, () => 'optional +/- sign'),
				MMatch.exhaustive
			);
		}
		/**
		 * Possible e-notation options
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export enum ENotation {
			/**
			 * E-notation is disallowed
			 *
			 * @since 0.0.1
			 */
			None = 0,
			/**
			 * E-notation may be present with a lowercase e
			 *
			 * @since 0.0.1
			 */
			Lowercase = 1,
			/**
			 * E-notation may be present with an uppercase E
			 *
			 * @since 0.0.1
			 */
			Uppercase = 2
		}

		/**
		 * Namespace for e-notation options
		 *
		 * @since 0.0.1
		 */
		export namespace ENotation {
			const _regExpString = (expMark: string): string =>
				pipe(
					MRegExpString.int(),
					MRegExpString.capture,
					MString.prepend(expMark),
					MRegExpString.optional
				);
			/**
			 * Turns an e-notation option into a regular expression string
			 *
			 * @since 0.0.1
			 * @category Destructors
			 */
			export const toRegExpString: (self: ENotation) => string = flow(
				MMatch.make,
				MMatch.whenIs(ENotation.None, () => MRegExpString.emptyCapture),
				MMatch.whenIs(ENotation.Lowercase, () => _regExpString('e')),
				MMatch.whenIs(ENotation.Uppercase, () => _regExpString('E')),
				MMatch.exhaustive
			);

			export const isAllowed: Predicate.Predicate<ENotation> = Predicate.not(
				MFunction.strictEquals(ENotation.None)
			);

			/**
			 * Turns an e-notation option into a function that takes an exponent and returns a string
			 * representing this exponent.
			 *
			 * @since 0.0.1
			 * @category Destructors
			 */
			export const toWriter: (self: ENotation) => MTypes.OneArgFunction<number, string> = flow(
				MMatch.make,
				MMatch.whenIs(ENotation.None, () => Function.constant('')),
				MMatch.whenIs(ENotation.Lowercase, () =>
					flow(MString.fromNonNullablePrimitive, MString.prepend('e'))
				),
				MMatch.whenIs(ENotation.Uppercase, () =>
					flow(MString.fromNonNullablePrimitive, MString.prepend('E'))
				),
				MMatch.exhaustive
			);
		}
		/**
		 * Transformer.Real options
		 *
		 * @since 0.0.1
		 */
		export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
			/**
			 * Sign options
			 *
			 * @since 0.0.1
			 */
			readonly sign: Sign;

			/**
			 * Fractional separator. `fractionalSep` should not contain or be included in `thousandsSep`.
			 *
			 * @since 0.0.1
			 */
			readonly fractionalSep: string;

			/**
			 * Thousand separator. Use an empty string for no separator. `thousandsSep` should not contain
			 * or be included in `fractionalSep`.
			 *
			 * @since 0.0.1
			 */
			readonly thousandsSep: string;

			/**
			 * Minimal number of decimal digits. Note that numbers starting with `0.` (for instance `0.5`)
			 * are considered to be equivalent to numbers starting with `.` (for instance `.5`) and are
			 * therefore considered to have 0 decimal digits. Must be a positive integer less than or
			 * equal to `maxDecimalDigits`. When reading from a string, this is the minimal number of
			 * digits that will be read for the decimal part. When writing to a string, the behaviour
			 * depends on the value of the `eNotation` option. If `eNotation` is set to `ENotation.None`,
			 * trying to write strictly less than `minDecimalDigits` will result in an error. If
			 * `eNotation` is not set to `ENotation.None`, the number to write is multiplied by a 10^(-n)
			 * factor so that the [`minDecimalDigits`,`maxDecimalDigits`] constraint is respected. And a
			 * 10^n exponent will be added to the final string. When writing a number whose absolute value
			 * is strictly less than 1, a leading 0 is always added before the fractionalSep.
			 *
			 * @since 0.0.1
			 */
			readonly minDecimalDigits: number;

			/**
			 * Maximal number of decimal digits. Note that numbers starting with `0.` (for instance `0.5`)
			 * are considered to be equivalent to numbers starting with `.` (for instance `.5`) and are
			 * therefore considered to have 0 decimal digits. Must be a positive integer greater than or
			 * equal to `minDecimalDigits` (+Infinity is allowed). When reading from a string, this is the
			 * maximal number of digits that will be read for the decimal part. When writing to a string,
			 * the behaviour depends on the value of the `eNotation` option. If `eNotation` is set to
			 * `ENotation.None`, trying to write strictly more than `maxDecimalDigits` will result in an
			 * error. If `eNotation` is not set to `ENotation.None`, the number to write is multiplied by
			 * a 10^(-n) factor so that the [`minDecimalDigits`,`maxDecimalDigits`] constraint is
			 * respected. And a 10^n exponent will be added to the final string. Do not set
			 * `maxDecimalDigits` and `maxFractionalDigits` simultaneously to 0. When writing a number
			 * whose absolute value is strictly less than 1, a leading 0 is always added before the
			 * fractionalSep.
			 *
			 * @since 0.0.1
			 */
			readonly maxDecimalDigits: number;

			/**
			 * Minimum number of fractional digits. Must be a positive integer less than or equal to
			 * `maxFractionalDigits`. Use 0 for integers. When reading from a string, this is the minimal
			 * number of digits that will be read for the fractional part. When writing to a string, the
			 * fractional part will be right-padded with zeros if necessary.
			 *
			 * @since 0.0.1
			 */
			readonly minFractionalDigits: number;

			/**
			 * Maximum number of fractional digits. Must be a positive integer greater than or equal to
			 * `minFractionalDigits` (+Infinity is allowed). Use 0 for integers. When reading from a
			 * string, this is the maximal number of digits that will be read for the fractional part.
			 * When writing to a string, the fractional part will be truncated to the min of that length
			 * and `MAX_MAX_FRACTIONAL_DIGITS` if necessary (the last digit will be rounded up if the
			 * digit before it is superior or equal to 5; rounded down otherwise). Do not set
			 * `maxDecimalDigits` and `maxFractionalDigits` simultaneously to 0.
			 *
			 * @since 0.0.1
			 */
			readonly maxFractionalDigits: number;

			/**
			 * E-notation options
			 *
			 * @since 0.0.1
			 */
			readonly eNotation: ENotation;

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
			that.sign === self.sign &&
			that.fractionalSep === self.fractionalSep &&
			that.thousandsSep === self.thousandsSep &&
			that.minDecimalDigits === self.minDecimalDigits &&
			that.maxDecimalDigits === self.maxDecimalDigits &&
			that.minFractionalDigits === self.minFractionalDigits &&
			that.maxFractionalDigits === self.maxFractionalDigits &&
			that.eNotation === self.eNotation;

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

		/**
		 * Returns a copy of `self` where any missing property is filled with its default value
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withFloatingPointDefaults = (self: Partial<Type>): Type =>
			make({
				sign: Sign.MinusAllowed,
				fractionalSep: '.',
				thousandsSep: '',
				minDecimalDigits: 0,
				maxDecimalDigits: +Infinity,
				minFractionalDigits: 0,
				maxFractionalDigits: 4,
				eNotation: ENotation.None,
				...self
			});

		/**
		 * Returns a copy of `self` where `sign` is set to `Sign.None`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoSign = (self: Type): Type => make({ ...self, sign: Sign.None });

		/**
		 * Returns a copy of `self` where `sign` is set to `Sign.Mandatory`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMandatorySign = (self: Type): Type => make({ ...self, sign: Sign.Mandatory });

		/**
		 * Returns a copy of `self` where `sign` is set to `Sign.Optional`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withOptionalSign = (self: Type): Type => make({ ...self, sign: Sign.Optional });

		/**
		 * Returns a copy of `self` where `sign` is set to `Sign.MinusAllowed`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMinusSignAllowed = (self: Type): Type =>
			make({ ...self, sign: Sign.MinusAllowed });

		/**
		 * Returns a copy of `self` where `minFractionalDigits` and `maxFractionalDigits` are set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoFractionalPart = (self: Type): Type =>
			make({ ...self, minFractionalDigits: 0, maxFractionalDigits: 0 });

		/**
		 * Returns a copy of `self` where `maxDecimalDigits` is set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoDecimalPart = (self: Type): Type =>
			make({ ...self, minDecimalDigits: 0, maxDecimalDigits: 0 });

		/**
		 * Returns a copy of `self` that does not allow e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoENotation = (self: Type): Type =>
			make({ ...self, eNotation: ENotation.None });

		/**
		 * Returns a copy of `self` that allows lowercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withLowercaseENotation = (self: Type): Type =>
			make({ ...self, eNotation: ENotation.Lowercase });

		/**
		 * Returns a copy of `self` that allows uppercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withUppercaseENotation = (self: Type): Type =>
			make({ ...self, eNotation: ENotation.Uppercase });

		/**
		 * Returns a copy of `self` where `thousandsSep` is set to the empty string
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoThousandSep = (self: Type): Type => make({ ...self, thousandsSep: '' });

		/**
		 * Returns a copy of `self` where `maxFractionalDigits` and `minFractionalDigits` are set to 2
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withTwoFractionalDigits = (self: Type): Type =>
			make({ ...self, minFractionalDigits: 2, maxFractionalDigits: 2 });

		/**
		 * Returns a copy of `self` where `minDecimalDigits` and `maxDecimalDigits` are set to 1 and
		 * `eNotation` is set to `ENotation.Lowercase`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withScientificNotation = (self: Type): Type =>
			make({ ...self, minDecimalDigits: 1, maxDecimalDigits: 1, eNotation: ENotation.Lowercase });

		/**
		 * Real.Options instance that represents a floating-point number with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const floatingPoint: Type = pipe({}, withFloatingPointDefaults);

		/**
		 * Real.Options instance that represents a UK-style floating-point number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukFloatingPoint: Type = pipe({ thousandsSep: ',' }, withFloatingPointDefaults);

		/**
		 * Real.Options instance that represents a German-style floating-point number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanFloatingPoint: Type = pipe(
			{ thousandsSep: '.', fractionalSep: ',' },
			withFloatingPointDefaults
		);

		/**
		 * Real.Options instance that represents a French-style floating-point number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchFloatingPoint: Type = pipe(
			{ thousandsSep: ' ', fractionalSep: ',' },
			withFloatingPointDefaults
		);

		/**
		 * Real.Options instance that represents a floating-point number with two fractional digits and
		 * no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const floatingPoint2: Type = pipe(floatingPoint, withTwoFractionalDigits);

		/**
		 * Real.Options instance that represents a UK-style floating-point number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukFloatingPoint2: Type = pipe(ukFloatingPoint, withTwoFractionalDigits);

		/**
		 * Real.Options instance that represents a German-style floating-point number with two
		 * fractional digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanFloatingPoint2: Type = pipe(germanFloatingPoint, withTwoFractionalDigits);

		/**
		 * Real.Options instance that represents a French-style floating-point number with two
		 * fractional digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchFloatingPoint2: Type = pipe(frenchFloatingPoint, withTwoFractionalDigits);

		/**
		 * Real.Options instance that represents a number in scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const scientificNotation: Type = pipe(floatingPoint, withScientificNotation);

		/**
		 * Real.Options instance that represents a number in UK-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukScientificNotation: Type = pipe(ukFloatingPoint, withScientificNotation);

		/**
		 * Real.Options instance that represents a number in German-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanScientificNotation: Type = pipe(germanFloatingPoint, withScientificNotation);

		/**
		 * Real.Options instance that represents a number in French-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchScientificNotation: Type = pipe(frenchFloatingPoint, withScientificNotation);

		/**
		 * Real.Options instance that represents a number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const fractional: Type = pipe(floatingPoint, withNoDecimalPart);

		/**
		 * Real.Options instance that represents a UK-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukFractional: Type = pipe(ukFloatingPoint, withNoDecimalPart);

		/**
		 * Real.Options instance that represents a German-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanFractional: Type = pipe(germanFloatingPoint, withNoDecimalPart);

		/**
		 * Real.Options instance that represents a French-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchFractional: Type = pipe(frenchFloatingPoint, withNoDecimalPart);

		/**
		 * Real.Options instance that represents an integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const int: Type = pipe(floatingPoint, withNoFractionalPart);

		/**
		 * Real.Options instance that represents a positive integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const unsignedInt: Type = pipe(int, withNoSign);

		/**
		 * Real.Options instance that represents an integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedInt: Type = pipe(int, withMandatorySign);

		/**
		 * Real.Options instance that represents an integer with no thousand separator that may receive
		 * a plus sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedInt: Type = pipe(int, withOptionalSign);

		/**
		 * Real.Options instance that represents a UK-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukInt: Type = pipe(ukFloatingPoint, withNoFractionalPart);

		/**
		 * Real.Options instance that represents a positive UK-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const unsignedUkInt: Type = pipe(ukInt, withNoSign);

		/**
		 * Real.Options instance that represents a signed UK-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedUkInt: Type = pipe(ukInt, withMandatorySign);

		/**
		 * Real.Options instance that represents a UK-style integer that may receive a plus sign for
		 * positive values.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedUkInt: Type = pipe(ukInt, withOptionalSign);

		/**
		 * Real.Options instance that represents a German-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanInt: Type = pipe(germanFloatingPoint, withNoFractionalPart);

		/**
		 * Real.Options instance that represents a positive German-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const unsignedGermanInt: Type = pipe(germanInt, withNoSign);

		/**
		 * Real.Options instance that represents a signed German-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedGermanInt: Type = pipe(germanInt, withMandatorySign);

		/**
		 * Real.Options instance that represents a German-style integer that may receive a plus sign for
		 * positive values.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedGermanInt: Type = pipe(germanInt, withOptionalSign);

		/**
		 * Real.Options instance that represents a French-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchInt: Type = pipe(frenchFloatingPoint, withNoFractionalPart);

		/**
		 * Real.Options instance that represents a positive French-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const unsignedFrenchInt: Type = pipe(frenchInt, withNoSign);

		/**
		 * Real.Options instance that represents a signed French-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedFrenchInt: Type = pipe(frenchInt, withMandatorySign);

		/**
		 * Real.Options instance that represents a French-style integer that may receive a plus sign for
		 * positive values.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedFrenchInt: Type = pipe(frenchInt, withOptionalSign);

		/**
		 * Returns a name for `self`
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const name = (self: Type): string =>
			`${self.sign}-${self.fractionalSep}-${self.thousandsSep}-${self.minDecimalDigits}-${self.maxDecimalDigits}-${self.minFractionalDigits}-${self.maxFractionalDigits}-${self.eNotation}`;

		/**
		 * Returns a regular expression string representing `self`. The returned regular expression
		 * string allows the decimalPart and fractionalPart to be simultaneously absent. This is
		 * incorrect. We could have used a regular expression alternative (`|`) to handle this case but
		 * it creates a mess with capturing groups. So this case has to be handled programmatically by
		 * the function that uses this regular expression string.
		 */
		const toRegExpString = ({
			sign,
			fractionalSep,
			thousandsSep,
			minDecimalDigits,
			maxDecimalDigits,
			minFractionalDigits,
			maxFractionalDigits,
			eNotation
		}: Type): string => {
			const signPart = Sign.toRegExpString(sign);

			const eNotationPart = ENotation.toRegExpString(eNotation);

			const decimalPart = MRegExpString.capture(
				maxDecimalDigits <= 0 ? MRegExpString.optional('0')
				: minDecimalDigits <= 0 ?
					pipe(MRegExpString.positiveInt(maxDecimalDigits, 1, thousandsSep), MRegExpString.optional)
				:	MRegExpString.strictlyPositiveInt(maxDecimalDigits, minDecimalDigits, thousandsSep)
			);

			const fractionalPart =
				maxFractionalDigits <= 0 ?
					MRegExpString.emptyCapture
				:	pipe(
						MRegExpString.digit,
						MRegExpString.repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits),
						MRegExpString.capture,
						MString.prepend(MRegExpString.escape(fractionalSep)),
						MFunction.fIfTrue({ condition: minFractionalDigits <= 0, f: MRegExpString.optional })
					);

			return signPart + decimalPart + fractionalPart + eNotationPart;
		};

		/** Cache for regular expressions representing `MBrand.Real` numbers in different formats */
		const _realAtStartCache = MCache.make({
			lookUp: ({ key }: { readonly key: Type }) =>
				pipe(
					key,
					toRegExpString,
					MRegExpString.atStart,
					MRegExp.fromRegExpString,
					Tuple.make,
					Tuple.appendElement(true)
				),
			capacity: 30
		});

		/**
		 * Returns a regular expression representing `self`
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExp = (self: Type): RegExp => pipe(_realAtStartCache, MCache.get(self));

		/**
		 * Turns a `Transformer.Real.Options` into a function that tries to read a number from the start
		 * of a string with the options represented by `self`. The returned function returns, if
		 * successful, a `some` of the part of the string that represents an `MBrand.Real` and the rest
		 * of the string. Otherwise, it returns a `none`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toStringStartReader = (
			self: Type
		): MTypes.OneArgFunction<
			string,
			Option.Option<
				[
					numberParts: [
						number: string,
						signPart: string,
						decimalPart: string,
						fractionalPart: string,
						exponentPart: string
					],
					rest: string
				]
			>
		> => {
			const regExp = toRegExp(self);

			return (input) =>
				pipe(
					input,
					MString.matchAndGroups(regExp),
					// Take care of numbers with simultaneously no decimal and no fractional parts (see toRegExpString)
					Option.filter(
						Predicate.or(
							flow(MArray.unsafeGet(2), String.isNonEmpty),
							flow(MArray.unsafeGet(3), String.isNonEmpty)
						)
					),
					Option.map(
						MTuple.makeBothBy({
							toFirst: Function.unsafeCoerce<ReadonlyArray<string>, never>,
							toSecond: flow(
								MArray.unsafeGet(0),
								String.length,
								Function.flip(MString.takeRightBut)(input)
							)
						})
					)
				);
		};

		/**
		 * Turns a `Transformer.Real.Options` into a function that takes a string and returns `true` if
		 * that string represents a `MBrand.Real` with the options represented by `self` and `false`
		 * otherwise
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toTester = (self: Type): MTypes.OneArgFunction<string, boolean> =>
			flow(
				toStringStartReader(self),
				Option.filter(flow(Tuple.getSecond, String.isEmpty)),
				Option.isSome
			);

		/**
		 * Turns a `Transformer.Real.Options` into a function that tries to read a number from the start
		 * of a string with the options represented by `self`. The returned function returns, if
		 * successful, a `right` of the read `MBrand.Real` and the rest of the string. If not
		 * successful, it returns a `left`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toReader = (
			self: Type
		): MTypes.OneArgFunction<
			string,
			Either.Either<readonly [value: MBrand.Real.Type, rest: string], Error.Type>
		> => {
			const digitGroupAndSepLength = self.thousandsSep.length + MRegExpString.DIGIT_GROUP_SIZE;
			const reader = Options.toStringStartReader(self);
			const takeGroupFromRight = String.takeRight(MRegExpString.DIGIT_GROUP_SIZE);

			return (input) =>
				pipe(
					input,
					reader,
					Option.map(
						Tuple.mapFirst(([_, signPart, decimalPart, fractionalPart, exponentPart]) =>
							pipe(
								decimalPart,
								MString.splitEquallyRestAtStart(digitGroupAndSepLength),
								MArray.modifyTail(takeGroupFromRight),
								Array.join(''),
								MString.prepend(signPart),
								MString.append(fractionalPart !== '' ? '.' + fractionalPart : ''),
								MString.append(exponentPart !== '' ? 'e' + exponentPart : ''),
								MNumber.unsafeFromString,
								MBrand.Real.unsafeFromNumber
							)
						)
					),
					Either.fromOption(
						() => new Error.Type({ message: `Could not read number from start of ${input}` })
					)
				);
		};

		/**
		 * Turns a `Transformer.Real.Options` into a function that tries to convert a `MBrand.Real` into
		 * a a string with the options represented by `self`. The returned function returns, if
		 * successful, a `right` of the string. If not successful, it returns a `left`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter = (
			self: Type
		): MTypes.OneArgFunction<MBrand.Real.Type, Either.Either<string, Error.Type>> => {
			const allowsENotation = Options.ENotation.isAllowed(self.eNotation);
			const signWriter = Options.Sign.toWriter(self.sign);
			const eNotationWriter = ENotation.toWriter(self.eNotation);
			const toppedMaxFractionalDigit = Math.min(
				MAX_MAX_FRACTIONAL_DIGITS,
				self.maxFractionalDigits
			);

			return (input) =>
				Either.gen(function* () {
					const sign = yield* signWriter(input);

					const absInput = Math.abs(input);

					const exponent = yield* pipe(
						absInput,
						MMatch.make,
						MMatch.when(Number.lessThanOrEqualTo(MNumber.EPSILON), () =>
							self.minDecimalDigits <= 0 ?
								Either.right(0)
							:	Either.left(
									new Error.Type({
										message: `Number '${input}' cannot be displayed with at least ${self.minDecimalDigits} decimal digits`
									})
								)
						),
						MMatch.orElse(
							flow(
								Math.log10,
								// Attention: Math.ceil(x) is not the same as Math.floor(x) + 1. Try with 10 for instance
								Math.floor,
								Number.increment,
								MTuple.makeBothBy({
									toFirst: Number.subtract(self.minDecimalDigits),
									toSecond: Number.subtract(self.maxDecimalDigits)
								}),
								MMatch.make,
								MMatch.when(
									Predicate.tuple(Number.greaterThan(0), Number.greaterThan(0)),
									Tuple.getSecond
								),
								MMatch.when(
									Predicate.tuple(Number.lessThan(0), Number.lessThan(0)),
									self.minDecimalDigits <= 0 ? Function.constant(0) : Tuple.getFirst
								),
								MMatch.orElse(Function.constant(0)),
								allowsENotation ?
									Either.right
								:	Either.liftPredicate(
										MFunction.strictEquals(0),
										() =>
											new Error.Type({
												message: `Number '${input}' cannot be displayed with at least ${self.minDecimalDigits} and at most ${self.maxDecimalDigits} decimal digits`
											})
									)
							)
						)
					);

					const [dec, frac] = pipe(
						absInput,
						MNumber.shift(-exponent),
						MNumber.decAndFracParts,
						Tuple.mapBoth({
							onFirst: flow(
								MString.fromNonNullablePrimitive,
								MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
								Array.join(self.thousandsSep)
							),
							onSecond:
								self.maxFractionalDigits <= 0 ?
									() => ''
								:	flow(
										MNumber.shift(toppedMaxFractionalDigit),
										Math.round,
										MString.fromNonNullablePrimitive,
										String.padStart(self.maxFractionalDigits, '0'),
										(frac) =>
											pipe(
												frac,
												MString.searchRight(MRegExp.nonZeroDigit),
												Option.map(flow(Struct.get('startIndex'), Number.increment)),
												Option.getOrElse(Function.constant(0)),
												Number.max(self.minFractionalDigits),
												MFunction.flipDual(String.takeLeft)(frac),
												Option.liftPredicate(String.isNonEmpty),
												Option.map(MString.prepend(self.fractionalSep)),
												Option.getOrElse(Function.constant(''))
											)
									)
						})
					);

					return pipe(
						sign,
						MString.append(dec),
						MString.append(frac),
						MString.append(eNotationWriter(exponent))
					);
				});
		};
	}

	/** Cache for real number Transformers in different formats */
	const _realCache = MCache.make({
		lookUp: ({ key }: { readonly key: Options.Type }) => {
			return pipe(
				make({
					name: `real-${Options.name(key)}`,

					read: Options.toReader(key),

					write: Options.toWriter(key)
				}),
				Tuple.make,
				Tuple.appendElement(true)
			);
		},
		capacity: 30
	});

	/**
	 * Cached transformer instance that reads/writes a number.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const real = (options: Options.Type): Type => pipe(_realCache, MCache.get(options));

	/**
	 * Cached transformer instance that reads/writes a floating-point number with no thousand
	 * separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const floatingPoint: Type = real(Options.floatingPoint);

	/**
	 * Cached transformer instance that reads/writes a UK-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFloatingPoint: Type = real(Options.ukFloatingPoint);

	/**
	 * Cached transformer instance that reads/writes a German-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFloatingPoint: Type = real(Options.germanFloatingPoint);

	/**
	 * Cached transformer instance that reads/writes a French-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFloatingPoint: Type = real(Options.frenchFloatingPoint);

	/**
	 * Cached transformer instance that reads/writes a floating-point number with two fractional
	 * digits and no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const floatingPoint2: Type = real(Options.floatingPoint2);

	/**
	 * Cached transformer instance that reads/writes a UK-style floating-point number with two
	 * fractional digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFloatingPoint2: Type = real(Options.ukFloatingPoint2);

	/**
	 * Cached transformer instance that reads/writes a German-style floating-point number with two
	 * fractional digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFloatingPoint2: Type = real(Options.germanFloatingPoint2);

	/**
	 * Cached transformer instance that reads/writes a French-style floating-point number with two
	 * fractional digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFloatingPoint2: Type = real(Options.frenchFloatingPoint2);

	/**
	 * Cached transformer instance that reads/writes a number in scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const scientificNotation: Type = real(Options.scientificNotation);

	/**
	 * Cached transformer instance that reads/writes a number in UK-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukScientificNotation: Type = real(Options.ukScientificNotation);

	/**
	 * Cached transformer instance that reads/writes a number in German-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanScientificNotation: Type = real(Options.germanScientificNotation);

	/**
	 * Cached transformer instance that reads/writes a number in French-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchScientificNotation: Type = real(Options.frenchScientificNotation);

	/**
	 * Cached transformer instance that reads/writes a number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const fractional: Type = real(Options.fractional);

	/**
	 * Cached transformer instance that reads/writes a UK-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFractional: Type = real(Options.ukFractional);

	/**
	 * Cached transformer instance that reads/writes a German-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFractional: Type = real(Options.germanFractional);

	/**
	 * Cached transformer instance that reads/writes a French-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFractional: Type = real(Options.frenchFractional);

	/**
	 * Cached transformer instance that reads/writes an integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const int = real(Options.int) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a positive integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedInt = real(Options.unsignedInt) as unknown as _Type<MBrand.PositiveInt.Type>;

	/**
	 * Cached transformer instance that reads/writes an integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedInt = real(Options.signedInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes an integer with no thousand separator that may
	 * receive a plus sign for positive values
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedInt = real(Options.plussedInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a UK-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukInt = real(Options.ukInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a UK-style positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedUkInt = real(Options.unsignedUkInt) as unknown as PositiveIntType;

	/**
	 * Cached transformer instance that reads/writes a UK-style signed integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedUkInt = real(Options.signedUkInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a UK-style integer that may receive a plus sign
	 * for positive values
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedUkInt = real(Options.plussedUkInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a German-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanInt = real(Options.germanInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a German-style positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedGermanInt = real(Options.unsignedGermanInt) as unknown as PositiveIntType;

	/**
	 * Cached transformer instance that reads/writes a German-style signed integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedGermanInt = real(Options.signedGermanInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a German-style integer that may receive a plus
	 * sign for positive values
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedGermanInt = real(Options.plussedGermanInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a French-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchInt = real(Options.frenchInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a French-style positive integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedFrenchInt = real(Options.unsignedFrenchInt) as unknown as PositiveIntType;

	/**
	 * Cached transformer instance that reads/writes a French-style signed integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedFrenchInt = real(Options.signedFrenchInt) as unknown as IntType;

	/**
	 * Cached transformer instance that reads/writes a French-style integer that may receive a plus
	 * sign for positive values
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedFrenchInt = real(Options.plussedFrenchInt) as unknown as IntType;
}
