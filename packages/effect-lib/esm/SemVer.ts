/**
 * This module implements a SemVer type and related functions.
 *
 * @since 0.3.4
 */

import { MRegExp } from '@parischap/js-lib';
import { Brand } from 'effect';

const moduleTag = '@parischap/effect-lib/SemVer/';
type moduleTag = typeof moduleTag;
const wholeLineSemVerRegExp = new RegExp(MRegExp.makeLine(MRegExp.semVer));

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
	(s) => wholeLineSemVerRegExp.test(s),
	(s) => Brand.error(`'${s}' does not represent a SemVer`)
);
