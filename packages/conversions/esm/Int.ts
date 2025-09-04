/**
 * A module that implements an integer brand (non-null fractional part disallowed). Not exported.
 * Only used internally
 */

import { MNumber, MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, flow, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Int/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Int type
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
	MNumber.isInt,
	flow(
		MString.fromNumber(10),
		MString.prepend("'"),
		MString.append("' does not represent an integer"),
		Brand.error
	)
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

/**
 * Constructs an Int from a number or throws
 *
 * @category Constructors
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;
