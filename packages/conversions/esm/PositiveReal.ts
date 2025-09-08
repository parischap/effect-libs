/**
 * This module implements a CVPositiveReal brand, i.e. a number greater than or equal to 0
 * (Infinity, NaN disallowed). Can be used to represent a price, a speed,... See the `Effect`
 * documentation about Branding (https://effect.website/docs/code-style/branded-types/) if you are
 * not familiar with this concept.
 */

import { MNumber, MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Function, Option, Schema } from 'effect';
import * as CVPositive from './internal/Positive.js';
import type * as CVPositiveInteger from './PositiveInteger.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/PositiveReal/';

/**
 * Brand constructor. Should not be used directly
 *
 * @ignore
 */
export const constructor = Brand.all(CVReal.constructor, CVPositive.constructor);

/**
 * `CVPositiveReal` Type
 *
 * @category Models
 */
export type Type = Brand.Brand.FromConstructor<typeof constructor>;

/**
 * Constructs a `CVPositiveReal` from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Tries to construct a `CVPositiveReal` from a number. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVPositiveReal` from a number. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVPositiveReal` from a number if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs a `CVPositiveReal` from a `BigDecimal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
	MNumber.unsafeFromBigDecimal as never;

/**
 * Tries to construct a `CVPositiveReal` from a `BigDecimal`. Returns a `Some` if the conversion can
 * be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<Type>
> = flow(CVReal.fromBigDecimalOption, Option.flatMap(CVPositive.fromNumberOption)) as never;

/**
 * Tries to construct a `CVPositiveReal` from a `BigDecimal`. Returns a `Right` if the conversion
 * can be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigDecimal, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs a `CVPositiveReal` from a `BigDecimal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> = flow(
	CVReal.fromBigDecimalOrThrow,
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Constructs a `CVPositiveReal` from a `BigInt` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
	MNumber.unsafeFromBigInt as never;

/**
 * Tries to construct a `CVPositiveReal` from a `BigInt`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<Type>> = flow(
	CVReal.fromBigIntOption,
	Option.flatMap(CVPositive.fromNumberOption)
) as never;

/**
 * Tries to construct a `CVPositiveReal` from a `BigInt`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigInt, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs a `CVPositiveReal` from a `BigInt` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> = flow(
	CVReal.fromBigIntOrThrow,
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Constructs a `CVPositiveReal` from a `CVReal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromReal: MTypes.OneArgFunction<CVReal.Type, Type> = Function.identity as never;

/**
 * Tries to construct a `CVPositiveReal` from a `CVReal`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
	CVReal.Type,
	Option.Option<Type>
> = CVPositive.fromNumberOption as never;

/**
 * Tries to construct a `CVPositiveReal` from a `CVReal`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVPositive.fromNumber as never;

/**
 * Constructs a `CVPositiveReal` from a `CVReal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, Type> =
	CVPositive.fromNumberOrThrow as never;

/**
 * Constructs a `CVPositiveReal` from a `CVPositiveInteger`
 *
 * @category Constructors
 */
export const fromPositiveInteger: MTypes.OneArgFunction<CVPositiveInteger.Type, Type> =
	Function.identity as never;

/**
 * A `Schema` that transforms a number into a `CVPositiveReal`
 *
 * @ignore
 */
export const SchemaFromNumber: Schema.Schema<Type, number> = Schema.Number.pipe(
	Schema.fromBrand(constructor)
);

/**
 * A `Schema` that represents a `CVPositiveReal`
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromNumber);
