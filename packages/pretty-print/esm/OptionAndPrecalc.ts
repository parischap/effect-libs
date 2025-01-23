/**
 * This module implements a type that encapsulates the options for pretty-printing and precalculated
 * values useful for the stringification process
 */

import { Function, HashMap, Inspectable, pipe, Struct } from 'effect';
import * as PPOption from './Option.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';

import { ASContextFormatter, ASText } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Pipeable, Predicate } from 'effect';

export const moduleTag = '@parischap/pretty-print/OptionAndPrecalc/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a ContextualTextShower
 *
 * @category Models
 */
export namespace ContextualTextShower {
	/**
	 * Type of a ContextualTextShower
	 *
	 * - @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValue.All, ASText.Type> {}
}

/**
 * Namespace of a TextShower
 *
 * @category Models
 */
export namespace TextShower {
	/**
	 * Type of a TextShower
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			string,
			MTypes.OneArgFunction<string, ContextualTextShower.Type>
		> {}
}

/**
 * Namespace of a ContextualMarkShower
 *
 * @category Models
 */
export namespace ContextualMarkShower {
	/**
	 * Type of a ContextualMarkShower
	 *
	 * - @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValue.All, ASText.Type> {}
}

/**
 * Namespace of a MarkShower
 *
 * @category Models
 */
export namespace MarkShower {
	/**
	 * Type of a MarkShower
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, ContextualMarkShower.Type> {}
}

/**
 * Interface that represents an OptionAndPrecalc
 *
 * @category Models
 */
export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
	/** The original options passed by the user */
	readonly option: PPOption.Type;

	/** Precompiled map of the different marks that appear in a value to stringify */
	readonly precompMarkMap: PPStyleMap.Type;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (option: PPOption.Type): Type =>
	_make({
		option,
		precompMarkMap: PPStyleMap.make({
			id: option.markMap.id,
			styles: pipe(
				option.markMap,
				Struct.get('marks'),
				HashMap.map(({ text, partName }) =>
					pipe(option.styleMap, PPStyleMap.get(partName), ASContextFormatter.setDefaultText(text))
				)
			)
		})
	});

/**
 * Returns the `option` property of `self`
 *
 * @category Destructors
 */
export const option: MTypes.OneArgFunction<Type, PPOption.Type> = Struct.get('option');

/**
 * Returns the `precompMarkMap` property of `self`
 *
 * @category Destructors
 */
export const precompMarkMap: MTypes.OneArgFunction<Type, PPStyleMap.Type> =
	Struct.get('precompMarkMap');

/** Builds a textShower from `self` */
export const toTextShower = (self: Type): TextShower.Type => {
	const styleMap = self.option.styleMap;
	return (partName) => pipe(styleMap, PPStyleMap.get(partName));
};

/** Builds a markShower from `self` */
export const toMarkShower = (self: Type): MarkShower.Type => {
	const markMap = self.precompMarkMap;
	return (partName) => pipe(markMap, PPStyleMap.get(partName), Function.apply(undefined));
};
