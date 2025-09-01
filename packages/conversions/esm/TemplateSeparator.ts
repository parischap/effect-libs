/**
 * This module implements a TemplateSeparator type which is a sub-type of the TemplatePart type (see
 * TemplatePart.ts)
 *
 * A TemplateSeparator represents the immutable part of a template. Upon parsing, we must check that
 * it is present as is in the text. Upon formatting, it must be inserted as is into the text. A
 * Separator contains no valuable information
 */

import { MInputError, MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';

import { Either, flow, Function, Pipeable, Predicate, Struct } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/TemplateSeparator/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Parser
 *
 * @category Models
 */
export namespace Parser {
	/**
	 * Type that describes a Parser
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			number,
			MTypes.OneArgFunction<string, Either.Either<string, MInputError.Type>>
		> {}
}

/**
 * Namespace of a Formatter
 *
 * @category Models
 */
export namespace Formatter {
	/**
	 * Type that describes a Formatter
	 *
	 * @category Models
	 */
	export interface Type extends Function.LazyArg<string> {}
}

/**
 * Type that represents a TemplateSeparator
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
	/** The string representing this separator */
	readonly value: string;

	/** Parser of this TemplateSeparator */
	readonly parser: Parser.Type;

	/** Formatter of this TemplateSeparator */
	readonly formatter: Formatter.Type;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Proto */
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
	[MInspectable.IdSymbol](this: Type) {
		return this.value;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a Separator instance that parses/formats a given string.
 *
 * @category Constructors
 */
export const make = (value: string): Type =>
	_make({
		value,
		parser: (pos) =>
			flow(
				MInputError.assertStartsWith({
					startString: value,
					name: `remaining text for separator at position ${pos}`
				}),
				Either.map(MString.takeRightBut(value.length))
			),
		formatter: Function.constant(value)
	});

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');

/**
 * Returns the `parser` property of `self`
 *
 * @category Destructors
 */
export const parser: MTypes.OneArgFunction<Type, Parser.Type> = Struct.get('parser');

/**
 * Returns the `formatter` property of `self`
 *
 * @category Destructors
 */
export const formatter: MTypes.OneArgFunction<Type, Formatter.Type> = Struct.get('formatter');

/**
 * Slash Separator instance
 *
 * @category Instances
 */
export const slash: Type = make('/');

/**
 * Backslash Separator instance
 *
 * @category Instances
 */
export const backslash: Type = make('\\');

/**
 * Dot Separator instance
 *
 * @category Instances
 */
export const dot: Type = make('.');

/**
 * Hyphen Separator instance
 *
 * @category Instances
 */
export const hyphen: Type = make('-');

/**
 * Colon Separator instance
 *
 * @category Instances
 */
export const colon: Type = make(':');

/**
 * Comma Separator instance
 *
 * @category Instances
 */
export const comma: Type = make(',');

/**
 * Space Separator instance
 *
 * @category Instances
 */
export const space: Type = make(' ');
