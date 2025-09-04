/** This module implements a finite number brand (Infinity or Nan disallowed) */

import { MNumber, MString, MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Real/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Real type
 *
 * @category Models
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Brand constructor. Should not be used directly
 *
 * @category Constructors
 */
export const constructor = Brand.refined<Type>(
	MNumber.isFinite,
	flow(
		MString.fromNumber(10),
		MString.prepend("'"),
		MString.append("' does not represent a finite number"),
		Brand.error
	)
);

/**
 * Constructs a Real from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Constructs an Option of a Real from a number
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of a Real from a number
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a Real from a number or throws
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs a Real from a BigDecimal without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
	MNumber.unsafeFromBigDecimal as never;

/**
 * Constructs an Option of a Real from a BigDecimal.
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<Type>
> = MNumber.fromBigDecimalOption as never;

/**
 * Constructs an Either of a Real from a BigDecimal.
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = MNumber.fromBigDecimal as never;

/**
 * Constructs a Real from a BigDecimal or throws
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
	MNumber.fromBigDecimalOrThrow as never;

/**
 * Constructs a Real from a BigInt without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
	MNumber.unsafeFromBigInt as never;

/**
 * Constructs an Option of a Real from a BigInt.
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<
	bigint,
	Option.Option<Type>
> = MNumber.fromBigIntOption as never;

/**
 * Constructs an Either of a Real from a BigInt.
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = MNumber.fromBigInt as never;

/**
 * Constructs a Real from a BigInt or throws
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> =
	MNumber.fromBigIntOrThrow as never;
