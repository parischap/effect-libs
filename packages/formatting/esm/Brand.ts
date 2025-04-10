/** A simple extension to the Effect Brand module */

import { MBigDecimal, MNumber, MString, MTypes } from '@parischap/effect-lib';
import { BigDecimal, BigInt, Brand, Either, flow, Function, Number } from 'effect';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/formatting/Brand/';

/**
 * This namespace implements an Email brand
 *
 * @category Models
 */
export namespace Email {
	const _namespaceTag = moduleTag + 'Email/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
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
	 * Constructs an Email from a string. Throws an error if the provided string does not represent an
	 * email
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.refined<Type>(MString.isEmail, (s) =>
		Brand.error(`'${s}' does not represent a email`)
	);

	/**
	 * Constructs an Either of an Email from a string.
	 *
	 * @category Constructors
	 */
	export const fromString = constructor.either.bind(constructor);
}

/**
 * This namespace implements a SemVer brand
 *
 * @category Models
 */
export namespace SemVer {
	const _namespaceTag = moduleTag + 'SemVer/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
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
	 * Constructs a SemVer from a string. Throws an error if the provided string does not represent a
	 * semver
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.refined<Type>(MString.isSemVer, (s) =>
		Brand.error(`'${s}' does not represent a semver`)
	);

	/**
	 * Constructs an Either of a SemVer from a string.
	 *
	 * @category Constructors
	 */
	export const fromString = constructor.either.bind(constructor);
}

/**
 * This namespace implements a finite number brand (Infinity or Nan disallowed)
 *
 * @category Models
 */
