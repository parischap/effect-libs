/**
 * This module implements an Email type and related functions.
 *
 * @since 0.3.4
 */

import { JsRegExp } from '@parischap/js-lib';
import { Brand } from 'effect';

const moduleTag = '@parischap/effect-lib/Email/';
type moduleTag = typeof moduleTag;
const wholeLineEmailRegExp = new RegExp(JsRegExp.makeLine(JsRegExp.email));

/**
 * Email type
 *
 * @since 0.3.4
 * @category Models
 */
export type Type = Brand.Branded<string, moduleTag>;

/**
 * Constructs an Email without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Constructs an Email from a string. Throws an error if the provided string does not match the
 * `email` pattern
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromString = Brand.refined<Type>(
	(s) => wholeLineEmailRegExp.test(s),
	(s) => Brand.error(`'${s}' does not represent an Email`)
);
