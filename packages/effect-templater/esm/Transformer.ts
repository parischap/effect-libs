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

const MAX_MAX_FRACTIONAL_DIGITS = 100;

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

/**
 * Transformer instance that reads/writes a string
 *
 * @since 0.0.1
 * @category Instances
 */
export const string: Type<string> = make({
	name: 'string',
	read: flow(Tuple.make, Tuple.appendElement(''), Either.right),
	write: Either.right
});

/**
 * This namespace implements the options to the Transformer real function.
 *
 * @since 0.0.1
 */
export namespace RealOptions {
	const namespaceTag = moduleTag + 'RealOptions/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Possible sign options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum SignOptions {
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
		 * A plus sign and a minus sign may be present when reading from string. When writing to string,
		 * plus sign is not displayed.
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
	export namespace SignOptions {
		/**
		 * Turns a sign option into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: SignOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () => ''),
			MMatch.whenIs(SignOptions.Mandatory, () => MRegExpString.sign),
			MMatch.whenIs(SignOptions.MinusAllowed, () => MRegExpString.optional(MRegExpString.minus)),
			MMatch.whenIs(SignOptions.Optional, () => MRegExpString.optional(MRegExpString.sign)),
			MMatch.exhaustive
		);

		/**
		 * Turns a sign option into a function that take a number and returns a string representing its
		 * sign, or an error if the sign cannot be represented with these options.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter: (
			self: SignOptions
		) => MTypes.OneArgFunction<MBrand.Real.Type, Either.Either<string, Error.Type>> = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () =>
				flow(
					Either.liftPredicate<MBrand.Real.Type, Error.Type>(
						Number.greaterThanOrEqualTo(0),
						(input) =>
							new Error.Type({
								message: `Negative number ${input} cannot be displayed with signOption 'None'`
							})
					),
					Either.map(() => '')
				)
			),
			MMatch.whenIs(SignOptions.Mandatory, () =>
				flow(
					Option.liftPredicate(Number.greaterThanOrEqualTo(0)),
					Option.map(() => '+'),
					Option.getOrElse(() => '-'),
					Either.right
				)
			),
			MMatch.whenIsOr(SignOptions.MinusAllowed, SignOptions.Optional, () =>
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
		export const name: (self: SignOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () => 'no sign'),
			MMatch.whenIs(SignOptions.Mandatory, () => 'mandatory sign'),
			MMatch.whenIs(SignOptions.MinusAllowed, () => 'optional - sign'),
			MMatch.whenIs(SignOptions.Optional, () => 'optional +/- sign'),
			MMatch.exhaustive
		);
	}
	/**
	 * Possible e-notation options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum ENotationOptions {
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
	export namespace ENotationOptions {
		/**
		 * Turns an e-notation option into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: ENotationOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(ENotationOptions.None, () => ''),
			MMatch.whenIs(ENotationOptions.Lowercase, () =>
				pipe('e', MString.append(MRegExpString.int()), MRegExpString.optional)
			),
			MMatch.whenIs(ENotationOptions.Uppercase, () =>
				pipe('E', MString.append(MRegExpString.int()), MRegExpString.optional)
			),
			MMatch.exhaustive
		);

		export const allowsENotation: Predicate.Predicate<ENotationOptions> = Predicate.not(
			MFunction.strictEquals(ENotationOptions.None)
		);
	}
	/**
	 * Transformer.real function options
	 *
	 * @since 0.0.1
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Sign options
		 *
		 * @since 0.0.1
		 */
		readonly signOptions: SignOptions;
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
		 * Maximum number of decimal digits. Must be a positive integer (+Infinity is allowed). When
		 * reading from a string, this is the maximal number of digits that will be read for the decimal
		 * part. If `eNotationOptions` is set to `ENotationOptions.None`, trying to write more than
		 * `maxDecimalDigits` to a string will result in an error. If `eNotationOptions` is not set to
		 * `ENotationOptions.None`, the number to write is multiplied by a 10^(-n) factor so that the
		 * maxDecimalDigits constraint is respected. And a 10^n exponent will be added to the final
		 * string. Do not set `maxDecimalDigits` and `maxFractionalDigits` simultaneously to 0.
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
		 * `minFractionalDigits` (+Infinity is allowed). Use 0 for integers. When reading from a string,
		 * this is the maximal number of digits that will be read for the fractional part. When writing
		 * to a string, the fractional part will be truncated to the min of that length and
		 * `MAX_MAX_FRACTIONAL_DIGITS` if necessary (the last digit will be rounded up if the digit
		 * before it is superior or equal to 5; rounded down otherwise). Do not set `maxDecimalDigits`
		 * and `maxFractionalDigits` simultaneously to 0.
		 *
		 * @since 0.0.1
		 */
		readonly maxFractionalDigits: number;
		/**
		 * E-notation options
		 *
		 * @since 0.0.1
		 */
		readonly eNotationOptions: ENotationOptions;
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
		that.signOptions === self.signOptions &&
		that.fractionalSep === self.fractionalSep &&
		that.thousandsSep === self.thousandsSep &&
		that.maxDecimalDigits === self.maxDecimalDigits &&
		that.minFractionalDigits === self.minFractionalDigits &&
		that.maxFractionalDigits === self.maxFractionalDigits &&
		that.eNotationOptions === self.eNotationOptions;

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
			signOptions: SignOptions.MinusAllowed,
			fractionalSep: '.',
			thousandsSep: '',
			maxDecimalDigits: +Infinity,
			minFractionalDigits: 0,
			maxFractionalDigits: +Infinity,
			eNotationOptions: ENotationOptions.None,
			...self
		});

	/**
	 * Returns a copy of `self` where `signOptions` is set to `SignOptions.None`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoSign = (self: Type): Type => make({ ...self, signOptions: SignOptions.None });

	/**
	 * Returns a copy of `self` where `signOptions` is set to `SignOptions.Mandatory`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withMandatorySign = (self: Type): Type =>
		make({ ...self, signOptions: SignOptions.Mandatory });

	/**
	 * Returns a copy of `self` where `signOptions` is set to `SignOptions.Optional`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withOptionalSign = (self: Type): Type =>
		make({ ...self, signOptions: SignOptions.Optional });

	/**
	 * Returns a copy of `self` where `signOptions` is set to `SignOptions.MinusAllowed`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withMinusSignAllowed = (self: Type): Type =>
		make({ ...self, signOptions: SignOptions.MinusAllowed });

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
	export const withNoDecimalPart = (self: Type): Type => make({ ...self, maxDecimalDigits: 0 });

	/**
	 * Returns a copy of `self` that does not allow e-notation
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withNoENotation = (self: Type): Type =>
		make({ ...self, eNotationOptions: ENotationOptions.None });

	/**
	 * Returns a copy of `self` that allows lowercase e-notation
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withLowercaseENotation = (self: Type): Type =>
		make({ ...self, eNotationOptions: ENotationOptions.Lowercase });

	/**
	 * Returns a copy of `self` that allows uppercase e-notation
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withUppercaseENotation = (self: Type): Type =>
		make({ ...self, eNotationOptions: ENotationOptions.Uppercase });

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
	 * Returns a copy of `self` where `maxDecimalDigits` is set to 1 and `eNotationOptions` is set to
	 * `ENotationOptions.Lowercase`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const withScientificNotation = (self: Type): Type =>
		make({ ...self, maxDecimalDigits: 1, eNotationOptions: ENotationOptions.Lowercase });

	/**
	 * RealOptions instance that represents a floating-point number with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const floatingPoint: Type = pipe({}, withFloatingPointDefaults);

	/**
	 * RealOptions instance that represents a UK-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFloatingPoint: Type = pipe({ thousandsSep: ',' }, withFloatingPointDefaults);

	/**
	 * RealOptions instance that represents a German-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFloatingPoint: Type = pipe(
		{ thousandsSep: '.', fractionalSep: ',' },
		withFloatingPointDefaults
	);

	/**
	 * RealOptions instance that represents a French-style floating-point number
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFloatingPoint: Type = pipe(
		{ thousandsSep: ' ', fractionalSep: ',' },
		withFloatingPointDefaults
	);

	/**
	 * RealOptions instance that represents a floating-point number with two fractional digits and no
	 * thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const floatingPoint2: Type = pipe(floatingPoint, withTwoFractionalDigits);

	/**
	 * RealOptions instance that represents a UK-style floating-point number with two fractional
	 * digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFloatingPoint2: Type = pipe(ukFloatingPoint, withTwoFractionalDigits);

	/**
	 * RealOptions instance that represents a German-style floating-point number with two fractional
	 * digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFloatingPoint2: Type = pipe(germanFloatingPoint, withTwoFractionalDigits);

	/**
	 * RealOptions instance that represents a French-style floating-point number with two fractional
	 * digits.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFloatingPoint2: Type = pipe(frenchFloatingPoint, withTwoFractionalDigits);

	/**
	 * RealOptions instance that represents a number in scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const scientificNotation: Type = pipe(floatingPoint, withScientificNotation);

	/**
	 * RealOptions instance that represents a number in UK-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukScientificNotation: Type = pipe(ukFloatingPoint, withScientificNotation);

	/**
	 * RealOptions instance that represents a number in German-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanScientificNotation: Type = pipe(germanFloatingPoint, withScientificNotation);

	/**
	 * RealOptions instance that represents a number in French-style scientific notation
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchScientificNotation: Type = pipe(frenchFloatingPoint, withScientificNotation);

	/**
	 * RealOptions instance that represents a number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const fractional: Type = pipe(floatingPoint, withNoDecimalPart);

	/**
	 * RealOptions instance that represents a UK-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukFractional: Type = pipe(ukFloatingPoint, withNoDecimalPart);

	/**
	 * RealOptions instance that represents a German-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanFractional: Type = pipe(germanFloatingPoint, withNoDecimalPart);

	/**
	 * RealOptions instance that represents a French-style number with no decimal part
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchFractional: Type = pipe(frenchFloatingPoint, withNoDecimalPart);

	/**
	 * RealOptions instance that represents an integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const int: Type = pipe(floatingPoint, withNoFractionalPart);

	/**
	 * RealOptions instance that represents a positive integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedInt: Type = pipe(int, withNoSign);

	/**
	 * RealOptions instance that represents an integer with no thousand separator
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedInt: Type = pipe(int, withMandatorySign);

	/**
	 * RealOptions instance that represents an integer with no thousand separator that may receive a
	 * plus sign for positive values
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedInt: Type = pipe(int, withOptionalSign);

	/**
	 * RealOptions instance that represents a UK-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const ukInt: Type = pipe(ukFloatingPoint, withNoFractionalPart);

	/**
	 * RealOptions instance that represents a positive UK-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedUkInt: Type = pipe(ukInt, withNoSign);

	/**
	 * RealOptions instance that represents a signed UK-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedUkInt: Type = pipe(ukInt, withMandatorySign);

	/**
	 * RealOptions instance that represents a UK-style integer that may receive a plus sign for
	 * positive values.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedUkInt: Type = pipe(ukInt, withOptionalSign);

	/**
	 * RealOptions instance that represents a German-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const germanInt: Type = pipe(germanFloatingPoint, withNoFractionalPart);

	/**
	 * RealOptions instance that represents a positive German-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedGermanInt: Type = pipe(germanInt, withNoSign);

	/**
	 * RealOptions instance that represents a signed German-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedGermanInt: Type = pipe(germanInt, withMandatorySign);

	/**
	 * RealOptions instance that represents a German-style integer that may receive a plus sign for
	 * positive values.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const plussedGermanInt: Type = pipe(germanInt, withOptionalSign);

	/**
	 * RealOptions instance that represents a French-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const frenchInt: Type = pipe(frenchFloatingPoint, withNoFractionalPart);

	/**
	 * RealOptions instance that represents a positive French-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const unsignedFrenchInt: Type = pipe(frenchInt, withNoSign);

	/**
	 * RealOptions instance that represents a signed French-style integer
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const signedFrenchInt: Type = pipe(frenchInt, withMandatorySign);

	/**
	 * RealOptions instance that represents a French-style integer that may receive a plus sign for
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
		`${self.signOptions}-${self.fractionalSep}-${self.thousandsSep}-${self.maxDecimalDigits}-${self.minFractionalDigits}-${self.maxFractionalDigits}-${self.eNotationOptions}`;

	/**
	 * Returns a regular expression string representing `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toRegExpString = ({
		signOptions,
		fractionalSep,
		thousandsSep,
		maxDecimalDigits,
		minFractionalDigits,
		maxFractionalDigits,
		eNotationOptions
	}: Type): string => {
		const sign = pipe(signOptions, SignOptions.toRegExpString, MRegExpString.capture);

		const eNotation = pipe(
			eNotationOptions,
			ENotationOptions.toRegExpString,
			MRegExpString.capture
		);

		const noDecimalPart = maxDecimalDigits <= 0;
		const noFractionalPart = maxFractionalDigits <= 0;

		const decimalPart =
			noDecimalPart ?
				MRegExpString.emptyCapture
			:	pipe(MRegExpString.positiveInt(maxDecimalDigits, thousandsSep), MRegExpString.capture);

		const fractionalPart =
			noFractionalPart ?
				MRegExpString.emptyCapture
			:	pipe(
					MRegExpString.digit,
					MRegExpString.repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits),
					MRegExpString.capture,
					MString.prepend(MRegExpString.escape(fractionalSep))
				);

		const realNumber =
			noDecimalPart || noFractionalPart ? decimalPart + fractionalPart
			: minFractionalDigits <= 0 ?
				// The next line allows no decimalPart and no fractionalPart simultaneously. We should use an either instead. But this creates a mess with capturing groups. So we handle this case programmatically.
				MRegExpString.optional(decimalPart) + MRegExpString.optional(fractionalPart)
			:	MRegExpString.optional(decimalPart) + fractionalPart;

		return sign + realNumber + eNotation;
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
		capacity: 200
	});

	/**
	 * Returns a regular expression representing `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toRegExp = (self: Type): RegExp => pipe(_realAtStartCache, MCache.get(self));

	/**
	 * Turns a `Transformer.RealOptions` into a function that tries to read a number from the start of
	 * a string with the options represented by `self`. The returned function returns, if successful,
	 * a `some` of the part of the string that represents an `MBrand.Real` and the rest of the string.
	 * Otherwise, it returns a `none`.
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
					eNotationPart: string
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
				// Take care of numbers with no decimal part and no fractional part (see toRegExpString)
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
	 * Turns a `Transformer.RealOptions` into a function that takes a string and returns `true` if
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
	 * Turns a `Transformer.RealOptions` into a function that tries to read a number from the start of
	 * a string with the options represented by `self`. The returned function returns, if successful,
	 * a `right` of the read `MBrand.Real` and the rest of the string. If not successful, it returns a
	 * `left`.
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

		const reader = RealOptions.toStringStartReader(self);
		const takeGroupFromRight = String.takeRight(MRegExpString.DIGIT_GROUP_SIZE);

		return (input) =>
			pipe(
				input,
				reader,
				Option.map(
					Tuple.mapFirst(([_, signPart, decimalPart, fractionalPart, eNotationPart]) =>
						pipe(
							decimalPart,
							MString.splitEquallyRestAtStart(digitGroupAndSepLength),
							MArray.modifyTail(takeGroupFromRight),
							Array.join(''),
							MString.prepend(signPart),
							MString.append('.'),
							MString.append(fractionalPart),
							MString.append(eNotationPart),
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
	 * Turns a `Transformer.RealOptions` into a function that tries to convert a `MBrand.Real` into a
	 * a string with the options represented by `self`. The returned function returns, if successful,
	 * a `right` of the string. If not successful, it returns a `left`.
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toWriter = (
		self: Type
	): MTypes.OneArgFunction<MBrand.Real.Type, Either.Either<string, Error.Type>> => {
		const allowsENotation = RealOptions.ENotationOptions.allowsENotation(self.eNotationOptions);
		const signWriter = RealOptions.SignOptions.toWriter(self.signOptions);
		const toppedMaxFractionalDigit = Math.min(MAX_MAX_FRACTIONAL_DIGITS, self.maxFractionalDigits);

		return (input) =>
			Either.gen(function* () {
				const sign = yield* signWriter(input);

				const absInput = Math.abs(input);

				const corrector =
					absInput === 0 || self.maxDecimalDigits === +Infinity ?
						1
					:	Math.pow(10, Math.max(Math.floor(Math.log10(absInput)) + 1 - self.maxDecimalDigits, 0));
				const validatedCorrector = yield* pipe(
					corrector,
					Either.liftPredicate(
						(c) => c === 1 || allowsENotation,
						() =>
							new Error.Type({
								message: `Number ${input} cannot be displayed with at most ${self.maxDecimalDigits} digits`
							})
					)
				);

				return pipe(
					absInput,
					Number.unsafeDivide(validatedCorrector),
					MNumber.decAndFracParts,
					Tuple.mapBoth({
						onFirst:
							self.maxDecimalDigits === 0 ?
								MFunction.constEmptyString
							:	flow(
									MString.fromNonNullablePrimitive,
									MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
									Array.join(self.thousandsSep)
								),
						onSecond:
							self.maxFractionalDigits === 0 ?
								MFunction.constEmptyString
							:	flow(
									Number.multiply(toppedMaxFractionalDigit),
									Math.round,
									MString.fromNonNullablePrimitive,
									(frac) =>
										pipe(
											frac,
											String.takeLeft(
												Math.max(
													self.minFractionalDigits,
													pipe(
														frac,
														MString.searchRight(MRegExp.nonZeroDigit),
														Option.map(flow(Struct.get('startIndex'), Number.sum(1))),
														Option.getOrElse(() => frac.length)
													)
												)
											)
										)
								)
					}),
					Array.join(self.fractionalSep),
					MString.prepend(sign)
				);
			});
	};
}

/** Cache for real number Transformers in different formats */
const _realCache = MCache.make({
	lookUp: ({ key }: { readonly key: RealOptions.Type }) => {
		return pipe(
			make({
				name: `real-${RealOptions.name(key)}`,

				read: RealOptions.toReader(key),

				write: RealOptions.toWriter(key)
			}),
			Tuple.make,
			Tuple.appendElement(true)
		);
	},
	capacity: 200
});

