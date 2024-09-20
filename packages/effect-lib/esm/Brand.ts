/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.0.6
 */

import { JsRegExp } from '@parischap/js-lib';
import { Brand, Number } from 'effect';

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
 * Constructs a SemVer but throws an error if the provided string does not match the semver pattern
 *
 * @since 0.0.6
 * @category Constructors
 */
export const SemVer = Brand.refined<SemVer>(
	(s) => JsRegExp.semVer.test(s),
	(s) => Brand.error(`SemVer ${s} should have following format: number.number.number`)
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
 * Constructs an Email but throws an error if the provided string does not match the email pattern
 *
 * @since 0.0.6
 * @category Constructors
 */
export const Email = Brand.refined<Email>(
	(s) => JsRegExp.email.test(s),
	(s) => Brand.error(`${s} is not a proper email`)
);

// Brand for number ranges
const RangeBrand = `${moduleTag}RangeBrand`;
type RangeBrand = typeof RangeBrand;

/**
 * Brand for number ranges
 *
 * @since 0.0.6
 * @category Models
 */
export type Range = Brand.Branded<number, RangeBrand>;

/**
 * Constrcuts a number belonging to a range without any checks
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unsafeRange = Brand.nominal<Range>();

/**
 * Constructs a number belonging to the range [minimum, maximum] but throws an error if the provided
 * number is not in the range
 *
 * @since 0.0.6
 * @category Constructors
 */
export const Range = (options: { readonly minimum: number; readonly maximum: number }) =>
	Brand.refined<Range>(Number.between(options), (n) =>
		Brand.error(`${n} should be between ${options.minimum} and ${options.maximum}`)
	);
