/**
 * This module implements a Real number type and related functions.NaN, +Infinity and -Infinity not
 * allowed)
 *
 * @since 0.3.4
 */

import { Brand } from 'effect';
import type * as MBrand from './Brand.js';
import * as MNumber from './Number.js';

const moduleTag = '@parischap/effect-lib/Real/';
type moduleTag = typeof moduleTag;

/**
 * Real type
 *
 * @since 0.3.4
 * @category Models
 */
export type Type = Brand.Branded<number, moduleTag>;

/**
 * Constructs a Real from a number without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromNumber: MBrand.RefinedConstructor<number, Type> = Brand.nominal<Type>();

/**
 * Constructs a Real from a number. Throws an error if the provided number is not finite
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromNumber: MBrand.RefinedConstructor<number, Type> = Brand.refined<Type>(
	MNumber.isFinite,
	(n) => Brand.error(`'${n}' does not represent a finite real number`)
);
