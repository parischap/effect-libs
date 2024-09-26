/**
 * This module implements a type that represents an array of colors that repeat themselves
 * indefinitely. It is used by the ColorWheel module (see ColorWheel.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { JsColor, JsString } from '@parischap/js-lib';
import {
	Array,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate
} from 'effect';
import type * as ColorSet from './ColorSet.js';

const moduleTag = '@parischap/pretty-print/ColorWheel/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a ColorWheel
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ColorWheel instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Array of colors that repeat themselves indefinitely. If empty, equivalent to the identity
	 * function (i.e no color is applied)
	 *
	 * @since 0.0.1
	 */
	readonly colors: ReadonlyArray<ColorSet.Colorer>;
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

/** Equivalence */
const _equivalence: Equivalence.Equivalence<Type> = (self: Type, that: Type) =>
	that.name === self.name;

export {
	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	_equivalence as Equivalence
};

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type) {
		return this.name === '' ? this : this.name;
	},
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor without a name
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'name'>): Type =>
	_make({ ...params, name: '' });

/**
 * Returns a copy of `self` with `name` set to `name`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setName =
	(name: string) =>
	(self: Type): Type =>
		_make({ ...self, name: name });

/**
 * Function that retrieves the n-th color of a color wheel, applying a modulo if n exceeds the
 * number of available colors. If the colorWheel is empty, the identity function is returned (i.e no
 * color is applied)
 *
 * @since 0.0.1
 * @category Utils
 */
export const getColor =
	(n: number) =>
	(self: Type): ColorSet.Colorer =>
		pipe(
			self.colors,
			Array.get(n % self.colors.length),
			Option.getOrElse(() => Function.identity)
		);

/**
 * Empty ColorWheel instance
 *
 * @since 0.0.1
 * @category Utils
 */
export const empty = _make({
	name: 'empty',
	colors: Array.empty()
});

/**
 * ColorWheel instance adapted to ansi dark mode
 *
 * @since 0.0.1
 * @category Utils
 */

export const ansiDarkMode = _make({
	name: 'ansiDarkMode',
	colors: Array.make(
		JsString.colorize(JsColor.green),
		JsString.colorize(JsColor.yellow),
		JsString.colorize(JsColor.magenta),
		JsString.colorize(JsColor.cyan),
		JsString.colorize(JsColor.red),
		JsString.colorize(JsColor.blue),
		JsString.colorize(JsColor.white)
	)
});
