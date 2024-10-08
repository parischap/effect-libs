/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.3.4
 */

import { Brand, Either, Option } from 'effect';
import * as MRegExp from './RegExp.js';

const moduleTag = '@parischap/effect-lib/Brand/';

/**
 * Constructor type with refined input
 *
 * @since 0.3.4
 * @category Models
 */
export interface RefinedConstructor<in B, in out A extends Brand.Brand<string | symbol> & B> {
	readonly [Brand.RefinedConstructorsTypeId]: Brand.RefinedConstructorsTypeId;
	/**
	 * Constructs a branded type from a value of type `A`, throwing an error if the provided `A` is
	 * not valid.
	 */
	(args: B): A;
	/**
	 * Constructs a branded type from a value of type `A`, returning `Some<A>` if the provided `A` is
	 * valid, `None` otherwise.
	 */
	readonly option: (args: B) => Option.Option<A>;
	/**
	 * Constructs a branded type from a value of type `A`, returning `Right<A>` if the provided `A` is
	 * valid, `Left<BrandError>` otherwise.
	 */
	readonly either: (args: B) => Either.Either<A, Brand.Brand.BrandErrors>;
	/**
	 * Attempts to refine the provided value of type `A`, returning `true` if the provided `A` is
	 * valid, `false` otherwise.
	 */
	readonly is: (a: B) => a is Brand.Brand.Unbranded<A> & A;
}

export namespace Email {
	const TypeId: unique symbol = Symbol.for(moduleTag + 'Email/') as TypeId;
	type TypeId = typeof TypeId;
	/**
	 * Email type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<string, TypeId>;

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
		(s) => MRegExp.emailRegExp.test(s),
		(s) => Brand.error(`'${s}' does not represent an Email`)
	);
}

export namespace SemVer {
	const TypeId: unique symbol = Symbol.for(moduleTag + 'SemVer/') as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * SemVer type
	 *
	 * @since 0.3.4
	 * @category Models
	 */
	export type Type = Brand.Branded<string, TypeId>;

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
}
