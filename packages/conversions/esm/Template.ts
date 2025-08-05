/**
 * This module implements a Template type, i.e. a text made up of several PlaceHolder's (see
 * PlaceHolder.ts). For instance a date in the form dd/MM/YYYY would be templated with five
 * PlaceHolder's:
 *
 * - A fixedLength PlaceHolder with a length of 2
 * - A literals PlaceHolder containing the string '/'
 * - A fixedLength PlaceHolder with a length of 2
 * - A literals PlaceHolder containing the string '/'
 * - A fixedLength PlaceHolder with a length of 4
 *
 * Note that Effect does provide the Schema.TemplateLiteralParser API which partly addresses the
 * same problems. But there are some limitations to that API. For instance, how would you describe
 * an input representing a date in the form YYYYMMDD? There is no way you can describe a type that
 * represents a fixed-length string. In the same manner, how would you describe a type that
 * represents a string composed only of capital letters?
 */

import { MInputError, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Either,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Record,
	Struct,
	Types
} from 'effect';
import * as CVPlaceHolder from './PlaceHolder.js';

export const moduleTag = '@parischap/conversions/Template/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

type NamesToPlaceHolders<NS extends ReadonlyArray<string>> = {
	readonly [N in keyof NS]: CVPlaceHolder.Type<NS[N]>;
};

/**
 * Type that represents a Template.
 *
 * @category Models
 */
export interface Type<out NS extends ReadonlyArray<string>>
	extends Inspectable.Inspectable,
		Pipeable.Pipeable {
	/** Array of the PlaceHolders composing this template */
	readonly placeHolders: NamesToPlaceHolders<NS>;

	/** @internal */
	readonly [_TypeId]: {
		readonly _NS: Types.Covariant<NS>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<ReadonlyArray<string>> =>
	Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[_TypeId]: { _NS: MTypes.covariantValue },
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = <NS extends ReadonlyArray<string>>(params: MTypes.Data<Type<NS>>): Type<NS> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <NS extends ReadonlyArray<string>>(
	placeHolders: NamesToPlaceHolders<NS>
): Type<NS> => _make({ placeHolders });

/**
 * Returns the `placeHolders` property of `self`
 *
 * @category Destructors
 */
export const placeHolders: <NS extends ReadonlyArray<string>>(
	self: Type<NS>
) => NamesToPlaceHolders<NS> = Struct.get('placeHolders');

/**
 * Returns a function that reads a text into a record according to 'self' .
 *
 * @category Destructors
 */
export const toReader =
	<NS extends ReadonlyArray<string>>(
		self: Type<NS>
	): MTypes.OneArgFunction<
		string,
		Either.Either<
			{ readonly [N in keyof NS as NS[N] extends string ? NS[N] : never]: string },
			MInputError.Type
		>
	> =>
	(text) =>
		Either.gen(function* () {
			let consumed: string;
			const result = Record.empty<string, string>();
			for (const placeHolder of self.placeHolders) {
				/* eslint-disable-next-line functional/no-expression-statements */
				[consumed, text] = yield* placeHolder.reader(text);
				/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
				result[placeHolder.name] = consumed;
			}

			yield* pipe(text, MInputError.assertEmpty({ name: 'text not consumed by template' }));

			return result as never;
		});

/**
 * Returns a function that writes an object into the template represented by 'self' . When
 * strictMode is false, the writer function of the placeHolder's is replaced by the Either.right
 * function, i.e. no checks are carried out when encoding
 *
 * @category Destructors
 */
export const toWriter: {
	<NS extends ReadonlyArray<string>>(
		self: Type<NS>
	): MTypes.OneArgFunction<
		{ readonly [N in keyof NS as NS[N] extends string ? NS[N] : never]: string },
		string
	>;

	<NS extends ReadonlyArray<string>>(
		self: Type<NS>,
		strictMode: true
	): MTypes.OneArgFunction<
		{ readonly [N in keyof NS as NS[N] extends string ? NS[N] : never]: string },
		Either.Either<string, MInputError.Type>
	>;
} = <NS extends ReadonlyArray<string>>(
	self: Type<NS>,
	strictMode = false
): MTypes.OneArgFunction<Record<string, string>, never> => {
	const forceResult = (either: Either.Either<string, MInputError.Type>) =>
		strictMode ? either : Either.getOrThrow(either);

	return (record) =>
		forceResult(
			Either.gen(function* () {
				let result = '';

				for (const placeHolder of self.placeHolders) {
					const name = placeHolder.name;
					const value = pipe(
						record,
						Record.get(name),
						// This error should not happen due to typing
						Option.getOrThrowWith(() => new Error(`'${name}': unknown placeholder name`))
					);
					/* eslint-disable-next-line functional/no-expression-statements */
					result += strictMode ? yield* placeHolder.writer(value) : value;
				}

				return result;
			})
		) as never;
};
