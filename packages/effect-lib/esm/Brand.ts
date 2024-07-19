import { JsRegExp } from '@parischap/js-lib';
import { Brand, Number } from 'effect';

const moduleTag = '@parischap/effect-lib/Brand/';

//Brand for SemVers
const semVerPattern = new RegExp(
	JsRegExp.makeLine(
		JsRegExp.positiveInteger +
			JsRegExp.dot +
			JsRegExp.positiveInteger +
			JsRegExp.dot +
			JsRegExp.positiveInteger
	)
);
const SemVerBrand = `${moduleTag}SemVer`;
type SemVerBrand = typeof SemVerBrand;
/**
 * Brand for SemVers
 * @category models
 */
export type SemVer = Brand.Branded<string, SemVerBrand>;
/**
 * Brand for SemVers
 * @category constructors
 */
export const unsafeSemVer = Brand.nominal<SemVer>();
/**
 * Brand for SemVers
 * @category constructors
 */
export const SemVer = Brand.refined<SemVer>(
	(s) => semVerPattern.test(s),
	(s) => Brand.error(`SemVer ${s} should have following format: number.number.number`)
);

// Brand for emails
const emailPattern = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
const EmailBrand = `${moduleTag}Email`;
type EmailBrand = typeof EmailBrand;
/**
 * Brand for emails
 * @category models
 */
export type Email = Brand.Branded<string, EmailBrand>;
/**
 * Brand for emails
 * @category constructors
 */
export const unsafeEmail = Brand.nominal<Email>();
/**
 * Brand for emails
 * @category constructors
 */
export const Email = Brand.refined<Email>(
	(s) => emailPattern.test(s),
	(s) => Brand.error(`${s} is not a proper email`)
);

// Brand for number ranges
const RangeBrand = `${moduleTag}RangeBrand`;
type RangeBrand = typeof RangeBrand;
/**
 * Brand for number ranges
 * @category models
 */
export type Range = Brand.Branded<number, RangeBrand>;
/**
 * Brand for number ranges
 * @category constructors
 */
export const unsafeRange = Brand.nominal<Range>();
/**
 * Brand for number ranges
 * @category constructors
 */
export const Range = (options: { readonly minimum: number; readonly maximum: number }) =>
	Brand.refined<Range>(Number.between(options), (n) =>
		Brand.error(`${n} should be between ${options.minimum} and ${options.maximum}`)
	);
