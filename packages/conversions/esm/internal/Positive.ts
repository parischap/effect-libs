/**
 * A module that implements a positive number brand (negative number disallowed). Not exported. Only
 * used internally
 */

import { MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, flow, Number, Option } from 'effect';

/**
 * Module tag
 *
 * @internal
 */
export const _moduleTag = '@parischap/conversions/Positive/';

/**
 * Module TypeId
 *
 * @internal
 */
export const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Positive type
 *
 * @internal
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Brand constructor. Should not be used directly
 *
 * @internal
 */
export const constructor = Brand.refined<Type>(
	Number.greaterThanOrEqualTo(0),
	flow(
		MString.fromNumber(10),
		MString.prepend("'"),
		MString.append("' is not positive"),
		Brand.error
	)
);

/**
 * Constructs an Option of a Positive from a number.
 *
 * @internal
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of a Positive from a number.
 *
 * @internal
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a Positive from a number or throws
 *
 * @internal
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;
