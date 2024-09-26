/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that defines a specific stringification for certain values (the
 * stringification process is by-passed). For instance, you may prefer printing Dates as strings
 * rather than as objects.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs. The easiest way to do so is to call the action mathod of one of the existing ByPasser
 * instances for the part you want to keep and write your own code for the part you want to change.
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MOption, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import { JsRegExp } from '@parischap/js-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String
} from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import type * as Options from './Options.js';
import type * as StringifiedValue from './StringifiedValue.js';

const moduleTag = '@parischap/pretty-print/ByPasser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const lineBreakRegExp = new RegExp(JsRegExp.lineBreak, 'g');

/**
 * Type that represents a ByPasser.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ByPasser instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Action of this ByPasser. `value` is the Value (see Value.ts) being currently printed. options
	 * is the Options instance (see Options.ts) passed to the pretty-printer. If the action returns a
	 * value of type `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this value will be used
	 * as is to represent the input value. If it returns a `none` or `null` or `undefined`, the normal
	 * stringification process will be applied. For primitive types, the normal stringification
	 * process is to call the toString method (except for `null` and `undefined` which are printed as
	 * 'null' and 'undefined' respectively). For records, the normal stringification process consists
	 * in stringifying the constituents of the record (obtained by calling Reflect.ownKeys). The
	 * normal stringification process does not handle colors. So most of the time, it's best to byPass
	 * at least primitives with one of the predefined `ByPasser` instances.
	 *
	 * @since 0.0.1
	 */
	readonly action: (
		value: MTypes.Unknown,
		options: Options.Type
	) => MOption.OptionOrNullable<StringifiedValue.Type>;
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
	 * @category Equivalences
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
 * Function that returns a ByPasser instance which prints primitives as util.inspect does. This
 * ByPasser manages colors. It does not provide any special treatment for objects.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecord = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + 'ObjectAsRecord',
		action: flow(
			MMatch.make,
			MMatch.when(
				MTypes.isString,
				flow(
					MString.prepend("'"),
					MString.append("'"),
					FormattedString.makeWith(colorSet.stringValueColorer),
					Array.of,
					Option.some
				)
			),
			MMatch.whenOr(
				MTypes.isNumber,
				MTypes.isBoolean,
				MTypes.isNull,
				MTypes.isUndefined,
				flow(
					MString.fromPrimitive,
					FormattedString.makeWith(colorSet.otherValueColorer),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isBigInt,
				flow(
					MString.fromNonNullablePrimitive,
					FormattedString.makeWith(colorSet.otherValueColorer),
					FormattedString.append(pipe('n', FormattedString.makeWith(colorSet.bigIntMarkColorer))),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isSymbol,
				flow(
					MString.fromNonNullablePrimitive,
					FormattedString.makeWith(colorSet.symbolValueColorer),
					Array.of,
					Option.some
				)
			),
			MMatch.orElse(() => Option.none())
		)
	});

/**
 * Same as `objectAsRecord` but nullable values are not printed.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecordWithoutNullables = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + 'ObjectAsRecordWithoutNullables',
		action: (value, options) =>
			pipe(
				value,
				MMatch.make,
				MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
				MMatch.orElse(() => objectAsRecord(colorSet).action(value, options))
			)
	});

/**
 * Same as `objectAsRecord` but records receive the following treatment:
 *
 * - For functions: returns a some of `options.functionLabel`
 * - For arrays: return a `none`
 * - For non-null objects: first tries to call the toString method (only if it is different from
 *   Object.prototype.toString) and then the toJSON method. Returns a `some` of the result if
 *   successful. Returns a `none` otherwise.
 *
 * This is the instance you will use most of the time.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValue = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + 'ObjectAsValue',
		action: (value, options) =>
			pipe(
				value,
				MMatch.make,
				MMatch.when(MTypes.isArray, () => Option.none()),
				MMatch.when(MTypes.isFunction, () => pipe(options.functionLabel, Array.of, Option.some)),
				MMatch.when(
					MTypes.isRecord,
					flow(
						MString.tryToStringToJSON,
						Option.map(
							flow(
								String.split(lineBreakRegExp),
								Array.map(FormattedString.makeWith(colorSet.otherValueColorer))
							)
						)
					)
				),
				MMatch.orElse(() => objectAsRecord(colorSet).action(value, options))
			)
	});

/**
 * Same as `objectAsValue` but nullable values are not printed. Comes in handy when treeifying.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValueWithoutNullables = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + 'ObjectAsValueWithoutNullables',
		action: (value, options) =>
			pipe(
				value,
				MMatch.make,
				MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
				MMatch.orElse(() => objectAsValue(colorSet).action(value, options))
			)
	});