/**
 * Cached transformer instance that reads/writes a number.
 *
 * @since 0.0.1
 * @category Instances
 */
export const real = (options: RealOptions.Type): Type<MBrand.Real.Type> =>
	pipe(_realCache, MCache.get(options));

/**
 * Cached transformer instance that reads/writes a floating-point number with no thousand separator
 *
 * @since 0.0.1
 * @category Instances
 */
export const floatingPoint: Type<MBrand.Real.Type> = real(RealOptions.floatingPoint);

/**
 * Cached transformer instance that reads/writes a UK-style floating-point number
 *
 * @since 0.0.1
 * @category Instances
 */
export const ukFloatingPoint: Type<MBrand.Real.Type> = real(RealOptions.ukFloatingPoint);

/**
 * Cached transformer instance that reads/writes a German-style floating-point number
 *
 * @since 0.0.1
 * @category Instances
 */
export const germanFloatingPoint: Type<MBrand.Real.Type> = real(RealOptions.germanFloatingPoint);

/**
 * Cached transformer instance that reads/writes a French-style floating-point number
 *
 * @since 0.0.1
 * @category Instances
 */
export const frenchFloatingPoint: Type<MBrand.Real.Type> = real(RealOptions.frenchFloatingPoint);

/**
 * Cached transformer instance that reads/writes a floating-point number with two fractional digits
 * and no thousand separator
 *
 * @since 0.0.1
 * @category Instances
 */
