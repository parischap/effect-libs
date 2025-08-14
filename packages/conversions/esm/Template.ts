/**
 * This module implements a Template type, i.e. a tool that permits reading from/writing into a text
 * made up of several Placeholder's (see Placeholder.ts). For instance a date in the form dd/MM/YYYY
 * would be templated with five Placeholder's:
 *
 * - A fixedLength Placeholder with a length of 2
 * - A literal Placeholder containing the string '/'
 * - A fixedLength Placeholder with a length of 2
 * - A literal Placeholder containing the string '/'
 * - A fixedLength Placeholder with a length of 4
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

import {
	MInputError,
	MInspectable,
	MMatch,
	MPipeable,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Equal,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Record,
	Struct,
	Types
} from 'effect';
import * as CVPlaceholder from './Placeholder.js';
import * as CVPlaceholders from './Placeholders.js';

export const moduleTag = '@parischap/conversions/Template/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a Template.
 *
 * @category Models
 */

export interface Type<out PS extends CVPlaceholders.Type>
	extends MInspectable.Type,
		Pipeable.Pipeable {
	/** Array of the Placeholder's composing this template */
	readonly placeholders: PS;

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
export const has = (u: unknown): u is Type<ReadonlyArray<CVPlaceholder.Type<string, unknown>>> =>
	Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[_TypeId]: { _P: MTypes.covariantValue },
	[MInspectable.IdSymbol](this: Type<CVPlaceholders.Type>) {
		return pipe(
			this.placeholders,
			Array.map((p, pos) =>
				pipe(
					p,
					MMatch.make,
					MMatch.when(CVPlaceholder.isTag, (tag) => tag.toString()),
					MMatch.when(
						CVPlaceholder.isSeparator,
						(sep) => `Separator at position ${pos + 1}: '${sep.toString()}'`
					),
					MMatch.exhaustive
				)
			),
			Array.join(',\n'),
			MString.prepend('[\n'),
			MString.append('\n]')
		);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = <const PS extends CVPlaceholders.Type>(params: MTypes.Data<Type<PS>>): Type<PS> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const PS extends CVPlaceholders.Type>(...placeholders: PS): Type<PS> =>
	_make({ placeholders });

/**
 * Returns the `placeholders` property of `self`
 *
 * @category Destructors
 */
export const placeholders: <const PS extends CVPlaceholders.Type>(self: Type<PS>) => PS =
	Struct.get('placeholders');

/**
 * Returns a function that parses a text into a record according to 'self' .
 *
 * @category Destructors
 */

export const toParser =
	<const PS extends CVPlaceholders.Type>(
		self: Type<PS>
	): MTypes.OneArgFunction<
		string,
		Either.Either<
			{
				readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVPlaceholder.Tag.All ?
					CVPlaceholder.Tag.ExtractName<PS[k]>
				:	never]: PS[k] extends CVPlaceholder.Tag.All ? CVPlaceholder.Tag.ExtractType<PS[k]> : never;
			},
			MInputError.Type
		>
	> =>
	(text) =>
		Either.gen(function* () {
			let consumed: unknown;
			const result = Record.empty<string, unknown>();
			const placeholders = self.placeholders;

			for (let pos = 0; pos < placeholders.length; pos++) {
				const placeholder = placeholders[pos] as CVPlaceholder.Type<string, unknown>;
				if (CVPlaceholder.isTag(placeholder)) {
					/* eslint-disable-next-line functional/no-expression-statements */
					[consumed, text] = yield* placeholder.parser(text);
					const name = placeholder.name;
					if (!(name in result))
						/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements,  */
						result[name] = consumed;
					else {
						const oldValue = result[name];
						if (!Equal.equals(oldValue, consumed))
							yield* Either.left(
								new MInputError.Type({
									message: `'${name}' placeholder is present twice in template and receives differing values '${MString.fromUnknown(oldValue)}' and '${MString.fromUnknown(consumed)}'`
								})
							);
					}
				} else
					/* eslint-disable-next-line functional/no-expression-statements */
					text = yield* placeholder.parser(pos + 1)(text);
			}

			yield* pipe(text, MInputError.assertEmpty({ name: 'text not consumed by template' }));

			return result as never;
		});

/**
 * Returns a function that formats an object into the template represented by 'self' . When
 * strictMode is false, the formatter function of the placeholder's is replaced by the Either.right
 * function, i.e. no checks are carried out when encoding
 *
 * @category Destructors
 */
export const toFormatter = <const PS extends CVPlaceholders.Type>(
	self: Type<PS>
): MTypes.OneArgFunction<
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVPlaceholder.Tag.All ?
			CVPlaceholder.Tag.ExtractName<PS[k]>
		:	never]: PS[k] extends CVPlaceholder.Tag.All ? CVPlaceholder.Tag.ExtractType<PS[k]> : never;
	},
	Either.Either<string, MInputError.Type>
> => {
	return (record) =>
		Either.gen(function* () {
			let result = '';

			for (const placeholder of self.placeholders) {
				if (CVPlaceholder.isSeparator(placeholder)) {
					/* eslint-disable-next-line functional/no-expression-statements */
					result += placeholder.formatter();
				} else {
					const name = placeholder.name;
					const value = pipe(
						record as Record<string, unknown>,
						Record.get(name),
						// This error should not happen due to typing
						Option.getOrThrowWith(
							() => new Error(`Abnormal error: no value passed for '${name}' placeholder`)
						)
					);
					/* eslint-disable-next-line functional/no-expression-statements */
					result += yield* placeholder.formatter(value);
				}
			}

			return result;
		});
};
