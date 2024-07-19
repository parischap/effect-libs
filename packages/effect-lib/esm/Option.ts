import { Either, Function, Option, String, flow } from 'effect';

/**
 *
 * @category models
 */
export type OptionOrNullable<A> = Option.Option<A> | null | undefined | A;

/**
 * Constructor that returns a Some of type Option.Some
 */
export const someAsConst = <A>(value: A): Option.Some<A> => Option.some(value) as Option.Some<A>;

/**
 * Constructor that returns a None of type Option.None
 */
export const noneAsConst = <A>(): Option.None<A> => Option.none() as Option.None<A>;

/**
 * Converts a string into an `Option`. Returns the string wrapped in a `Some` if the string is not empty, otherwise returns `None`.
 *
 * @category conversions
 */
export const fromString = (s: string): Option.Option<string> =>
	String.isEmpty(s) ? Option.none() : Option.some(s);

/**
 * Converts an OptionOrNullable into an `Option`.
 *
 * @category conversions
 */
export const fromOptionOrNullable = <A>(a: OptionOrNullable<A>): Option.Option<A> =>
	Option.isOption(a) ? a : Option.fromNullable(a);

/**
 * Flattens two options into a single one
 */
export const flatten: <A>(self: Option.Option<Option.Option<A>>) => Option.Option<A> =
	Option.flatMap(Function.identity);

export const traverseEither = <R, L>(
	o: Option.Option<Either.Either<R, L>>
): Either.Either<Option.Option<R>, L> =>
	Option.match(o, {
		onNone: () => Either.right(Option.none()),
		onSome: Either.match({ onLeft: Either.left, onRight: flow(Option.some, Either.right) })
	});

/**
 * Semigroup for options that returns a some only if there is one and one only some
 * in the list to concatenate
 *
 * none + none = none
 * none + some(a) = some(a)
 * some(a) + none = some(a)
 * some(a) + some(b) = none
 *
 * @since 1.0.0
 */
/*export const getXorOptionSemigroupSameDisallowed = <A>(): Semigroup.Semigroup<Option.Option<A>> =>
	Semigroup.make((self: Option.Option<A>, that: Option.Option<A>) =>
		Option.match(self, {
			onNone: () => that,
			onSome: () => Option.match(that, { onNone: () => self, onSome: () => Option.none() })
		})
	);*/

/**
 * Monoid for options that returns a some only if there is one and one only some
 * in the list to concatenate
 *
 * @since 1.0.0
 */
/*export const getXorOptionMonoidSameDisallowed = <A>(): Monoid.Monoid<Option.Option<A>> =>
	Monoid.fromSemigroup(getXorOptionSemigroup(), Option.none());*/

/**
 * Semigroup for options that returns a some only if there is one and one only some
 * in the list to concatenate
 *
 * none + none = none
 * none + some(a) = some(a)
 * some(a) + none = some(a)
 * some(a) + some(a) = some(a)
 * some(a) + Some(b) = none (a not equal to b)
 *
 * @since 1.0.0
 */
/*export const getXorOptionSemigroupSameAllowed = <A>(): Semigroup.Semigroup<Option.Option<A>> =>
	Semigroup.make((self: Option.Option<A>, that: Option.Option<A>) =>
		Option.match(self, {
			onNone: () => that,
			onSome: (v1) =>
				Option.match(that, {
					onNone: () => self,
					onSome: (v2) => (v1 === v2 ? Option.some(v1) : Option.none())
				})
		})
	);*/

/**
 * Monoid for options that returns a some only if there is one and one only some
 * in the list to concatenate
 *
 * @since 1.0.0
 */
/*export const getXorOptionMonoidSameAllowed = <A>(): Monoid.Monoid<Option.Option<A>> =>
	Monoid.fromSemigroup(getXorOptionSemigroup(), Option.none());*/
