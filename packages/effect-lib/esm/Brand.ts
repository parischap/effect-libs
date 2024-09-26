/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.0.6
 */

import { JsRegExp } from '@parischap/js-lib';
import { Brand, Number } from 'effect';
import * as MNumber from './Number.js';

const moduleTag = '@parischap/effect-lib/Brand/';

//Brand for SemVers
const SemVerBrand = `${moduleTag}SemVer`;
type SemVerBrand = typeof SemVerBrand;

/**
 * Brand for SemVers
 *
 * @since 0.0.6
 * @category Models
 */
export type SemVer = Brand.Branded<string, SemVerBrand>;

/**
 * Constructs a SemVer without any checks
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unsafeSemVer = Brand.nominal<SemVer>();

/**
 * Constructs a SemVer. Throws an error if the provided string does not match the SemVer pattern
 *
 * @since 0.0.6
 * @category Constructors
 */
export const SemVer = Brand.refined<SemVer>(
	(s) => JsRegExp.semVer.test(s),
	(s) => Brand.error(`${s} is not a proper SemVer`)
);

// Brand for emails
const EmailBrand = `${moduleTag}Email`;
type EmailBrand = typeof EmailBrand;

/**
 * Brand for emails
 *
 * @since 0.0.6
 * @category Models
 */
export type Email = Brand.Branded<string, EmailBrand>;

/**
 * Constructs an Email without any checks
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unsafeEmail = Brand.nominal<Email>();
/**
 * Constructs an Email. Throws an error if the provided string does not match the email pattern
 *
 * @since 0.0.6
 * @category Constructors
 */
export const Email = Brand.refined<Email>(
	(s) => JsRegExp.email.test(s),
	(s) => Brand.error(`${s} is not a proper email`)
);

// Brand for number ranges
const RangeBrand = `${moduleTag}Range`;
type RangeBrand = typeof RangeBrand;

/**
 * Brand for number ranges
 *
 * @since 0.0.6
 * @category Models
 */
export type Range = Brand.Branded<number, RangeBrand>;

/**
 * Constructs a number belonging to a range without any checks
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unsafeRange = Brand.nominal<Range>();

/**
 * Constructs a number belonging to the range [minimum, maximum]. Throws an error if the provided
 * number is not in the range
 *
 * @since 0.0.6
 * @category Constructors
 */
export const Range = (options: { readonly minimum: number; readonly maximum: number }) =>
	Brand.refined<Range>(Number.between(options), (n) =>
		Brand.error(`${n} should be between ${options.minimum} and ${options.maximum} (inclusive)`)
	);

// Brand for real numeric values (excluding NaN, +Infinity, -Infinity)
const NumericBrand = `${moduleTag}Numeric`;
type NumericBrand = typeof NumericBrand;

/**
 * Brand for numeric values
 *
 * @since 0.3.4
 * @category Models
 */
export type Numeric = Brand.Branded<number, NumericBrand>;

/**
 * Constructs a numeric value without any checks
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeNumeric = Brand.nominal<Numeric>();

/**
 * Constructs a numeric value
 *
 * @since 0.3.4
 * @category Constructors
 */
export const Numeric = Brand.refined<Numeric>(MNumber.isFinite, (n) =>
	Brand.error(`${n} is not a numeric value`)
);
