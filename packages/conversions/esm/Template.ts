/**
 * This module implements a Template type, i.e. a tool that permits reading from/writing into a text
 * made up of several PlaceHolder's (see PlaceHolder.ts). For instance a date in the form dd/MM/YYYY
 * would be templated with five PlaceHolder's:
 *
 * - A fixedLength PlaceHolder with a length of 2
 * - A literal PlaceHolder containing the string '/'
 * - A fixedLength PlaceHolder with a length of 2
 * - A literal PlaceHolder containing the string '/'
 * - A fixedLength PlaceHolder with a length of 4
 *
 * Note that Effect does provide the Schema.TemplateLiteralParser API which partly addresses the
 * same problems. But there are some limitations to that API. For instance, template literal types
 * cannot represent a fixed-length string or a string composed only of capital letters... It is for
 * instance impossible to represent a date in the form YYYYMMDD with the TemplateLiteralParser. A
 * schema in the form:
 *
 * Const schema = Schema.TemplateLiteralParser(Schema.NumberFromString,Schema.NumberFromString,
 * Schema.NumberFromString)
 *
 * Would not work as the first NumberFromString combinator would read the whole date.
 */

import { MInputError, MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import {
	Either,
	Equal,
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

namespace CVPlaceHolders {
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	export interface Type extends ReadonlyArray<CVPlaceHolder.Type<string, any>> {}
}

/**
 * Type that represents a Template.
 *
 * @category Models
 */

export interface Type<out PS extends CVPlaceHolders.Type>
	extends Inspectable.Inspectable,
		Pipeable.Pipeable {
	/** Array of the PlaceHolders composing this template */
	readonly placeHolders: PS;

	/** @internal */
	readonly [_TypeId]: {
		readonly _P: Types.Covariant<PS>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<ReadonlyArray<CVPlaceHolder.Type<string, unknown>>> =>
	Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[_TypeId]: { _P: MTypes.covariantValue },
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = <const PS extends CVPlaceHolders.Type>(params: MTypes.Data<Type<PS>>): Type<PS> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const PS extends CVPlaceHolders.Type>(...placeHolders: PS): Type<PS> =>
	_make({ placeHolders });

/**
 * Returns the `placeHolders` property of `self`
 *
 * @category Destructors
 */
export const placeHolders: <const PS extends CVPlaceHolders.Type>(self: Type<PS>) => PS =
	Struct.get('placeHolders');

/**
 * Returns a function that reads a text into a record according to 'self' .
 *
 * @category Destructors
 */

export const toParser =
	<const PS extends CVPlaceHolders.Type>(
		self: Type<PS>
	): MTypes.OneArgFunction<
		string,
		Either.Either<
			{
				readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVPlaceHolder.All ?
					CVPlaceHolder.ExtractName<PS[k]>
				:	never]: PS[k] extends CVPlaceHolder.All ? CVPlaceHolder.ExtractType<PS[k]> : never;
			},
			MInputError.Type
		>
	> =>
	(text) =>
		Either.gen(function* () {
			let consumed: unknown;
			const result = Record.empty<string, unknown>();
			for (const placeHolder of self.placeHolders) {
				/* eslint-disable-next-line functional/no-expression-statements, @typescript-eslint/no-unsafe-assignment */
				[consumed, text] = yield* placeHolder.parser(text);
				const id = placeHolder.id;
				if (!(id in result))
					/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements,  */
					result[id] = consumed;
				else {
					const oldValue = result[id];
					if (!Equal.equals(oldValue, consumed))
						yield* Either.left(
							new MInputError.Type({
								message: `'${id}' placeholder is present twice in template and receives differing values '${MString.fromUnknown(oldValue)}' and '${MString.fromUnknown(consumed)}'`
							})
						);
				}
			}

			yield* pipe(text, MInputError.assertEmpty({ name: 'text not consumed by template' }));

			return result as never;
		});

/**
 * Returns a function that writes an object into the template represented by 'self' . When
 * strictMode is false, the formatter function of the placeHolder's is replaced by the Either.right
 * function, i.e. no checks are carried out when encoding
 *
 * @category Destructors
 */
export const toFormatter = <const PS extends CVPlaceHolders.Type>(
	self: Type<PS>
): MTypes.OneArgFunction<
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVPlaceHolder.All ?
			CVPlaceHolder.ExtractName<PS[k]>
		:	never]: PS[k] extends CVPlaceHolder.All ? CVPlaceHolder.ExtractType<PS[k]> : never;
	},
	Either.Either<string, MInputError.Type>
> => {
	return (record) =>
		Either.gen(function* () {
			let result = '';

			for (const placeHolder of self.placeHolders) {
				const id = placeHolder.id;
				const value = pipe(
					record as Record<string, unknown>,
					Record.get(id),
					// This error should not happen due to typing
					Option.getOrThrow
				);
				/* eslint-disable-next-line functional/no-expression-statements */
				result += yield* placeHolder.formatter(value);
			}

			return result;
		});
};