export const floatingPoint2: Type<MBrand.Real.Type> = real(RealOptions.floatingPoint2);

/**
 * Cached transformer instance that reads/writes a UK-style floating-point number with two
 * fractional digits.
 *
 * @since 0.0.1
 * @category Instances
 */
export const ukFloatingPoint2: Type<MBrand.Real.Type> = real(RealOptions.ukFloatingPoint2);

/**
 * Cached transformer instance that reads/writes a German-style floating-point number with two
 * fractional digits.
 *
 * @since 0.0.1
 * @category Instances
 */
export const germanFloatingPoint2: Type<MBrand.Real.Type> = real(RealOptions.germanFloatingPoint2);

/**
 * Cached transformer instance that reads/writes a French-style floating-point number with two
 * fractional digits.
 *
 * @since 0.0.1
 * @category Instances
 */
export const frenchFloatingPoint2: Type<MBrand.Real.Type> = real(RealOptions.frenchFloatingPoint2);

/**
 * Cached transformer instance that reads/writes a number in scientific notation
 *
 * @since 0.0.1
 * @category Instances
 */
export const scientificNotation: Type<MBrand.Real.Type> = real(RealOptions.scientificNotation);

/**
 * Cached transformer instance that reads/writes a number in UK-style scientific notation
 *
 * @since 0.0.1
 * @category Instances
 */
