/**
 * This module implements a map of ContextFormatter's (see
 *
 * @parischap/ansi-styles/ContextFormatter.ts). These ContextFormatter's are used to style the different parts of a
 * stringified value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASContextFormatter, ASPalette } from '@parischap/ansi-styles';
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
import * as PPValue from './Value.js';

export const moduleTag = '@parischap/pretty-print/StyleMap/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace for a ContextFormatter based on the context of a Value
 *
 * @category Models
 */
namespace ValueBasedFormatter {
	/**
	 * Type of a ValueBasedFormatter
	 *
	 * @category Models
	 */
	export type Type = ASContextFormatter.Type<PPValue.All>;

	/**
	 * Constructor of a depth-indexed ValueBasedFormatter
	 *
	 * @category Constructors
	 */
	export const makeDepthIndexed = (palette: ASPalette.Type): Type =>
		ASContextFormatter.PaletteBased.make({
			// Use named function so the name gets printed by the toString function
			indexFromContext: function valueDepth(value: PPValue.All) {
				return PPValue.depth(value);
			},
			palette
		});
}

export namespace Styles {
	export interface Type extends HashMap.HashMap<string, ValueBasedFormatter.Type> {}
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
export const get = (partName: string): MTypes.OneArgFunction<Type, ValueBasedFormatter.Type> =>
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
		['message', ASContextFormatter.green],
		['stringDelimiters', ASContextFormatter.green],
		['stringValue', ASContextFormatter.green],
		['nullableValue', ASContextFormatter.green],
		['symbolValue', ASContextFormatter.cyan],
		['otherValue', ASContextFormatter.yellow],
		['bigIntDelimiters', ASContextFormatter.magenta],
		['propertyKeyWhenFunctionValue', ASContextFormatter.blue],
		['propertyKeyWhenSymbol', ASContextFormatter.cyan],
		['propertyKeyWhenOther', ASContextFormatter.red],
		['inBetweenPropertySeparator', ASContextFormatter.white],
		['recordDelimiters', ValueBasedFormatter.makeDepthIndexed(ASPalette.allOriginalColors)],
		['keyValueSeparator', ASContextFormatter.white],
		['prototypeDelimiters', ASContextFormatter.green],
		['multiLineIndent', ASContextFormatter.green],
		['functionName', ASContextFormatter.green],
		['functionNameDelimiters', ASContextFormatter.green],
		['toStringedObject', ASContextFormatter.yellow]
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
