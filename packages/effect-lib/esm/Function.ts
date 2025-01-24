/** A simple extension to the Effect Function module */

import { Equal, Function, Option, Predicate } from 'effect';
import * as MTypes from './types.js';

/**
 * Applies function f if condition is true
 *
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
 * @category Utils
 */
export const strictEquals: <A = never>(that: unknown) => Predicate.Predicate<A> =
	(that) => (self) =>
		self === that;

/**
 * Curried equality between elements having the same type using the Equal.equals comparator. Prefer
 * using strictEquals for primitive types because it is faster
 *
 * @category Utils
 */
export const isEquivalentTo =
	<A>(that: A) =>
	(self: A): boolean =>
		Equal.equals(that, self);

/**
 * Returns the expected number of parameters of a function
 *
 * @category Utils
 */
export const parameterNumber = (f: MTypes.AnyFunction): number => f.length;

/**
 * Returns the name of a function
 *
 * @category Utils
 */
export const name = (f: MTypes.AnyFunction): string => f.name;

/**
 * Function to memoize a function that takes no argument. Useful to initialize a time-consuming
 * constant only when it is used (not at startup). Not that any unused constant will be tree-shaken,
 * so do not use this function if startup time is not an issue.
 *
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
 * Applies `self` to `o`
 *
 * @category Utils
 */
export const applyAsMethod =
	(o: MTypes.NonPrimitive) =>
	<A>(self: Function.LazyArg<A>): A =>
		self.call(o);

/**
 * Calls `self` without any argument
 *
 * @category Utils
 */
export const call = <A>(self: Function.LazyArg<A>): A => self();

/**
 * Returns a lazy empty string
 *
 * @category Utils
 */
export const constEmptyString = Function.constant('');
