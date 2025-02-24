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
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
	flow(styles, HashMap.get(partName), Option.getOrElse(Function.constant(ASContextFormatter.none)));

/**
 * StyleMap instance for ansi dark mode
 *
 * @category Instances
 */
export const darkMode: Type = make({
	id: 'DarkMode',
	styles: HashMap.make(
		['Message', ASContextFormatter.green],
		['ToStringedObject', ASContextFormatter.yellow],
		[
			'PrimitiveValue',
			PPValueBasedFormatter.makeTypeIndexed(
				ASPalette.make(
					// string
					ASStyle.green,
					// number
					ASStyle.yellow,
					// bigint
					ASStyle.yellow,
					// boolean
					ASStyle.yellow,
					// symbol
					ASStyle.cyan,
					// null
					pipe(ASStyle.green, ASStyle.mergeOver(ASStyle.bold)),
					// undefined
					ASStyle.green
				)
			)
		],
		[
			'PropertyKey',
			PPValueBasedFormatter.makeKeyTypeIndexed(
				ASPalette.make(
					// string key
					ASStyle.red,
					// symbolic key
					ASStyle.cyan
				)
			)
		],
		['PrototypeDelimiters', ASContextFormatter.green],
		['KeyValueSeparator', ASContextFormatter.white],
		['InBetweenPropertySeparator', ASContextFormatter.white],
		[
			'NonPrimitiveValueDelimiters',
			PPValueBasedFormatter.makeDepthIndexed(ASPalette.allOriginalColors)
		],
		['Indentation', ASContextFormatter.green],
		['NonPrimitiveValueId', ASContextFormatter.green],
		['NonPrimitiveValueIdSeparator', ASContextFormatter.green],
		['PropertyNumbers', ASContextFormatter.green],
		['propertyNumberSeparator', ASContextFormatter.green],
		['propertyNumberDelimiters', ASContextFormatter.green]
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
	styles: HashMap.empty()
});