export namespace Real {
	const _namespaceTag = moduleTag + 'Real/';
	export const TypeId: unique symbol = Symbol.for(_namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Real type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<number, TypeId>;

	/**
	 * Constructs a Real from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs a Real from a number. Throws an error if the provided number does not represent a
	 * finite number
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.refined<Type>(MNumber.isFinite, (n) =>
		Brand.error(`'${n}' does not represent a finite number`)
	);

	/**
	 * Constructs an Either of a Real from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber: MTypes.OneArgFunction<
		number,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = constructor.either.bind(constructor);

	/**
	 * Constructs an Either of a Real from a BigDecimal.
	 *
	 * @category Constructors
	 */
	export const fromBigDecimal: MTypes.OneArgFunction<
		BigDecimal.BigDecimal,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(
		MBigDecimal.toNumber,
		Either.fromOption(() => Brand.error('BigDecimal too big to be converted to number'))
	) as never;

	/**
	 * Constructs an Either of a Real from a bigint.
	 *
	 * @category Constructors
	 */
	export const fromBigInt: MTypes.OneArgFunction<
		bigint,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(
		BigInt.toNumber,
		Either.fromOption(() => Brand.error('BigInt too big to be converted to number'))
	) as never;
}

/**
 * This namespace implements an integer brand (non-null fractional part disallowed)
 *
 * @category Models
 */
namespace Int {
	const _namespaceTag = moduleTag + 'Int/';
	export const TypeId: unique symbol = Symbol.for(_namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Int type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<number, TypeId>;

	/**
	 * Constructs an Int from a number. Throws if the number is not an integer
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.refined<Type>(MNumber.isInt, (n) =>
		Brand.error(`'${n}' does not represent an integer`)
	);

	/**
	 * Constructs an Either of an Int from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber: MTypes.OneArgFunction<
		number,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = constructor.either.bind(constructor);
}

/**
 * This namespace implements a finite integer brand (Infinity, NaN or non-null fractional part
 * disallowed)
 *
 * @category Models
 */
export namespace RealInt {
	/**
	 * Constructs a RealInt from a number. Throws if the number is not a finite integer
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.all(Real.constructor, Int.constructor);

	/**
	 * RealInt type
	 *
	 * @category Models
	 */
	export type Type = Brand.Brand.FromConstructor<typeof constructor>;

	/**
	 * Constructs an Either of a RealInt from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber = constructor.either.bind(constructor);

	/**
	 * Constructs a RealInt from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs an Either of a RealInt from a BigDecimal.
	 *
	 * @category Constructors
	 */
	export const fromBigDecimal: MTypes.OneArgFunction<
		BigDecimal.BigDecimal,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(Real.fromBigDecimal, Either.flatMap(Int.fromNumber)) as never;

	/**
	 * Constructs an Either of a RealInt from a bigint.
	 *
	 * @category Constructors
	 */
	export const fromBigInt: MTypes.OneArgFunction<
		bigint,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Real.fromBigInt as never;

	/**
	 * Constructs an Either of a RealInt from a Real.
	 *
	 * @category Constructors
	 */
	export const fromReal: MTypes.OneArgFunction<
		Real.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Int.fromNumber as never;
}

/**
 * This namespace implements a positive number brand (strictly negative numbers disallowed)
 *
 * @category Models
 */
namespace Positive {
	const _namespaceTag = moduleTag + 'Positive/';
	export const TypeId: unique symbol = Symbol.for(_namespaceTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Positive type
	 *
	 * @category Models
	 */
	export type Type = Brand.Branded<number, TypeId>;

	/**
	 * Constructs a Positive from a number. Throws if the number is not an integer
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.refined<Type>(Number.greaterThanOrEqualTo(0), (n) =>
		Brand.error(`'${n}' is not positive`)
	);

	/**
	 * Constructs an Either of a Positive from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber = constructor.either.bind(constructor);
}

/**
 * This namespace implements a positive finite number brand (NaN, Infinity and negative numbers
 * disallowed)
 *
 * @category Models
 */
export namespace PositiveReal {
	/**
	 * Constructs a PositiveReal from a number. Throws if the number is not a finite positive integer
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.all(Real.constructor, Positive.constructor);

	/**
	 * PositiveReal type
	 *
	 * @category Models
	 */
	export type Type = Brand.Brand.FromConstructor<typeof constructor>;

	/**
	 * Constructs an Either of a PositiveReal from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber = constructor.either.bind(constructor);

	/**
	 * Constructs a PositiveReal from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs an Either of a PositiveReal from a BigDecimal.
	 *
	 * @category Constructors
	 */
	export const fromBigDecimal: MTypes.OneArgFunction<
		BigDecimal.BigDecimal,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(Real.fromBigDecimal, Either.flatMap(Positive.fromNumber)) as never;

	/**
	 * Constructs an Either of a PositiveReal from a bigint.
	 *
	 * @category Constructors
	 */
	export const fromBigInt: MTypes.OneArgFunction<
		bigint,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(Real.fromBigInt, Either.flatMap(Positive.fromNumber)) as never;

	/**
	 * Constructs an Either of a PositiveReal from a Real
	 *
	 * @category Constructors
	 */
	export const fromReal: MTypes.OneArgFunction<
		Real.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Positive.fromNumber as never;

	/**
	 * Constructs an Either of a PositiveReal from a PositiveRealInt.
	 *
	 * @category Constructors
	 */
	export const fromPositiveRealInt: MTypes.OneArgFunction<
		PositiveRealInt.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Function.identity as never;
}

/**
 * This namespace implements a positive finite integer brand
 *
 * @category Models
 */
export namespace PositiveRealInt {
	/**
	 * Constructs a PositiveRealInt from a number. Throws if the number is not a finite positive
	 * integer
	 *
	 * @category Constructors
	 */
	export const constructor = Brand.all(RealInt.constructor, Positive.constructor);

	/**
	 * PositiveRealInt type
	 *
	 * @category Models
	 */
	export type Type = Brand.Brand.FromConstructor<typeof constructor>;

	/**
	 * Constructs an Either of a PositiveRealInt from a number.
	 *
	 * @category Constructors
	 */
	export const fromNumber = constructor.either.bind(constructor);

	/**
	 * Constructs a PositiveRealInt from a number without any verifications
	 *
	 * @category Constructors
	 */
	export const unsafeFromNumber = Brand.nominal<Type>();

	/**
	 * Constructs an Either of a PositiveRealInt from a BigDecimal.
	 *
	 * @category Constructors
	 */
	export const fromBigDecimal: MTypes.OneArgFunction<
		BigDecimal.BigDecimal,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(PositiveReal.fromBigDecimal, Either.flatMap(Int.fromNumber)) as never;

	/**
	 * Constructs an Either of a PositiveRealInt from a bigint.
	 *
	 * @category Constructors
	 */
	export const fromBigInt: MTypes.OneArgFunction<
		bigint,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = PositiveReal.fromBigInt as never;

	/**
	 * Constructs an Either of a PositiveRealInt from a Real
	 *
	 * @category Constructors
	 */
	export const fromReal: MTypes.OneArgFunction<
		Real.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = flow(Positive.fromNumber, Either.flatMap(Int.fromNumber)) as never;

	/**
	 * Constructs an Either of a PositiveRealInt from a RealInt
	 *
	 * @category Constructors
	 */
	export const fromRealInt: MTypes.OneArgFunction<
		RealInt.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Positive.fromNumber as never;

	/**
	 * Constructs an Either of a PositiveRealInt from a PositiveReal
	 *
	 * @category Constructors
	 */
	export const fromPositiveReal: MTypes.OneArgFunction<
		PositiveReal.Type,
		Either.Either<Type, Brand.Brand.BrandErrors>
	> = Int.fromNumber as never;
}
