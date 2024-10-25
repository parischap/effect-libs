/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.3.4
 */

import { Brand, Number, Predicate } from 'effect';
import * as MNumber from './Number.js';
import * as MString from './String.js';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/Brand/';
const _moduleTag = moduleTag;

/** Brand constructor type with refined input */

type RefinedConstructor<B, A extends Brand.Brand<string | symbol> & B> = MTypes.WithArgType<
	Brand.Brand.Constructor<A>,
	B
> & {
	readonly [k in keyof Brand.Brand.Constructor<A>]: MTypes.WithArgType<
		Brand.Brand.Constructor<A>[k],
		B
	>;
};

/**
 * This namespace implements an Email brand.
 *
 * @since 0.4.0
 */
export namespace Email {
	const moduleTag = _moduleTag + 'Email/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;
	/**
	 * Email type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<string, TypeId>;

	/**
	 * Constructs an Email without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromString = Brand.nominal<Type>();

	/**
	 * Constructs an Email from a string. Throws an error if the provided string does not match the
	 * `email` pattern
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromString = Brand.refined<Type>(MString.isEmail, (s) =>
		Brand.error(`'${s}' does not represent an Email`)
	);
}

/**
 * This namespace implements a SemVer brand.
 *
 * @since 0.4.0
 */
export namespace SemVer {
	const moduleTag = _moduleTag + 'SemVer/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * SemVer type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<string, TypeId>;

	/**
	 * Constructs a SemVer without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromString = Brand.nominal<Type>();

	/**
	 * Constructs a SemVer from a string. Throws an error if the provided string does not match the
	 * `semVer` pattern
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromString = Brand.refined<Type>(MString.isSemVer, (s) =>
		Brand.error(`'${s}' does not represent a SemVer`)
	);
}

/**
 * This namespace implements a finite real number brand (no Infinity or Nan)
 *
 * @since 0.4.0
 */
export namespace Real {
	const moduleTag = _moduleTag + 'Real/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Real type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<number, TypeId>;

	/**
	 * Constructs a Real from a number without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs a Real from a number. Throws an error if the provided number is not finite
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber = Brand.refined<Type>(MNumber.isFinite, (n) =>
		Brand.error(`'${n}' does not represent a finite real number`)
	);
}

/**
 * This namespace implements a finite integer brand (no Infinity or Nan)
 *
 * @since 0.4.0
 */
export namespace Int {
	const moduleTag = _moduleTag + 'Int/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Int type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<Real.Type, TypeId>;

	/**
	 * Constructs an Int from a number without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	const _fromNumber = (pred: Predicate.Predicate<number>) =>
		Brand.refined<Type>(pred, (n) => Brand.error(`'${n}' does not represent a finite integer`));

	/**
	 * Constructs an Int from a number. Throws an error if the provided number is not a finite integer
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber = _fromNumber(Predicate.and(MNumber.isFinite, MNumber.isInt));

	/**
	 * Constructs an Int from an Real. Throws an error if the provided number is not an integer
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromReal: RefinedConstructor<Real.Type, Type> = _fromNumber(MNumber.isInt);
}

/**
 * This namespace implements a integer range brand.
 *
 * @since 0.4.0
 */
export namespace IntRange {
	/**
	 * IntRange type - `Max` must be bigger than `Min`
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type<Name extends symbol> = Brand.Branded<Int.Type, Name>;

	/**
	 * Constructs an IntRange from a number without any verifications
	 *
	 * @since 0.3.4
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
		) as never;

	/**
	 * Constructs an IntRange from a number. Throws an error if the provided number is not an integer,
	 * not in the given range or not finite
	 *
	 * @since 0.3.4
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
	 * @since 0.3.4
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
		);

	/**
	 * Constructs an IntRange from an Int. Throws an error if the provided number is not in the given
	 * range
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromInt = <Name extends symbol>(
		minimum: number,
		maximum: number
	): RefinedConstructor<Int.Type, Type<Name>> =>
		_fromNumber<Name>(minimum, maximum, Number.between({ minimum, maximum }));
}

/**
 * This namespace implements a positive integer brand.
 *
 * @since 0.4.0
 */
export namespace PositiveInt {
	const moduleTag = _moduleTag + 'PositiveInt/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;
	/**
	 * Type for positive integers
	 *
	 * @since 0.3.4
	 * @category Instances
	 */
	export type Type = IntRange.Type<TypeId>;

	/**
	 * Constructs a PositiveInt from a number without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromNumber = IntRange.unsafeFromNumber<TypeId>();

	/**
	 * Constructs a PositiveInt from a number. Throws an error if the provided number is not an
	 * integer, not positive or not finite
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber = IntRange.fromNumber<TypeId>(0, +Infinity);

	/**
	 * Constructs a PositiveInt from a Real. Throws an error if the provided number is not a positive
	 * integer
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromReal = IntRange.fromReal<TypeId>(0, +Infinity);

	/**
	 * Constructs a PositiveInt from an Int. Throws an error if the provided Int is not positive
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromInt = IntRange.fromInt<TypeId>(0, +Infinity);
}
