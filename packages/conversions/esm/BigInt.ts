/** A simple extension to the Effect BigInt module */

import { MBigInt, MTypes } from '@parischap/effect-lib';
import { Brand, Either, Option } from 'effect';
import * as CVInteger from './Integer.js';
import * as CVReal from './Real.js';

/**
 * Constructs a BigInt from a Integer
 *
 * @category Constructors
 */
export const fromInteger: MTypes.OneArgFunction<CVInteger.Type, bigint> =
	MBigInt.fromPrimitiveOrThrow;

/**
 * Constructs an Option of a BigInt from a Real
 *
 * @category Constructors
 */
export const fromRealOption: MTypes.OneArgFunction<
	CVReal.Type,
	Option.Option<bigint>
> = MBigInt.fromPrimitiveOption as never;

/**
 * Constructs an Either of a BigInt from a Real
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<
	CVReal.Type,
	Either.Either<bigint, Brand.Brand.BrandErrors>
> = MBigInt.fromPrimitive as never;

/**
 * Constructs a BigInt from a Real or throws
 *
 * @category Constructors
 */
export const fromRealOrThrow: MTypes.OneArgFunction<CVReal.Type, bigint> =
	MBigInt.fromPrimitiveOrThrow as never;
