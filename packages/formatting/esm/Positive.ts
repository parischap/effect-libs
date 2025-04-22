/**
 * A module that implements a positive number brand (negative number disallowed). Not exported. Only
 * used internally
 */

import { Brand, Number } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/formatting/Positive/';

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
 * Constructs an Either of a Positive from a number.
 *
 * @category Constructors
 */
export const fromNumber = constructor.either.bind(constructor);
