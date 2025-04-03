/** A simple extension to the Effect Brand module */

import { Brand, flow, Number, Option, pipe, Predicate } from 'effect';
import * as MNumber from './Number.js';
import * as MRegExpString from './RegExpString.js';
import * as MString from './String.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/Brand/';

/** Brand constructor type with refined input */

type RefinedConstructor<B, A extends Brand.Brand<string | symbol> & B> = MTypes.SetArgTypeTo<
	Brand.Brand.Constructor<A>,
	B
> & {
	readonly [k in keyof Brand.Brand.Constructor<A>]: MTypes.SetArgTypeTo<
		Brand.Brand.Constructor<A>[k],
		B
	>;
};

/**
 * This namespace implements an Email brand
 *
 * @category Models
 */
export namespace Email {
	const namespaceTag = moduleTag + 'Email/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;
	/**
	 * Email type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<string, _TypeId>;

	/**
	 * Constructs an Email without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromString = Brand.nominal<Type>();

	/**
	 * Constructs an Email from a string. Throws an error if the provided string does not match the
	 * `email` pattern
	 *
	 * @category Constructors
	 */
	export const fromString = Brand.refined<Type>(MString.isEmail, (s) =>
		Brand.error(`'${s}' does not represent an Email`)
	);
}

/**
 * This namespace implements a SemVer brand
 *
 * @category Models
 */
export namespace SemVer {
	const namespaceTag = moduleTag + 'SemVer/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * SemVer type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<string, _TypeId>;

	/**
	 * Constructs a SemVer without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromString = Brand.nominal<Type>();

	/**
	 * Constructs a SemVer from a string. Throws an error if the provided string does not match the
	 * `semVer` pattern
	 *
	 * @category Constructors
	 */
	export const fromString = Brand.refined<Type>(MString.isSemVer, (s) =>
		Brand.error(`'${s}' does not represent a SemVer`)
	);
}

/**
 * This namespace implements a finite real number brand (Infinity or Nan disallowed)
 *
 * @category Models
 */
export namespace Real {
	const namespaceTag = moduleTag + 'Real/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Real type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<number, _TypeId>;

	/**
	 * Constructs a Real from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs a Real from a number. Throws an error if the provided number is not finite
	 *
	 * @category Constructors
	 */
	export const fromNumber = Brand.refined<Type>(MNumber.isFinite, (n) =>
		Brand.error(`'${n}' does not represent a finite real number`)
	);
}

/**
 * This namespace implements a finite integer brand (no Infinity or Nan)
 *
 * @category Models
 */
export namespace Int {
	const namespaceTag = moduleTag + 'Int/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Int type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<Real.Type, _TypeId>;

	/**
	 * Constructs an Int from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	const _fromNumber = (pred: Predicate.Predicate<number>) =>
		Brand.refined<Type>(pred, (n) => Brand.error(`'${n}' does not represent a finite integer`));

	/**
	 * Constructs an Int from a number. Throws an error if the provided number is not a finite integer
	 *
	 * @category Constructors
	 */
	export const fromNumber = _fromNumber(Predicate.and(MNumber.isFinite, MNumber.isInt));

	/**
	 * Constructs an Int from an Real. Throws an error if the provided number is not an integer
	 *
	 * @category Constructors
	 */
	export const fromReal: RefinedConstructor<Real.Type, Type> = _fromNumber(MNumber.isInt);
}

/**
 * This namespace implements a integer range brand
 *
 * @category Models
 */
export namespace IntRange {
	/**
	 * IntRange type
	 *
	 * @category Models
	 */
	export type Type<Name extends symbol> = Brand.Branded<Int.Type, Name>;

	/**
	 * Constructs an IntRange from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = <Name extends symbol = never>() => Brand.nominal<Type<Name>>();

	const _fromNumber = <Name extends symbol>(
		minimum: number,
		maximum: number,
		pred: Predicate.Predicate<number>
	) =>
		Brand.refined<Type<Name>>(pred, (n) =>
			Brand.error(`'${n}' is not a finite integer in the range [${minimum} - ${maximum}]`)
		);

	/**
	 * Constructs an IntRange from a number. Throws an error if the provided number is not an integer,
	 * not in the given range or not finite
	 *
	 * @category Constructors
	 */
	export const fromNumber = <Name extends symbol>(minimum: number, maximum: number) =>
		_fromNumber<Name>(
			minimum,
			maximum,
			Predicate.every([MNumber.isFinite, MNumber.isInt, Number.between({ minimum, maximum })])
		);

	/**
	 * Constructs an IntRange from a Real. Throws an error if the provided number is not an integer or
	 * not in the given range
	 *
	 * @category Constructors
	 */
	export const fromReal = <Name extends symbol>(
		minimum: number,
		maximum: number
	): RefinedConstructor<Real.Type, Type<Name>> =>
		_fromNumber<Name>(
			minimum,
			maximum,
			Predicate.and(MNumber.isInt, Number.between({ minimum, maximum }))
		) as never;

	/**
	 * Constructs an IntRange from an Int. Throws an error if the provided number is not in the given
	 * range
	 *
	 * @category Constructors
	 */
	export const fromInt = <Name extends symbol>(
		minimum: number,
		maximum: number
	): RefinedConstructor<Int.Type, Type<Name>> =>
		_fromNumber<Name>(minimum, maximum, Number.between({ minimum, maximum })) as never;
}

/**
 * This namespace implements a positive integer brand
 *
 * @category Models
 */
export namespace PositiveInt {
	const namespaceTag = moduleTag + 'PositiveInt/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;
	/**
	 * Type for positive integers
	 *
	 * @category Instances
	 */
	export type Type = IntRange.Type<_TypeId>;

	/**
	 * Constructs a PositiveInt from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = IntRange.unsafeFromNumber<_TypeId>();

	/**
	 * Constructs a PositiveInt from a number. Throws an error if the provided number is not an
	 * integer, not positive or not finite
	 *
	 * @category Constructors
	 */
	export const fromNumber = IntRange.fromNumber<_TypeId>(0, +Infinity);

	/**
	 * Constructs a PositiveInt from a Real. Throws an error if the provided number is not a positive
	 * integer
	 *
	 * @category Constructors
	 */
	export const fromReal = IntRange.fromReal<_TypeId>(0, +Infinity);

	/**
	 * Constructs a PositiveInt from an Int. Throws an error if the provided Int is not positive
	 *
	 * @category Constructors
	 */
	export const fromInt = IntRange.fromInt<_TypeId>(0, +Infinity);

	/**
	 * Constructs a PositiveInt from a string representing a positive integer expressed in base 10
	 * with `thousandSeparator` as thousand separator. Throws an error if the passed string does not
	 * match the expected format
	 *
	 * @category Destructors
	 */

	export const fromBase10String = (
		thousandSeparator: string
	): MTypes.OneArgFunction<string, Option.Option<Type>> => {
		const getValidatedString = pipe(
			thousandSeparator,
			MRegExpString.unsignedBase10Int,
			MRegExpString.makeLine,
			RegExp,
			MString.match
		);

		const removeThousandSeparator = MString.removeNCharsEveryMCharsFromRight({
			m: MRegExpString.DIGIT_GROUP_SIZE,
			n: thousandSeparator.length
		});

		return flow(
			getValidatedString,
			Option.map(flow(removeThousandSeparator, MNumber.unsafeFromString, unsafeFromNumber))
		);
	};
}
