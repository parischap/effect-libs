/**
 * This module implements a positive finite integer brand. Useful for an age, a quantity, a street
 * number, hours, muinutes...
 */

import { MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow } from 'effect';
import * as CVInt from './Int.js';
import * as CVPositive from './Positive.js';
import * as CVPositiveReal from './PositiveReal.js';
import type * as CVReal from './Real.js';
import * as CVRealInt from './RealInt.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/formatting/PositiveRealInt/';

/**
 * Constructs a PositiveRealInt from a number. Throws if the number is not a finite positive integer
 *
 * @category Constructors
 */
export const constructor = Brand.all(CVRealInt.constructor, CVPositive.constructor);

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
> = flow(CVPositiveReal.fromBigDecimal, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs an Either of a PositiveRealInt from a bigint.
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVPositiveReal.fromBigInt as never;

/**
 * Constructs an Either of a PositiveRealInt from a Real
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVPositive.fromNumber, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs an Either of a PositiveRealInt from a RealInt
 *
 * @category Constructors
 */
export const fromRealInt: MTypes.OneArgFunction<
	CVRealInt.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVPositive.fromNumber as never;

/**
 * Constructs an Either of a PositiveRealInt from a PositiveReal
 *
 * @category Constructors
 */
export const fromPositiveReal: MTypes.OneArgFunction<
	CVPositiveReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVInt.fromNumber as never;
