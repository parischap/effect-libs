/** A simple extension to the `Effect.BigInt` module */

import * as MBigInt from '@parischap/effect-lib/MBigInt'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Brand from 'effect/Brand'
import * as Either from 'effect/Either'
import * as Option from 'effect/Option'
import * as CVInteger from "./Integer.js";
import * as CVReal from "./Real.js";

/**
 * Constructs a `BigInt` from a `CVInteger`
 *
 * @category Constructors
 */
export const fromInteger: MTypes.OneArgFunction<CVInteger.Type, bigint> =
  MBigInt.fromPrimitiveOrThrow;

/**
 * Tries to construct a `BigInt` from a `CVReal`. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
  CVReal.Type,
  Option.Option<bigint>
> = MBigInt.fromPrimitiveOption as never;

/**
 * Tries to construct a `BigInt` from a `CVReal`. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
  CVReal.Type,
  Either.Either<bigint, Brand.Brand.BrandErrors>
> = MBigInt.fromPrimitive as never;

/**
 * Constructs a `BigInt` from a `CVReal` if possible. Throws otherwise
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, bigint> =
  MBigInt.fromPrimitiveOrThrow as never;
