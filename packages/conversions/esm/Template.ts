/**
 * This module implements a `CVTemplate` which is a model of a text that has always the same
 * structure. In such a text, there are immutable and mutable parts. Let's take the following two
 * texts as an example:
 *
 * - Text1 = "John is a 47-year old man."
 * - Text2 = "Jehnny is a 5-year old girl."
 *
 * These two texts obviously share the same structure which is the template:
 *
 * Placeholder1 is a Placeholder2-year old Placeholder3.
 *
 * Placeholder1, Placeholder2 and Placeholder3 are the mutable parts of the template. They contain
 * valuable information. We call them `CVTemplatePlaceholder`'s.
 *
 * " is a ", "-year old " and "." are the immutable parts of the template. We call them
 * `CVTemplateSeperator`'s.
 *
 * From a text with the above structure, we can extract the values of Placeholder1, Placeholder2,
 * and Placeholder3. In the present case:
 *
 * - For text1: { Placeholder1 : 'John', Placeholder2 : '47', Placeholder3 : 'man' }
 * - For text2: { Placeholder1 : 'Jehnny', Placeholder2 : '5', Placeholder3 : 'girl'}
 *
 * Extracting the values of placeholders from a text according to a template is called parsing. The
 * result of parsing is an object whose properties are named after the name of the placeholders they
 * represent.
 *
 * Inversely, given a template and the values of the placeholders that compose it (provided as the
 * properties of an object), we can generate a text. This is called formatting. In the present case,
 * with the object:
 *
 * { Placeholder1 : 'Tom', Placeholder2 : '15', Placeholder3 : 'boy' }
 *
 * We will obtain the text: "Tom is a 15-year old boy."
 *
 * Note that `Effect` does provide the `Schema.TemplateLiteralParser` API which partly addresses the
 * same problem. But there are some limitations to that API. For instance, template literal types
 * cannot represent a fixed-length string or a string composed only of capital letters... It is for
 * instance impossible to represent a date in the form YYYYMMDD with the
 * `Schema.TemplateLiteralParser`. A schema in the form `const schema =
 * Schema.TemplateLiteralParser(Schema.NumberFromString,Schema.NumberFromString,
 * Schema.NumberFromString)` does not work as the first NumberFromString combinator reads the whole
 * date
 */

import {
	MInputError,
	MInspectable,
	MPipeable,
	MString,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Equal,
	flow,
	Function,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Record,
	Struct,
	Types
} from 'effect';
import * as CVTemplatePart from './TemplatePart.js';
import * as CVTemplateParts from './TemplateParts.js';
import * as CVTemplatePlaceholder from './TemplatePlaceholder.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Template/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * `CVTemplate` Type
 *
 * @category Models
 */

