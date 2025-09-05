/**
 * This module implements a finite integer brand (Infinity, NaN or non-null fractional part
 * disallowed)
 */

import { MTypes } from '@parischap/effect-lib';
import { BigDecimal, Brand, Either, flow, Function, Option, Schema } from 'effect';
import * as CVInt from './internal/Int.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Integer/';

/**
 * Brand constructor. Should not be used directly
 *
 * @category Constructors
 */
export const constructor = Brand.all(CVReal.constructor, CVInt.constructor);

/**
 * Integer type
 *
 * @category Models
 */
export type Type = Brand.Brand.FromConstructor<typeof constructor>;

/**
 * Constructs an Integer from a number without any verifications
 *
 * @category Constructors
 */
export const unsafeFromNumber = Brand.nominal<Type>();

/**
 * Constructs an Option of an Integer from a number
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of an Integer from a number
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs an Integer from a number or throws
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;

/**
 * Constructs an Integer from a BigDecimal without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> =
	CVReal.unsafeFromBigDecimal as never;

/**
 * Constructs an Option of an Integer from a BigDecimal
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<Type>
> = flow(CVReal.fromBigDecimalOption, Option.flatMap(CVInt.fromNumberOption)) as never;

/**
 * Constructs an Either of an Integer from a BigDecimal
 *
 * @category Constructors
 */
export const fromBigDecimal: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigDecimal, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs an Integer from a BigDecimal or throws
 *
 * @category Constructors
 */
export const fromBigDecimalOrThrow: MTypes.OneArgFunction<BigDecimal.BigDecimal, Type> = flow(
	CVReal.fromBigDecimalOrThrow,
	CVInt.fromNumberOrThrow
) as never;

/**
 * Constructs an Integer from a BigInt without any checks
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, Type> =
	CVReal.unsafeFromBigInt as never;

/**
 * Constructs an Option of an Integer from a BigInt
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<Type>> = flow(
	CVReal.fromBigIntOption
) as never;

/**
 * Constructs an Either of an Integer from a BigInt
 *
 * @category Constructors
 */
export const fromBigInt: MTypes.OneArgFunction<
	bigint,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = flow(CVReal.fromBigInt, Either.flatMap(CVInt.fromNumber)) as never;

/**
 * Constructs an Integer from a BigInt or throws
 *
 * @category Constructors
 */
export const fromBigIntOrThrow: MTypes.OneArgFunction<bigint, Type> = flow(
	CVReal.fromBigIntOrThrow
) as never;

/**
 * Constructs an Integer from a Real without any checks
 *
 * @category Constructors
 */
export const unsafeFromReal: MTypes.OneArgFunction<CVReal.Type, Type> = Function.identity as never;

/**
 * Constructs an Option of an Integer from a Real
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
	CVReal.Type,
	Option.Option<Type>
> = CVInt.fromNumberOption as never;

/**
 * Constructs an Either of an Integer from a Real
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = CVInt.fromNumber as never;

/**
 * Constructs an Integer from a Real or throws
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, Type> =
	CVInt.fromNumberOrThrow as never;

/**
 * A Schema that transforms a number into a CVInteger.Type
 *
 * @internal
 */
export const SchemaFromNumber: Schema.Schema<Type, number> = Schema.Number.pipe(
	Schema.fromBrand(constructor)
);

/**
 * A Schema that represents a CVInteger.Type
 *
 * @internal
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromNumber);
