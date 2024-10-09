/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.3.4
 */

import { Brand, Either, Number, Option, Predicate } from 'effect';
import * as MNumber from './Number.js';
import * as MString from './String.js';

const moduleTag = '@parischap/effect-lib/Brand/';

/**
 * Constructor type with refined input
 *
 * @since 0.3.4
 * @category Models
 */
export interface RefinedConstructor<in B, in out A extends Brand.Brand<string | symbol> & B> {
	readonly [Brand.RefinedConstructorsTypeId]: Brand.RefinedConstructorsTypeId;
	/**
	 * Constructs a branded type from a value of type `A`, throwing an error if the provided `A` is
	 * not valid.
	 */
	(args: B): A;
	/**
	 * Constructs a branded type from a value of type `A`, returning `Some<A>` if the provided `A` is
	 * valid, `None` otherwise.
	 */
	readonly option: (args: B) => Option.Option<A>;
	/**
	 * Constructs a branded type from a value of type `A`, returning `Right<A>` if the provided `A` is
	 * valid, `Left<BrandError>` otherwise.
	 */
	readonly either: (args: B) => Either.Either<A, Brand.Brand.BrandErrors>;
	/**
	 * Attempts to refine the provided value of type `A`, returning `true` if the provided `A` is
	 * valid, `false` otherwise.
	 */
	readonly is: (a: B) => a is Brand.Brand.Unbranded<A> & A;
}

/**
 * This namespace implements an Email brand.
 *
 * @since 0.4.0
 */
export namespace Email {
	const namespaceTag = moduleTag + 'Email/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
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
	const namespaceTag = moduleTag + 'SemVer/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
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
	const namespaceTag = moduleTag + 'Real/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
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
	export const unsafeFromNumber: RefinedConstructor<number, Type> = Brand.nominal<Type>();

	/**
	 * Constructs a Real from a number. Throws an error if the provided number is not finite
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber: RefinedConstructor<number, Type> = Brand.refined<Type>(
		MNumber.isFinite,
		(n) => Brand.error(`'${n}' does not represent a finite real number`)
	);
}

/**
 * This namespace implements a finite integer brand (no Infinity or Nan)
 *
 * @since 0.4.0
 */
export namespace Int {
	const namespaceTag = moduleTag + 'Int/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
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
	export const unsafeFromNumber: RefinedConstructor<number, Type> = Brand.nominal<Type>();

	const _fromNumber = (pred: Predicate.Predicate<number>) =>
		Brand.refined<Type>(pred, (n) => Brand.error(`'${n}' does not represent a finite integer`));

	/**
	 * Constructs an Int from a number. Throws an error if the provided number is not a finite integer
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber: RefinedConstructor<number, Type> = _fromNumber(
		Predicate.and(MNumber.isFinite, MNumber.isInt)
	);

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
	const namespaceTag = moduleTag + 'IntRange/';
	const TypeId: unique symbol = Symbol.for(namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * IntRange type - `Max` must be bigger than `Min`
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type<Min extends number, Max extends number> = Brand.Branded<
		Int.Type,
		`${typeof namespaceTag}${Min}-${Max}`
	>;

	/**
	 * Constructs an IntRange from a number without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromNumber = <Min extends number, Max extends number>(
		_minimum: Min,
		_maximum: Max
	): RefinedConstructor<number, Type<Min, Max>> => Brand.nominal<Type<Min, Max>>() as never;

	const _fromNumber = <Min extends number, Max extends number>(
		minimum: Min,
		maximum: Max,
		pred: Predicate.Predicate<number>
	): RefinedConstructor<number, Type<Min, Max>> =>
		Brand.refined<Type<Min, Max>>(pred, (n) =>
			Brand.error(`'${n}' is not a finite integer in the range [${minimum} - ${maximum}]`)
		) as never;

	/**
	 * Constructs an IntRange from a number. Throws an error if the provided number is not an integer,
	 * not in the given range or not finite
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber = <Min extends number, Max extends number>(
		minimum: Min,
		maximum: Max
	): RefinedConstructor<number, Type<Min, Max>> =>
		_fromNumber(
			minimum,
			maximum,
			Predicate.every([MNumber.isFinite, MNumber.isInt, Number.between({ minimum, maximum })])
		);

	/**
	 * Constructs an IntRange from an Real. Throws an error if the provided number is not an integer
	 * or not in the given range
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromReal = <Min extends number, Max extends number>(
		minimum: Min,
		maximum: Max
	): RefinedConstructor<Real.Type, Type<Min, Max>> =>
		_fromNumber(
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
	export const fromInt = <Min extends number, Max extends number>(
		minimum: Min,
		maximum: Max
	): RefinedConstructor<Int.Type, Type<Min, Max>> =>
		_fromNumber(minimum, maximum, Number.between({ minimum, maximum }));
}

/**
 * This namespace implements a positive integer brand.
 *
 * @since 0.4.0
 */
export namespace PositiveInt {
	/**
	 * Type for positive integers
	 *
	 * @since 0.3.4
	 * @category Instances
	 */
	export type Type = IntRange.Type<0, typeof Infinity>;

	/**
	 * Constructs a PositiveInt from a number without any verifications
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const unsafeFromNumber: RefinedConstructor<number, Type> = IntRange.unsafeFromNumber(
		0,
		+Infinity
	);

	/**
	 * Constructs a PositiveInt from a number. Throws an error if the provided number is not an
	 * integer, not positive or not finite
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromNumber: RefinedConstructor<number, Type> = IntRange.fromNumber(0, +Infinity);

	/**
	 * Constructs a PositiveInt from a Real. Throws an error if the provided number is not a positive
	 * integer
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromReal: RefinedConstructor<Real.Type, Type> = IntRange.fromReal(0, +Infinity);

	/**
	 * Constructs a PositiveInt from an Int. Throws an error if the provided Int is not positive
	 *
	 * @since 0.3.4
	 * @category Constructors
	 */
	export const fromInt: RefinedConstructor<Int.Type, Type> = IntRange.fromInt(0, +Infinity);
}
