/** A module that implements an Email brand */

import { MString } from '@parischap/effect-lib';
import { Brand } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/Email/';

export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Email type
 *
 * @category Models
 */
export type Type = Brand.Branded<string, _TypeId>;

/**
 * Constructs an Email without any verifications
 *
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Constructs an Email from a string. Throws an error if the provided string does not represent an
 * email
 *
 * @category Constructors
 */
export const constructor = Brand.refined<Type>(MString.isEmail, (s) =>
	Brand.error(`'${s}' does not represent a email`)
);

/**
 * Constructs an Either of an Email from a string.
 *
 * @category Constructors
 */
export const fromString = constructor.either.bind(constructor);

/**
 * Checks if a string is an email
 *
 * @category Refinement
 */
export const has = (input: string): input is Type => MString.isEmail(input);
