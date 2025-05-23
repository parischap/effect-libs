/**
 * This module implements a map of ContextStyler's (see
 *
 * @parischap/ansi-styles/ContextStyler.ts). These ContextStyler's are used to style the different parts of a
 * stringified value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASContextStyler, ASPalette, ASStyle } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Equal,
	Equivalence,
	flow,
	Hash,
	HashMap,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPValueBasedStyler from './ValueBasedStyler.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/pretty-print/StyleMap/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace that represents a map of ValueBasedStyler's
 *
 * @category Models
 */
export namespace Styles {
	/**
	 * Type of a Styles
	 *
	 * @category Models
	 */
	export interface Type extends HashMap.HashMap<string, PPValueBasedStyler.Type> {}
}

/**
 * Interface that represents a StyleMap
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
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
 * Returns the ValueBasedStyler associated with `partName` which identifies a part of a stringified
 * value. Returns `ASContextStyler.none` if `partName` is not present in `self`.
 *
 * @category Destructors
 */
export const get = (partName: string): MTypes.OneArgFunction<Type, PPValueBasedStyler.Type> =>
	flow(
		styles,
		HashMap.get(partName),
		Option.getOrElse(() => ASContextStyler.none())
	);

/**
 * StyleMap instance for ansi dark mode
 *
 * @category Instances
 */
export const darkMode: Type = make({
	id: 'DarkMode',
	styles: HashMap.make(
		['Message', ASContextStyler.green()],
		['ToStringedObject', ASContextStyler.yellow()],
		[
			'PrimitiveValue',
			PPValueBasedStyler.makeTypeIndexed(
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
			PPValueBasedStyler.makeKeyTypeIndexed(
				ASPalette.make(
					// string key
					ASStyle.red,
					// symbolic key
					ASStyle.cyan
				)
			)
		],
		['PrototypeDelimiters', ASContextStyler.green()],
		['KeyValueSeparator', ASContextStyler.white()],
		['InBetweenPropertySeparator', ASContextStyler.white()],
		[
			'NonPrimitiveValueDelimiters',
			PPValueBasedStyler.makeDepthIndexed(
				ASPalette.make(
					ASStyle.red,
					ASStyle.green,
					ASStyle.yellow,
					ASStyle.blue,
					ASStyle.magenta,
					ASStyle.cyan,
					ASStyle.white
				)
			)
		],
		['Indentation', ASContextStyler.green()],
		['NonPrimitiveValueId', ASContextStyler.green()],
		['NonPrimitiveValueIdSeparator', ASContextStyler.green()],
		['PropertyNumbers', ASContextStyler.green()],
		['PropertyNumberSeparator', ASContextStyler.green()],
		['PropertyNumberDelimiters', ASContextStyler.green()]
	)
});

/**
 * StyleMap instance that doesn't apply any formatting (uses the none ContextStyler of the
 * ansi-styles library for all parts to be formatted)
 *
 * @category Instances
 */
export const none: Type = make({
	id: 'None',
	styles: HashMap.empty()
});
