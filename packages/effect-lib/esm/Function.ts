/** A simple extension to the Effect Function module */

import { Function, Option, pipe, Predicate } from 'effect';
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
 * Flips a dual function by targetting the non-curried overload. If the dual function takes type
 * parameters, most of the time you need to pass them. For instance:
 * MFunction.flipDual(Array.get<string>)(targetValues)
 *
 * @category Utils
 */

export const flipDual =
	<First, Others extends ReadonlyArray<unknown>, R>(
		self: (first: First, ...others: Others) => R
	): ((first: First) => (...others: Others) => R) =>
	(first) =>
	(...b) =>
		self(first, ...b);

/**
 * Strict equality predicate
 *
 * @category Utils
 */
export const strictEquals: <A>(that: NoInfer<A>) => Predicate.Predicate<A> = (that) => (self) =>
	self === that;

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
 * constant only when it is used (not at startup) privided it is used more than once. Otherwise,
 * this function is useless.
 *
 * Instead of exporting the result of calling this function (which would then take time at startup),
 * create a memoized version of the function and call it in the code when necessary.
 *
 * Note that any unused constant will be tree-shaken, so do not use this function if startup time is
 * not an issue.
 *
 * @category Utils
 * @example
 * 	import { MFunction } from '@parischap/effect-lib';
 *
 * 	const complexFoo = () => 1;
 * 	const memoized = MFunction.once(complexFoo);
 *
 * 	export function foo1() {
 * 		return memoized() + 1;
 * 	}
 *
 * 	export function foo2() {
 * 		return memoized() + 2;
 * 	}
 */

export const once = <A>(f: Function.LazyArg<A>): Function.LazyArg<A> => {
	let store = Option.none<A>();
	const cached: Function.LazyArg<A> = () =>
		pipe(
			store,
			Option.match({
				onNone: () => {
					const result = f();
					/* eslint-disable-next-line functional/no-expression-statements */
					store = Option.some(result);
					return result;
				},
				onSome: Function.identity
			})
		);
	return cached;
};

/**
 * Applies no-argument `self` to `o`
 *
 * @category Utils
 */
export const applyAsThis =
	(o: MTypes.NonPrimitive) =>
	<A>(self: Function.LazyArg<A>): A =>
		self.call(o);

/**
 * Calls `self` without any argument
 *
 * @category Utils
 */
export const execute = <A>(self: Function.LazyArg<A>): A => self();

/**
 * Returns a lazy empty string
 *
 * @category Utils
 */
export const constEmptyString = Function.constant('');

/**
 * Returns a copy of `self`
 *
 * @category Utils
 */

export const clone = <This, Args extends ReadonlyArray<unknown>, R>(
	self: (this: This, ...args: Args) => R
): ((this: This, ...args: Args) => R) =>
	function (this, ...args) {
		return self.call(this, ...args);
	};

/**
 * The Function.prototype
 *
 * @category Constants
 */
export const proto = Object.getPrototypeOf(Math.max) as MTypes.NonPrimitive;
