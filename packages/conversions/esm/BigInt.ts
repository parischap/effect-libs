/** A simple extension to the `Effect.BigInt` module */

import { MBigInt, MTypes } from "@parischap/effect-lib";
import { Brand, Either, Option } from "effect";
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
