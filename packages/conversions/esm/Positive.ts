/**
 * A module that implements a positive number brand (negative number disallowed). Not exported. Only
 * used internally
 */

import { MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, flow, Number, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Positive/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Positive type
 *
 * @category Models
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Brand constructor. Should not be used directly
 *
 * @category Constructors
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
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of a Positive from a number.
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a Positive from a number or throws
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;