export const ukScientificNotation: Type<MBrand.Real.Type> = real(RealOptions.ukScientificNotation);

/**
 * Cached transformer instance that reads/writes a number in German-style scientific notation
 *
 * @since 0.0.1
 * @category Instances
 */
export const germanScientificNotation: Type<MBrand.Real.Type> = real(
	RealOptions.germanScientificNotation
);

/**
 * Cached transformer instance that reads/writes a number in French-style scientific notation
 *
 * @since 0.0.1
 * @category Instances
 */
export const frenchScientificNotation: Type<MBrand.Real.Type> = real(
	RealOptions.frenchScientificNotation
);

/**
 * Cached transformer instance that reads/writes a number with no decimal part
 *
 * @since 0.0.1
 * @category Instances
 */
export const fractional: Type<MBrand.Real.Type> = real(RealOptions.fractional);

/**
 * Cached transformer instance that reads/writes a UK-style number with no decimal part
 *
 * @since 0.0.1
 * @category Instances
 */
export const ukFractional: Type<MBrand.Real.Type> = real(RealOptions.ukFractional);

/**
 * Cached transformer instance that reads/writes a German-style number with no decimal part
 *
 * @since 0.0.1
 * @category Instances
 */
export const germanFractional: Type<MBrand.Real.Type> = real(RealOptions.germanFractional);

