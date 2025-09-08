/**
 * This module implements a CVPositiveInteger brand, i.e. a number that represents an integer
 * greater than or equal to 0 (Infinity, NaN disallowed). Can be used to represent an age, a
 * quantity,... See the `Effect` documentation about Branding
 * (https://effect.website/docs/code-style/branded-types/) if you are not familiar with this
 * concept.
 */

import { MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Function, Option, Schema } from 'effect';
import * as CVInteger from './Integer.js';
import * as CVPositive from './internal/Positive.js';
import type * as CVPositiveReal from './PositiveReal.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/PositiveInteger/';

/**
 * Brand constructor. Should not be used directly
 *
 * @ignore
 */
export const constructor = Brand.all(CVInteger.constructor, CVPositive.constructor);

/**
 * `CVPositiveInteger` type
 *
 * @category Models
 */
export type Type = Brand.Brand.FromConstructor<typeof constructor>;

/**
 * Constructs a `CVPositiveInteger` from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Tries to construct a `CVPositiveInteger` from a number. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVPositiveInteger` from a number. Returns a `Right` if the conversion can
 * be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVPositiveInteger` from a number if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs a `CVPositiveInteger` from a `BigDecimal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
	CVInteger.unsafeFromBigDecimal as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `BigDecimal`. Returns a `Some` if the conversion
 * can be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<Type>
> = flow(CVInteger.fromBigDecimalOption, Option.flatMap(CVPositive.fromNumberOption)) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `BigDecimal`. Returns a `Right` if the conversion
 * can be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVInteger.fromBigDecimal, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs a `CVPositiveInteger` from a `BigDecimal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> = flow(
	CVInteger.fromBigDecimalOrThrow,
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Constructs a `CVPositiveInteger` from a `BigInt` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
	CVInteger.unsafeFromBigInt as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `BigInt`. Returns a `Some` if the conversion can
 * be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<Type>> = flow(
	CVInteger.fromBigIntOption,
	Option.flatMap(CVPositive.fromNumberOption)
) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `BigInt`. Returns a `Right` if the conversion can
 * be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVInteger.fromBigInt, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs a `CVPositiveInteger` from a `BigInt` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> = flow(
	CVInteger.fromBigIntOrThrow,
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Constructs a `CVPositiveInteger` from a `CVReal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromReal: MTypes.OneArgFunction<CVReal.Type, Type> = Function.identity as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVReal`. Returns a `Some` if the conversion can
 * be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<CVReal.Type, Option.Option<Type>> = flow(
	CVInteger.fromRealOption,
	Option.flatMap(CVPositive.fromNumberOption)
) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVReal`. Returns a `Right` if the conversion can
 * be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVInteger.fromReal, Either.flatMap(CVPositive.fromNumber)) as never;

/**
 * Constructs a `CVPositiveInteger` from a `CVReal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, Type> = flow(
	CVInteger.fromRealOrThrow,
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVInteger`. Returns a `Some` if the conversion
 * can be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromIntegerOption: MTypes.OneArgFunction<CVInteger.Type, Option.Option<Type>> = flow(
	CVPositive.fromNumberOption
) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVInteger`. Returns a `Right` if the conversion
 * can be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromInteger: MTypes.OneArgFunction<
	CVInteger.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVPositive.fromNumber as never;

/**
 * Constructs a `CVPositiveInteger` from a `CVInteger` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromIntegerOrThrow: MTypes.OneArgFunction<CVInteger.Type, Type> = flow(
	CVPositive.fromNumberOrThrow
) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVPositiveReal`. Returns a `Some` if the
 * conversion can be performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromPositiveRealOption: MTypes.OneArgFunction<
	CVPositiveReal.Type,
	Option.Option<Type>
> = flow(CVInteger.fromRealOption) as never;

/**
 * Tries to construct a `CVPositiveInteger` from a `CVPositiveReal`. Returns a `Right` if the
 * conversion can be performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromPositiveReal: MTypes.OneArgFunction<
	CVPositiveReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVInteger.fromReal as never;

/**
 * Constructs a `CVPositiveInteger` from a `CVPositiveReal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromPositiveRealOrThrow: MTypes.OneArgFunction<CVPositiveReal.Type, Type> = flow(
	CVInteger.fromRealOrThrow
) as never;

/**
 * A `Schema` that transforms a number into a `CVPositiveInteger`
 *
 * @ignore
 */
export const SchemaFromNumber: Schema.Schema<Type, number> = Schema.Number.pipe(
	Schema.fromBrand(constructor)
);

/**
 * A Schema that represents a `CVPositiveInteger`
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromNumber);
