/**
 * A module that implements an integer brand (non-null fractional part disallowed). Not exported.
 * Only used internally
 */

import { MNumber, MTypes } from '@parischap/effect-lib';
import { Brand, Either, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/Int/';

export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Int type
 *
 * @category Models
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Constructs an Int from a number. Throws if the number is not an integer
 *
 * @category Constructors
 */
export const constructor = Brand.refined<Type>(MNumber.isInt, (n) =>
	Brand.error(`'${n}' does not represent an integer`)
);

/**
 * Constructs an Option of an Int from a number.
 *
 * @category Constructors
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of an Int from a number.
 *
 * @category Constructors
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);
