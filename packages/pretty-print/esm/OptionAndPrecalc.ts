/**
 * This module implements a type that encapsulates the options for pretty-printing and precalculated
 * values useful for the stringification process
 *
 * @since 0.0.1
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
 * Interface that represents an OptionAndPrecalc
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The original options passed by the user
	 *
	 * @since 0.0.1
	 */
	readonly option: PPOption.Type;

	/**
	 * Precompiled map of the different marks that appear in a value to stringify
	 *
	 * @since 0.3.0
	 */
	readonly precompMarkMap: PPStyleMap.Type;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
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
 * @since 0.0.1
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

/** Builds a textShower from `self` */
export const toTextShower = (
	self: Type
): MTypes.OneArgFunction<
	PPValue.All,
	MTypes.OneArgFunction<string, MTypes.OneArgFunction<string, ASText.Type>>
> => {
	const styleMap = self.option.styleMap;
	return (context) => (partName) => (text) =>
		pipe(styleMap, PPStyleMap.get(partName), Function.apply(text), Function.apply(context));
};

/** Builds a markShower from `self` */
export const toMarkShower = (
	self: Type
): MTypes.OneArgFunction<PPValue.All, MTypes.OneArgFunction<string, ASText.Type>> => {
	const markMap = self.precompMarkMap;
	return (context) => (partName) =>
		pipe(markMap, PPStyleMap.get(partName), Function.apply(undefined), Function.apply(context));
};
