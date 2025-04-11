/**
 * This module implements a finite integer brand (Infinity, NaN or non-null fractional part
 * disallowed)
 */

import { MBigInt, MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow } from 'effect';
import * as CVInt from './Int.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/formatting/RealInt/';

/**
 * Constructs a RealInt from a number. Throws if the number is not a finite integer
 *
 * @category Constructors
 */
export const constructor = Brand.all(CVReal.constructor, CVInt.constructor);

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
> = flow(CVReal.fromBigDecimal, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs an Either of a RealInt from a bigint.
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVReal.fromBigInt as never;

/**
 * Constructs a BigDecimal from a RealInt.
 *
 * @category Destructors
 */
export const toBigDecimal: MTypes.OneArgFunction<Type, BigDecimal.BigDecimal> =
	BigDecimal.unsafeFromNumber;

/**
 * Constructs a bigint from a RealInt.
 *
 * @category Destructors
 */
export const toBigInt: MTypes.OneArgFunction<Type, bigint> = MBigInt.unsafeFromNumber;

/**
 * Constructs an Either of a RealInt from a Real.
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVInt.fromNumber as never;
