/**
 * This module implements a CVReal brand, i.e. a number that disallows Infinity and NaN. Can be used
 * to represent a temperature, a height from sea-level,... See the `Effect` documentation about
 * Branding (https://effect.website/docs/code-style/branded-types/) if you are not familiar with
 * this concept.
 */

import { MNumber, MString, MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Option, Schema } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/primitive/Real/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * `CVReal` type
 *
 * @category Models
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Brand constructor. Should not be used directly
 *
 * @ignore
 */
export const constructor = Brand.refined<Type>(
  MNumber.isFinite,
  flow(
    MString.fromNumber(10),
    MString.prepend("'"),
    MString.append("' does not represent a finite number"),
    Brand.error,
  ),
);

/**
 * Constructs a `CVReal` from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Tries to construct a `CVReal` from a number. Returns a `Some` if the conversion can be performed,
 * a `None` otherwise
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
  number,
  Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVReal` from a number. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
  number,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVReal` from a number if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs a `CVReal` from a `BigDecimal` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
  MNumber.unsafeFromBigDecimal as never;

/**
 * Tries to construct a `CVReal` from a `BigDecimal`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<Type>
> = MNumber.fromBigDecimalOption as never;

/**
 * Tries to construct a `CVReal` from a `BigDecimal`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = MNumber.fromBigDecimal as never;

/**
 * Constructs a `CVReal` from a `BigDecimal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
  MNumber.fromBigDecimalOrThrow as never;

/**
 * Constructs a `CVReal` from a `BigInt` without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
  MNumber.unsafeFromBigInt as never;

/**
 * Tries to construct a `CVReal` from a `BigInt`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<
  bigint,
  Option.Option<Type>
> = MNumber.fromBigIntOption as never;

/**
 * Tries to construct a `CVReal` from a `BigInt`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
  bigint,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = MNumber.fromBigInt as never;

/**
 * Constructs a `CVReal` from a `BigInt` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> =
  MNumber.fromBigIntOrThrow as never;

/**
 * A `Schema` that transforms a number into a `CVReal`
 *
 * @ignore
 */
export const SchemaFromNumber: Schema.Schema<Type, number> = Schema.Number.pipe(
  Schema.fromBrand(constructor),
);

/**
 * A `Schema` that represents a `CVReal`
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromNumber);
