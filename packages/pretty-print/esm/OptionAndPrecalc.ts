/**
 * This module implements a type that encapsulates the options for pretty-printing and precalculated
 * values useful for the stringification process
 */

import { Function, HashMap, Inspectable, Option, pipe, Struct } from 'effect';
import * as PPOption from './Option.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';

import { ASText } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Pipeable, Predicate } from 'effect';

export const moduleTag = '@parischap/pretty-print/OptionAndPrecalc/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

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
	export interface Type extends MTypes.OneArgFunction<PPValue.All, ASText.Type> {}

	/**
	 * MarkShower instance that always prints an empty Text
	 *
	 * @category Instances
	 */
	export const empty: Type = (_context) => ASText.empty;
}

/**
 * Namespace of a MarkShowerMap
 *
 * @category Models
 */
export namespace MarkShowerMap {
	/**
	 * Type of a MarkShowerMap
	 *
	 * @category Models
	 */
	export interface Type extends HashMap.HashMap<string, MarkShower.Type> {}
}

/**
 * Namespace of a MarkShowerBuilder
 *
 * @category Models
 */
export namespace MarkShowerBuilder {
	/**
	 * Type of a MarkShowerBuilder
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, MarkShower.Type> {}
}

/**
 * Namespace of a TextFormatterBuilder
 *
 * @category Models
 */
export namespace TextFormatterBuilder {
	/**
	 * Type of a TextFormatterBuilder
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<string, PPStyleMap.ValueBasedFormatter.Type> {}
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
	readonly markShowerMap: MarkShowerMap.Type;

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
export const make = (option: PPOption.Type): Type => {
	const styleMap = option.styleMap;
	return _make({
		option,
		markShowerMap: HashMap.map(option.markMap.marks, ({ text, partName }) =>
			pipe(
				styleMap,
				PPStyleMap.get(partName),
				(contextFormatter) => (value) => contextFormatter(value)(text)
			)
		)
	});
};

/**
 * Returns the `option` property of `self`
 *
 * @category Destructors
 */
export const option: MTypes.OneArgFunction<Type, PPOption.Type> = Struct.get('option');

/**
 * Returns the `markShowerMap` property of `self`
 *
 * @category Destructors
 */
export const markShowerMap: MTypes.OneArgFunction<Type, MarkShowerMap.Type> =
	Struct.get('markShowerMap');

/**
 * Builds a TextShower builder from `self`
 *
 * @category Destructors
 */
export const toTextFormatterBuilder = (self: Type): TextFormatterBuilder.Type => {
	const styleMap = self.option.styleMap;
	return (partName) => pipe(styleMap, PPStyleMap.get(partName));
};

/**
 * Builds a MarkShower builder from `self`
 *
 * @category Destructors
 */
export const toMarkShowerBuilder = (self: Type): MarkShowerBuilder.Type => {
	const markShowerMap = self.markShowerMap;
	return (markName) =>
		pipe(
			markShowerMap,
			HashMap.get(markName),
			Option.getOrElse(Function.constant(MarkShower.empty))
		);
};
