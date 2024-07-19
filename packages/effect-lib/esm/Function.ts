import { Either, Equal, Function, Option, Predicate, pipe } from 'effect';
import * as MTypes from './types.js';

//const moduleTag = '@parischap/effect-lib/Function/';

/**
 * iif
 */
export const fIfTrue =
	<A>({
		condition,
		f
	}: {
		readonly condition: boolean;
		readonly f: (a: NoInfer<A>) => NoInfer<A>;
	}) =>
	(a: A): A =>
		condition ? f(a) : a;

/**
 * If with an optional predicate
 */
/*export const fIfParam = <A, B, C extends A>(options: {
	readonly parameter: Option.Option<B>;
	readonly f: (b: B) => (a: A) => C;
}): MTypes.OneArgFunction<A, A> =>
	pipe(
		options.parameter,
		Option.map(options.f),
		Option.getOrElse(() => Function.identity)
	);*/

/**
 * Filter a value
 */
export const filter =
	<A, E>(errorPredicate: (a: NoInfer<A>) => Option.Option<E>) =>
	(a: A): Either.Either<A, E> =>
		pipe(
			a,
			errorPredicate,
			Either.fromOption(() => a),
			Either.flip
		);

/**
 * Flips a dual function
 */
export const flipDual =
	<
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- unknown will not work
		F extends (self: any, ...others: ReadonlyArray<any>) => unknown
	>(
		f: F
	): ((self: Parameters<F>[0]) => (...b: MTypes.Tail<Parameters<F>>) => ReturnType<F>) =>
	(self) =>
	(...b) =>
		f(self, ...b) as ReturnType<F>;

/**
 * strict equality comparator
 */
export const strictEquals: <A, B extends A>(that: B) => Predicate.Predicate<A> = (that) => (self) =>
	self === that;

/**
 * Curried equality between elements having the same type. Prefer using strictEquals for primitive types because it is faster
 */
export const isEquivalentTo =
	<A>(that: A) =>
	(self: A): boolean =>
		Equal.equals(that, self);

/**
 * Returns the expected number of parameters of a function
 */
export const numParameters = (f: MTypes.AnyFunction) => f.length;

/**
 * Function to memoize a function that takes no argument. Useful to lazy initialize constants
 */
export const once = <A>(f: Function.LazyArg<A>): Function.LazyArg<A> => {
	let store = Option.none<A>();
	const cached: Function.LazyArg<A> = () => {
		if (Option.isNone(store)) {
			const result = f();
			// eslint-disable-next-line functional/no-expression-statements
			store = Option.some(result);
			return result;
		} else return store.value;
	};
	return cached;
};

//export const unsafeIdentity = <A, B extends A>(a: A): B => a as B;

export const is =
	<B, const A extends B>(a: A) =>
	(v: B): v is A =>
		Equal.equals(a, v);
