/**
 * A simple extension to the Effect Struct module
 *
 * @since 0.0.6
 */

import { Record, pipe } from 'effect';
import * as MTypes from './types.js';
/**
 * Prepends `that` to `self`. If `that` contains fields that already exist in `self`, they will not
 * be taken into account
 *
 * @since 0.0.6
 * @category Utils
 */
export const prepend =
	<O extends MTypes.AnyRecord>(that: O) =>
	<O1 extends MTypes.AnyRecord>(self: O1): Omit<O, keyof O1> & O1 => ({ ...that, ...self });

/**
 * Appends `that` to `self`. If `that` contains fields that already exist in `self`, they will
 * prevail
 *
 * @since 0.0.6
 * @category Utils
 */
export const append =
	<O extends MTypes.AnyRecord>(that: O) =>
	<O1 extends MTypes.AnyRecord>(self: O1): Omit<O1, keyof O> & O => ({ ...self, ...that });

/**
 * Builds a one-key struct
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make =
	<K extends string | symbol>(key: K) =>
	<V>(value: V): { readonly [key in K]: V } =>
		({ [key]: value }) as never;

/**
 * Calculates a 'fields' struct whose values are based on functions taking `self` as argument and
 * appends it to `self`.
 *
 * @since 0.0.6
 * @category Utils
 */

export const enrichWith =
	<
		O extends MTypes.AnyRecord,
		//eslint-disable-next-line @typescript-eslint/no-explicit-any
		O1 extends Record<string | symbol, MTypes.OneArgFunction<O, any>>
	>(
		fields: O1
	) =>
	(self: O): Omit<O, keyof O1> & { readonly [key in keyof O1]: ReturnType<O1[key]> } =>
		pipe(
			fields,
			/* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
			Record.map((f) => f(self)),
			(newValues) => ({ ...self, ...newValues })
		);
