/** This module implements a finite number brand (Infinity or Nan disallowed) */

import { MBigDecimal, MBigInt, MNumber, MTypes } from '@parischap/effect-lib';
import { BigDecimal, BigInt, Brand, Either, flow } from 'effect';
import * as CVInt from './Int.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/Real/';

export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

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

/**
 * Constructs a BigDecimal from a Real.
 *
 * @category Destructors
 */
export const toBigDecimal: MTypes.OneArgFunction<Type, BigDecimal.BigDecimal> =
	BigDecimal.unsafeFromNumber;

/**
 * Constructs an Either of a bigint from a Real.
 *
 * @category Destructors
 */
export const toBigInt: MTypes.OneArgFunction<
	Type,
	Either.Either<bigint, Brand.Brand.BrandErrors>
> = flow(CVInt.fromNumber, Either.map(MBigInt.unsafeFromNumber));