/**
 * Cached transformer instance that reads/writes a French-style number with no decimal part
 *
 * @since 0.0.1
 * @category Instances
 */
export const frenchFractional: Type<MBrand.Real.Type> = real(RealOptions.frenchFractional);

/**
 * Cached transformer instance that reads/writes an integer with no thousand separator
 *
 * @since 0.0.1
 * @category Instances
 */
export const int = real(RealOptions.int) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a positive integer with no thousand separator
 *
 * @since 0.0.1
 * @category Instances
 */
export const unsignedInt = real(
	RealOptions.unsignedInt
) as unknown as Type<MBrand.PositiveInt.Type>;

/**
 * Cached transformer instance that reads/writes an integer with no thousand separator
 *
 * @since 0.0.1
 * @category Instances
 */
export const signedInt = real(RealOptions.signedInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes an integer with no thousand separator that may
 * receive a plus sign for positive values
 *
 * @since 0.0.1
 * @category Instances
 */
export const plussedInt = real(RealOptions.plussedInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a UK-style integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const ukInt = real(RealOptions.ukInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a UK-style positive integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const unsignedUkInt = real(
	RealOptions.unsignedUkInt
) as unknown as Type<MBrand.PositiveInt.Type>;

/**
 * Cached transformer instance that reads/writes a UK-style signed integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const signedUkInt = real(RealOptions.signedUkInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a UK-style integer that may receive a plus sign for
 * positive values
 *
 * @since 0.0.1
 * @category Instances
 */
export const plussedUkInt = real(RealOptions.plussedUkInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a German-style integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const germanInt = real(RealOptions.germanInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a German-style positive integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const unsignedGermanInt = real(
	RealOptions.unsignedGermanInt
) as unknown as Type<MBrand.PositiveInt.Type>;

/**
 * Cached transformer instance that reads/writes a German-style signed integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const signedGermanInt = real(
	RealOptions.signedGermanInt
) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a German-style integer that may receive a plus sign
 * for positive values
 *
 * @since 0.0.1
 * @category Instances
 */
export const plussedGermanInt = real(
	RealOptions.plussedGermanInt
) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a French-style integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const frenchInt = real(RealOptions.frenchInt) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a French-style positive integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const unsignedFrenchInt = real(
	RealOptions.unsignedFrenchInt
) as unknown as Type<MBrand.PositiveInt.Type>;

/**
 * Cached transformer instance that reads/writes a French-style signed integer
 *
 * @since 0.0.1
 * @category Instances
 */
export const signedFrenchInt = real(
	RealOptions.signedFrenchInt
) as unknown as Type<MBrand.Int.Type>;

/**
 * Cached transformer instance that reads/writes a French-style integer that may receive a plus sign
 * for positive values
 *
 * @since 0.0.1
 * @category Instances
 */
export const plussedFrenchInt = real(
	RealOptions.plussedFrenchInt
) as unknown as Type<MBrand.Int.Type>;
