import { Record, pipe } from 'effect';
import * as MTypes from './types.js';

export const append =
	<O extends MTypes.AnyRecord>(that: O) =>
	<O1 extends MTypes.AnyRecord>(self: O1): Omit<O1, keyof O> & O => ({ ...self, ...that });

export const make =
	<K extends string | symbol>(key: K) =>
	<V>(value: V): { readonly [key in K]: V } =>
		({ [key]: value }) as never;

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
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			Record.map((f) => f(self)),
			(newValues) => ({ ...self, ...newValues })
		);
