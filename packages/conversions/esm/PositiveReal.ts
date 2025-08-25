/**
 * This module implements a positive finite number brand (NaN, Infinity and negative numbers
 * disallowed). Useful for a price, a physical quantity...
 */

import { MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Function, Option } from 'effect';
import { TypeId } from 'effect/Differ';
import * as CVPositive from './Positive.js';
import type * as CVPositiveRealInt from './PositiveRealInt.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/PositiveReal/';

/**
 * Constructs a PositiveReal from a number. Throws if the number is not a finite positive integer
 *
 * @category Constructors
 */
export const constructor = Brand.all(CVReal.constructor, CVPositive.constructor);

/**
 * PositiveReal type
 *
 * @category Models
 */
export type Type = Brand.Brand.FromConstructor<typeof constructor>;

/**
 * Constructs an Option of a PositiveReal from a number.
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of a PositiveReal from a number. Constructs an Either of a PositiveReal from
 * a number.
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a PositiveReal from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Constructs an Option of a PositiveReal from a BigDecimal.
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<Type>
> = flow(CVReal.fromBigDecimalOption, Option.flatMap(CVPositive.fromNumberOption)) as never;

/**
 * Constructs an Either of a PositiveReal from a BigDecimal.
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigDecimal, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs an Option of a PositiveReal from a bigint.
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<TypeId>> = flow(
	CVReal.fromBigIntOption,
	Option.flatMap(CVPositive.fromNumberOption)
) as never;

/**
 * Constructs an Either of a PositiveReal from a bigint.
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigInt, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs an Option of a PositiveReal from a Real
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
	CVReal.Type,
	Option.Option<Type>
> = CVPositive.fromNumberOption as never;

/**
 * Constructs an Either of a PositiveReal from a Real
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVPositive.fromNumber as never;

/**
 * Constructs a PositiveReal from a PositiveRealInt.
 *
 * @category Constructors
 */
export const fromPositiveRealInt: MTypes.OneArgFunction<CVPositiveRealInt.Type, Type> =
	Function.identity;
