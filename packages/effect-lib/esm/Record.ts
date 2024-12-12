/**
 * A simple extension to the Effect Record module
 *
 * @since 0.0.6
 */

import { flow, Option, pipe, Predicate, Record } from 'effect';
import { LazyArg } from 'effect/Function';
import * as MFunction from './Function.js';
import * as MTypes from './types.js';

/**
 * Unsafe get an element from a record. No checks, faster than the Effect version
 *
 * @since 0.0.6
 * @category Utils
 */
export const unsafeGet =
	(key: string | symbol) =>
	<A>(self: Record.ReadonlyRecord<string, A>): A =>
		// @ts-expect-error getting record content unsafely
		self[key];

/**
 * Tries to call method `functionName` on `self` without any parameters. Returns a `some` of the
 * result if such a function exists and returns a string. Returns a `none` otherwise
 *
 * @since 0.0.6
 * @category Utils
 */
export const tryZeroParamStringFunction =
	({
		functionName,
		exception
	}: {
		readonly functionName: string | symbol;
		readonly exception?: LazyArg<string>;
	}) =>
	(self: MTypes.AnyRecord): Option.Option<string> =>
		pipe(
			self[functionName],
			Option.liftPredicate(MTypes.isFunction),
			Option.filter(
				Predicate.and(
					Predicate.not(MFunction.strictEquals(exception)),
					flow(MFunction.parameterNumber, MFunction.strictEquals(0))
				)
			),
			Option.map(MFunction.applyAsMethod(self)),
			Option.filter(MTypes.isString)
		);
