/**
 * A simple extension to the Effect Function module
 *
 * @since 0.0.6
 */

import { Equal, Function, Option, Predicate } from 'effect';
import { LazyArg } from 'effect/Function';
import * as MTypes from './types.js';

//const moduleTag = '@parischap/effect-lib/Function/';

/**
 * Applies function f if condition is true
 *
 * @since 0.0.6
 * @category Utils
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
 * Flips a dual function. If the dual function takes type parameters, most of the time you need to
 * pass them. For instance: MFunction.flipDual(Array.get<string>)(targetValues)
 *
 * @since 0.0.6
 * @category Utils
 */

export const flipDual =
	<
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- unknown will not work */
		F extends (self: any, ...others: ReadonlyArray<any>) => unknown
	>(
		f: F
	): ((self: Parameters<F>[0]) => (...b: MTypes.Tail<Parameters<F>>) => ReturnType<F>) =>
	(self) =>
	(...b) =>
		f(self, ...b) as ReturnType<F>;

/**
 * Strict equality predicate
 *
 * @since 0.0.6
 * @category Utils
 */
export const strictEquals: <A, B extends A>(that: B) => Predicate.Predicate<A> = (that) => (self) =>
	self === that;

/**
 * Curried equality between elements having the same type using the Equal.equals comparator. Prefer
 * using strictEquals for primitive types because it is faster
 *
 * @since 0.0.6
 * @category Utils
 */
export const isEquivalentTo =
	<A>(that: A) =>
	(self: A): boolean =>
		Equal.equals(that, self);

/**
 * Returns the expected number of parameters of a function
 *
 * @since 0.0.6
 * @category Utils
 */
export const parameterNumber = (f: MTypes.AnyFunction) => f.length;

/**
 * Function to memoize a function that takes no argument. Useful to initialize a time-consuming
 * constant only when it is used (not at startup). Not that any unused constant will be tree-shaken,
 * so do not use this function if startup time is not an issue.
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MFunction } from '@parischap/effect-lib';
 *
 * 	const complexCalculation = (a: number) => a;
 *
 * 	export const result = MFunction.once(() => complexCalculation(12));
 */
export const once = <A>(f: Function.LazyArg<A>): Function.LazyArg<A> => {
	let store = Option.none<A>();
	const cached: Function.LazyArg<A> = () => {
		if (Option.isNone(store)) {
			const result = f();
			/* eslint-disable-next-line functional/no-expression-statements */
			store = Option.some(result);
			return result;
		} else return store.value;
	};
	return cached;
};

/**
 * Applies `f` to `o`
 *
 * @since 0.0.6
 * @category Utils
 */
export const applyAsMethod =
	(o: MTypes.AnyRecord) =>
	<A>(self: LazyArg<A>): A =>
		self.call(o);
