/**
 * This module implements a map of ContextFormatter's (see
 *
 * @parischap/ansi-styles/ContextFormatter.ts). These ContextFormatter's are used to style the different parts of a
 * stringified value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASContextFormatter, ASPalette, ASStyle } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	HashMap,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';

export const moduleTag = '@parischap/pretty-print/StyleMap/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

export namespace Styles {
	export interface Type extends HashMap.HashMap<string, PPValueBasedFormatter.Type> {}
}

/**
 * Interface that represents a StyleMap
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Id of this StyleMap instance. Useful for equality and debugging. */
	readonly id: string;
	/** Map of Sttyle's to be applied to the different parts of the value to stringify */
	readonly styles: Styles.Type;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `styles` property of `self`
 *
 * @category Destructors
 */
export const styles: MTypes.OneArgFunction<Type, Styles.Type> = Struct.get('styles');

/**
 * Returns the ValueBasedFormatter associated with `partName` which identifies a part of a
 * stringified value. Returns `ASContextFormatter.none` if `partName` is not present in `self`.
 *
 * @category Destructors
 */
export const get = (partName: string): MTypes.OneArgFunction<Type, PPValueBasedFormatter.Type> =>
	flow(
		Struct.get('styles'),
		HashMap.get(partName),
		Option.getOrElse(Function.constant(ASContextFormatter.none))
	);

/**
 * StyleMap instance for ansi dark mode
 *
 * @category Instances
 */
export const ansiDarkMode: Type = make({
	id: 'AnsiDarkMode',
	styles: HashMap.make(
		['Message', ASContextFormatter.green],
		['StringDelimiters', ASContextFormatter.green],
		['StringValue', ASContextFormatter.green],
		[
			'NullValue',
			ASContextFormatter.Unistyled.make(pipe(ASStyle.green, ASStyle.mergeOver(ASStyle.bold)))
		],
		['UndefinedValue', ASContextFormatter.green],
		['SymbolValue', ASContextFormatter.cyan],
		['OtherValue', ASContextFormatter.yellow],
		['BigIntDelimiters', ASContextFormatter.magenta],
		['PropertyKeyWhenFunctionValue', ASContextFormatter.blue],
		['PropertyKeyWhenSymbol', ASContextFormatter.cyan],
		['PropertyKeyWhenOther', ASContextFormatter.red],
		['InBetweenPropertySeparator', ASContextFormatter.white],
		[
			'NonPrimitiveValueDelimiters',
			PPValueBasedFormatter.makeDepthIndexed(ASPalette.allOriginalColors)
		],
		['NonPrimitiveValueName', ASContextFormatter.green],
		['PropertyNumber', ASContextFormatter.green],
		['KeyValueSeparator', ASContextFormatter.white],
		['PrototypeDelimiters', ASContextFormatter.green],
		['Indentation', ASContextFormatter.green],
		['FunctionName', ASContextFormatter.green],
		['FunctionNameDelimiters', ASContextFormatter.green],
		['ToStringedObject', ASContextFormatter.yellow]
	)
});

/**
 * StyleMap instance that doesn't apply any formatting (uses the none ContextFormatter of the
 * ansi-styles library for all parts to be formatted)
 *
 * @category Instances
 */
export const none: Type = make({
	id: 'None',
	styles: pipe(ansiDarkMode, styles, HashMap.map(Function.constant(ASContextFormatter.none)))
});
