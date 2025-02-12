/** A simple extension to the Effect Struct module */

import { Function, Record, Struct, pipe } from 'effect';
import * as MTypes from './types.js';
/**
 * Prepends `that` to `self`. If `that` contains fields that already exist in `self`, they will not
 * be taken into account. Use instead of the spread operator because it does not copy the prototype
 * but returns a type containing the properties borne by the prototype.
 *
 * @category Utils
 */
export const prepend =
	<O extends MTypes.NonPrimitive>(that: O) =>
	<O1 extends MTypes.NonPrimitive>(self: O1): MTypes.Data<Omit<O, keyof O1> & O1> => ({
		...that,
		...self
	});

/**
 * Appends `that` to `self`. If `that` contains fields that already exist in `self`, they will
 * prevail. Use instead of the spread operator because it does not copy the prototype but returns a
 * type containing the properties borne by the prototype.
 *
 * @category Utils
 */
export const append =
	<O1 extends MTypes.NonPrimitive>(that: O1) =>
	<O extends MTypes.NonPrimitive>(self: O): MTypes.Data<Omit<O, keyof O1> & O1> => ({
		...self,
		...that
	});

/**
 * Same as append but only existing properties of `self` can be overriden.
 *
 * @category Utils
 */
export const set =
	<O extends MTypes.NonPrimitive, O1 extends Partial<O>>(that: O1) =>
	(self: O): MTypes.Data<Omit<O, keyof O1> & O1> => ({
		...self,
		...that
	});

/**
 * Same as set but mutates `self`. To use in extreme situations only
 *
 * @category Utils
 */
export const mutableSet =
	<O extends MTypes.NonPrimitive, O1 extends Partial<O>>(that: O1) =>
	(self: O): Omit<O, keyof O1> & O1 =>
		/* eslint-disable-next-line functional/immutable-data */
		Object.assign(self, that);

/**
 * Builds a one-key struct
 *
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
 * @category Utils
 */

export const enrichWith =
	<
		O extends MTypes.NonPrimitive,
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		O1 extends Record<string | symbol, MTypes.OneArgFunction<O, any>>
	>(
		fields: O1
	) =>
	(self: O): MTypes.Data<Omit<O, keyof O1> & { readonly [key in keyof O1]: ReturnType<O1[key]> }> =>
		pipe(fields, Record.map(Function.apply(self)), (newValues) => ({ ...self, ...newValues }));

/**
 * Same as enrichWith but mutates `self`. To use in extreme situations only
 *
 * @category Utils
 */

export const mutableEnrichWith =
	<
		O extends MTypes.NonPrimitive,
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		O1 extends Record<string | symbol, MTypes.OneArgFunction<O, any>>
	>(
		fields: O1
	) =>
	(self: O): Omit<O, keyof O1> & { readonly [key in keyof O1]: ReturnType<O1[key]> } =>
		/* eslint-disable-next-line functional/immutable-data */
		Object.assign(self, Record.map(fields, Function.apply(self)));

/* eslint-disable */
// Copied from Struct.ts
type Transformed<O, T> = unknown & {
	[K in keyof O]: K extends keyof T ?
		T[K] extends (...a: any) => any ?
			ReturnType<T[K]>
		:	O[K]
	:	O[K];
};
type PartialTransform<O, T> = {
	[K in keyof T]: T[K] extends (a: O[K & keyof O]) => any ? T[K] : (a: O[K & keyof O]) => unknown;
};
/* eslint-enable */

/**
 * Same as Struct.evolve but we remove from the return type any property borne by the prototype as
 * it does not get copied. If property to evolve is not in target `obj`, it is ignored.
 *
 * @category Utils
 */
export const evolve: {
	<O, T>(t: PartialTransform<O, T>): (obj: O) => MTypes.Data<Transformed<O, T>>;
	<O, T>(obj: O, t: PartialTransform<O, T>): MTypes.Data<Transformed<O, T>>;
} = Struct.evolve;
