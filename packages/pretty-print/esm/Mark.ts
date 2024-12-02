/**
 * This module implements a type that represents a mark to be displayed when stringifying a value.
 * Each mark is composed of a string and the id of a Format (see FormatMap.ts) to apply to that
 * string.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.3.0
 */

import { ASWheelFormatter } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import {
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate
} from 'effect';
import * as PPFormatMap from './FormatMap.js';
import * as PPFormattedString from './FormattedString.js';
import type * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/Mark/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a Mark
 *
 * @since 0.3.0
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The text of this mark
	 *
	 * @since 0.3.0
	 */
	readonly text: string;
	/**
	 * The id of the format to apply to the text
	 *
	 * @since 0.3.0
	 */
	readonly formatName: string;
	/**
	 * The precalculated formatted text when possible
	 *
	 * @since 0.3.0
	 */
	readonly precalcedText: Option.Option<PPFormattedString.Type>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.3.0
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.3.0
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.text === self.text && self.formatName === that.formatName;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.structure(this));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
export const _make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @since 0.3.0
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'precalcedText'>): Type =>
	_make({ ...params, precalcedText: Option.none() });

/**
 * Returns a copy of `self` with `precalcedText` calculated
 *
 * @since 0.3.0
 * @category Utils
 */

export const preCalc = (formatMap: PPFormatMap.Type): MTypes.OneArgFunction<Type> =>
	flow(
		MStruct.enrichWith({
			precalcedText: ({ text, formatName, precalcedText }) =>
				Option.orElse(precalcedText, () =>
					pipe(
						formatMap,
						PPFormatMap.get(formatName),
						Option.liftPredicate(ASWheelFormatter.hasValueIndependantAction),
						Option.map(
							flow(
								ASWheelFormatter.action,
								Function.apply(null as never),
								PPFormattedString.makeWith,
								Function.apply(text)
							)
						)
					)
				)
		}),
		_make
	);

/**
 * Returns the formatted `text` of `self`. Uses `precalcedText` if available.
 *
 * @since 0.3.0
 * @category Destructors
 */

export const formatted =
	(value: PPValue.All, formatMap: PPFormatMap.Type) =>
	(self: Type): PPFormattedString.Type =>
		pipe(
			self.precalcedText,
			Option.getOrElse(() =>
				pipe(
					formatMap,
					PPFormatMap.get(self.formatName),
					ASWheelFormatter.action,
					Function.apply(value),
					PPFormattedString.makeWith,
					Function.apply(self.text)
				)
			)
		);
