/**
 * This module implements a SemVer type and related functions.
 *
 * @since 0.3.4
 */

import { Brand } from 'effect';
import * as MRegExp from './RegExp.js';

const moduleTag = '@parischap/effect-lib/SemVer/';
type moduleTag = typeof moduleTag;

/**
 * SemVer type
 *
 * @since 0.3.4
 * @category Models
 */
export type Type = Brand.Branded<string, moduleTag>;

/**
 * Constructs a SemVer without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Constructs a SemVer from a string. Throws an error if the provided string does not match the
 * `semVer` pattern
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromString = Brand.refined<Type>(
	(s) => MRegExp.semVerRegExp.test(s),
	(s) => Brand.error(`'${s}' does not represent a SemVer`)
);
