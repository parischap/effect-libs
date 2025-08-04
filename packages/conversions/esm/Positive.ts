/**
 * A module that implements a positive number brand (negative number disallowed). Not exported. Only
 * used internally
 */

import { MTypes } from '@parischap/effect-lib';
import { Brand, Either, Number, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/Positive/';

export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Positive type
 *
 * @category Models
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Constructs a Positive from a number. Throws if the number is not an integer
 *
 * @category Constructors
 */
export const constructor = Brand.refined<Type>(Number.greaterThanOrEqualTo(0), (n) =>
	Brand.error(`'${n}' is not positive`)
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