export interface Type<out PS extends CVTemplateParts.Type>
	extends MInspectable.Type,
		Pipeable.Pipeable {
	/** Array of the TemplatePart's composing this template */
	readonly templateParts: PS;

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
export const has = (u: unknown): u is Type<ReadonlyArray<CVTemplatePart.Type<string, unknown>>> =>
	Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[_TypeId]: { _P: MTypes.covariantValue },
	[MInspectable.IdSymbol](this: Type<CVTemplateParts.Type>) {
		return pipe(
			this.templateParts,
			MTuple.makeBothBy({
				toFirst: CVTemplateParts.getSyntheticDescription,
				toSecond: CVTemplateParts.getPlaceholderDescription
			}),
			Array.join('\n\n')
		);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = <const PS extends CVTemplateParts.Type>(params: MTypes.Data<Type<PS>>): Type<PS> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const PS extends CVTemplateParts.Type>(...templateParts: PS): Type<PS> =>
	_make({ templateParts });

/**
 * Returns the `templateParts` property of `self`
 *
 * @category Destructors
 */
export const templateParts: <const PS extends CVTemplateParts.Type>(self: Type<PS>) => PS =
	Struct.get('templateParts');

/**
 * Returns a function that tries to parse a text into an object according to 'self'. The generated
 * parser returns a `Right` of an object upon success, a `Left` otherwise.
 *
 * @category Parsing
 */

export const toParser =
	<const PS extends CVTemplateParts.Type>(
		self: Type<PS>
	): MTypes.OneArgFunction<
		string,
		Either.Either<
			{
				readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVTemplatePlaceholder.All ?
					CVTemplatePlaceholder.ExtractName<PS[k]>
				:	never]: PS[k] extends CVTemplatePlaceholder.All ? CVTemplatePlaceholder.ExtractType<PS[k]>
				:	never;
			},
			MInputError.Type
		>
	> =>
	(text) =>
		Either.gen(function* () {
			let consumed: unknown;
			const result = Record.empty<string, unknown>();
			const templateParts = self.templateParts;

			for (let pos = 0; pos < templateParts.length; pos++) {
				const templatePart = templateParts[pos] as CVTemplatePart.Type<string, unknown>;
				if (CVTemplatePart.isPlaceholder(templatePart)) {
					/* eslint-disable-next-line functional/no-expression-statements */
					[consumed, text] = yield* templatePart.parser(text);
					const name = templatePart.name;
					if (!(name in result))
						/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements,  */
						result[name] = consumed;
					else {
						const oldValue = result[name];
						if (!Equal.equals(oldValue, consumed))
							yield* Either.left(
								new MInputError.Type({
									message: `${templatePart.label} is present more than once in template and receives differing values '${MString.fromUnknown(oldValue)}' and '${MString.fromUnknown(consumed)}'`
								})
							);
					}
				} else
					/* eslint-disable-next-line functional/no-expression-statements */
					text = yield* templatePart.parser(pos + 1)(text);
			}

			yield* pipe(text, MInputError.assertEmpty({ name: 'text not consumed by template' }));

			return result as never;
		});

/**
 * Same as `toParser` but the generated parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingParser: <const PS extends CVTemplateParts.Type>(
	self: Type<PS>
) => MTypes.OneArgFunction<
	string,
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVTemplatePlaceholder.All ?
			CVTemplatePlaceholder.ExtractName<PS[k]>
		:	never]: PS[k] extends CVTemplatePlaceholder.All ? CVTemplatePlaceholder.ExtractType<PS[k]>
		:	never;
	}
> = flow(toParser, Function.compose(Either.getOrThrowWith(Function.identity))) as never;

/**
 * Returns a function that tries to format an object into a string according to 'self'. The
 * generated formatter returns a `Right` of a string upon success, a `Left` otherwise.
 *
 * @category Formatting
 */
export const toFormatter = <const PS extends CVTemplateParts.Type>(
	self: Type<PS>
): MTypes.OneArgFunction<
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVTemplatePlaceholder.All ?
			CVTemplatePlaceholder.ExtractName<PS[k]>
		:	never]: PS[k] extends CVTemplatePlaceholder.All ? CVTemplatePlaceholder.ExtractType<PS[k]>
		:	never;
	},
	Either.Either<string, MInputError.Type>
> => {
	return (record) =>
		Either.gen(function* () {
			let result = '';

			for (const templatePart of self.templateParts) {
				if (CVTemplatePart.isSeparator(templatePart)) {
					/* eslint-disable-next-line functional/no-expression-statements */
					result += templatePart.formatter();
				} else {
					const value = pipe(
						record as Record<string, unknown>,
						Record.get(templatePart.name),
						// This error should not happen due to typing
						Option.getOrThrowWith(
							() =>
								new Error(`Abnormal error: no value passed for ${templatePart.label} templatepart`)
						)
					);
					/* eslint-disable-next-line functional/no-expression-statements */
					result += yield* templatePart.formatter(value);
				}
			}

			return result;
		});
};

/**
 * Same as `toFormatter` but the generated formatter throws in case of failure
 *
 * @category Formatting
 */

export const toThrowingFormatter: <const PS extends CVTemplateParts.Type>(
	self: Type<PS>
) => MTypes.OneArgFunction<
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVTemplatePlaceholder.All ?
			CVTemplatePlaceholder.ExtractName<PS[k]>
		:	never]: PS[k] extends CVTemplatePlaceholder.All ? CVTemplatePlaceholder.ExtractType<PS[k]>
		:	never;
	},
	string
> = flow(toFormatter, Function.compose(Either.getOrThrowWith(Function.identity))) as never;
