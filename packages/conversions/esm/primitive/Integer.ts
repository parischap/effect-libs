/**
 * This module implements a CVInteger brand, i.e. a number that represents an integer (Infinity, NaN
 * disallowed). Can be used to represent a floor in a lift, a signed quantity... See the `Effect`
 * documentation about Branding (https://effect.website/docs/code-style/branded-types/) if you are
 * not familiar with this concept.
 */

import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow} from 'effect'
import * as BigDecimal from 'effect/BigDecimal'
import * as Brand from 'effect/Brand'
import * as Either from 'effect/Either'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'
import * as CVInt from '../internal/primitive/Int.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/primitive/Integer/';

/**
 * Brand constructor. Should not be used directly
 *
 * @ignore
 */
export const constructor = Brand.all(CVReal.constructor, CVInt.constructor);

/**
 * `CVInteger` type
 *
 * @category Models
 */
export type Type = Brand.Brand.FromConstructor<typeof constructor>;

/**
 * Constructs a `CVInteger` from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Tries to construct a `CVInteger` from a number. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
  number,
  Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVnteger` from a number. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
  number,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVInteger` from a number if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs a `CVInteger` from a `BigDecimal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
  CVReal.unsafeFromBigDecimal as never;

/**
 * Tries to construct a `CVInteger` from a `BigDecimal`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<Type>
> = flow(CVReal.fromBigDecimalOption, Option.flatMap(CVInt.fromNumberOption)) as never;

/**
 * Tries to construct a `CVInteger` from a `BigDecimal`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigDecimal, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs a `CVInteger` from a `BigDecimal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> = flow(
  CVReal.fromBigDecimalOrThrow,
  CVInt.fromNumberOrThrow,
) as never;

/**
 * Constructs a `CVInteger` from a `BigInt` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
  CVReal.unsafeFromBigInt as never;

/**
 * Tries to construct a `CVInteger` from a `BigInt`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<Type>> = flow(
  CVReal.fromBigIntOption,
) as never;

/**
 * Tries to construct a `CVInteger` from a `BigInt`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
  bigint,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigInt, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs a `CVInteger` from a `BigInt` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> = flow(
  CVReal.fromBigIntOrThrow,
) as never;

/**
 * Constructs a `CVInteger` from a `CVReal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromReal: MTypes.OneArgFunction<CVReal.Type, Type> = Function.identity as never;

/**
 * Tries to construct a `CVInteger` from a `CVReal`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
  CVReal.Type,
  Option.Option<Type>
> = CVInt.fromNumberOption as never;

/**
 * Tries to construct a `CVInteger` from a `CVReal`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
  CVReal.Type,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = CVInt.fromNumber as never;

/**
 * Constructs a `CVInteger` from a `CVReal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, Type> =
  CVInt.fromNumberOrThrow as never;

/**
 * A `Schema` that transforms a number into a `CVInteger`
 *
 * @ignore
 */
export const SchemaFromNumber: Schema.Schema<Type, number> = Schema.Number.pipe(
  Schema.fromBrand(constructor),
);

/**
 * A `Schema` that represents a `CVInteger`
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromNumber);
