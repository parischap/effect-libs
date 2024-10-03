/**
 * This module implements a type that represents an integer comprised in a given range [a,n]
 * (inclusive) and related functions. NaN, +Infinity and -Infinity not allowed)
 *
 * @since 0.3.4
 */

import { Brand, Number, Predicate } from 'effect';
import type * as MBrand from './Brand.js';
import type * as MInt from './Int.js';
import * as MNumber from './Number.js';
import type * as MReal from './Real.js';

const moduleTag = '@parischap/effect-lib/IntRange/';
type moduleTag = typeof moduleTag;

/**
 * IntRange type - `Max` must be bigger than `Min`
 *
 * @since 0.3.4
 * @category Models
 */
export type Type<Min extends number, Max extends number> = Brand.Branded<
	MInt.Type,
	`${moduleTag}${Min}-${Max}`
>;

/**
 * Constructs an IntRange from a number without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromNumber = <Min extends number, Max extends number>(
	_minimum: Min,
	_maximum: Max
): MBrand.RefinedConstructor<number, Type<Min, Max>> => Brand.nominal<Type<Min, Max>>() as never;

const _fromNumber = <Min extends number, Max extends number>(
	minimum: Min,
	maximum: Max,
	pred: Predicate.Predicate<number>
): MBrand.RefinedConstructor<number, Type<Min, Max>> =>
	Brand.refined<Type<Min, Max>>(pred, (n) =>
		Brand.error(`'${n}' is not a finite integer in the range [${minimum} - ${maximum}]`)
	) as never;

/**
 * Constructs an IntRange from a number. Throws an error if the provided number is not an integer,
 * not in the given range or not finite
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromNumber = <Min extends number, Max extends number>(
	minimum: Min,
	maximum: Max
): MBrand.RefinedConstructor<number, Type<Min, Max>> =>
	_fromNumber(
		minimum,
		maximum,
		Predicate.every([MNumber.isFinite, MNumber.isInt, Number.between({ minimum, maximum })])
	);

/**
 * Constructs an IntRange from an MReal. Throws an error if the provided number is not an integer or
 * not in the given range
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromReal = <Min extends number, Max extends number>(
	minimum: Min,
	maximum: Max
): MBrand.RefinedConstructor<MReal.Type, Type<Min, Max>> =>
	_fromNumber(minimum, maximum, Predicate.and(MNumber.isInt, Number.between({ minimum, maximum })));

/**
 * Constructs an IntRange from an MInt. Throws an error if the provided number is not in the given
 * range
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromInt = <Min extends number, Max extends number>(
	minimum: Min,
	maximum: Max
): MBrand.RefinedConstructor<MInt.Type, Type<Min, Max>> =>
	_fromNumber(minimum, maximum, Number.between({ minimum, maximum }));
