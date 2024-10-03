/**
 * This module implements an Int number type and related functions. NaN, +Infinity and -Infinity not
 * allowed)
 *
 * @since 0.3.4
 */

import { Brand, Predicate } from 'effect';
import type * as MBrand from './Brand.js';
import * as MNumber from './Number.js';
import type * as MReal from './Real.js';

const moduleTag = '@parischap/effect-lib/Int/';
type moduleTag = typeof moduleTag;

/**
 * Int type
 *
 * @since 0.3.4
 * @category Models
 */
export type Type = Brand.Branded<MReal.Type, moduleTag>;

/**
 * Constructs an Int from a number without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromNumber: MBrand.RefinedConstructor<number, Type> = Brand.nominal<Type>();

const _fromNumber = (pred: Predicate.Predicate<number>) =>
	Brand.refined<Type>(pred, (n) => Brand.error(`'${n}' does not represent a finite integer`));

/**
 * Constructs an Int from a number. Throws an error if the provided number is not a finite integer
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromNumber: MBrand.RefinedConstructor<number, Type> = _fromNumber(
	Predicate.and(MNumber.isFinite, MNumber.isInt)
);

/**
 * Constructs an Int from an MReal. Throws an error if the provided number is not an integer
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromReal: MBrand.RefinedConstructor<MReal.Type, Type> = _fromNumber(MNumber.isInt);
