/**
 * A simple extension to the Effect Brand module
 *
 * @since 0.3.4
 */

import { Brand, Either, Option } from 'effect';

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
