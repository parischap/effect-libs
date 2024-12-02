/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that defines a specific stringification process for certain values
 * (the normal stringification process is by-passed). For instance, you may prefer printing Dates as
 * strings rather than as objects.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs. The easiest way to do so is to call the action method of one of the existing ByPasser
 * instances for the part you want to keep and write your own code for the part you want to change.
 *
 * @since 0.0.1
 */

import {
	MInspectable,
	MMatch,
	MOption,
	MPipeable,
	MRecord,
	MRegExp,
	MString,
	MTypes
} from '@parischap/effect-lib';

import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String
} from 'effect';
import type * as PPFormatSet from './FormatMap.js';
import * as PPFormattedString from './FormattedString.js';
import type * as PPOption from './Option.js';
import type * as PPStringifiedValue from './StringifiedValue.js';

const moduleTag = '@parischap/pretty-print/ByPasser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a ByPasser.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ByPasser instance. Useful for equality and debugging: the action property being a
	 * function, it will not be printed by the `toString` method.
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
	/**
	 * Action of this ByPasser. `value` is the Value (see Value.ts) being currently printed. `option`
	 * is the `Option` instance (see Option.ts) passed by the user. If the action returns a value of
	 * type `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this `StringifiedValue` will be
	 * used as is to represent the input value. If it returns a `none` or `null` or `undefined`, the
	 * normal stringification process will be applied. For primitive types, the normal stringification
	 * process is to call the toString method (except for `null` and `undefined` which are printed as
	 * 'null' and 'undefined' respectively). For records, the normal stringification process consists
	 * in stringifying the constituents of the record (obtained by calling Reflect.ownKeys). The
	 * normal stringification process does not handle formats. So most of the time, it's best to use
	 * one of the predefined `ByPasser` instances if you want formatted output.
	 *
	 * @since 0.0.1
	 */
	readonly action: (
		value: MTypes.Unknown,
		option: PPOption.Type
	) => MOption.OptionOrNullable<PPStringifiedValue.Type>;
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

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.id));
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
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Function that returns a ByPasser instance which prints primitives as util.inspect does. This
 * ByPasser manages formats. It does not provide any special treatment for objects.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecord = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'ObjectAsRecord',
		action: flow(
			MMatch.make,
			MMatch.when(
				MTypes.isString,
				flow(
					MString.prepend("'"),
					MString.append("'"),
					PPFormattedString.makeWith(formatSet.stringValueFormatter),
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
					PPFormattedString.makeWith(formatSet.otherValueFormatter),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isBigInt,
				flow(
					MString.fromNonNullablePrimitive,
					PPFormattedString.makeWith(formatSet.otherValueFormatter),
					PPFormattedString.append(
						pipe('n', PPFormattedString.makeWith(formatSet.bigIntMarkFormatter))
					),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isSymbol,
				flow(
					MString.fromNonNullablePrimitive,
					PPFormattedString.makeWith(formatSet.symbolValueFormatter),
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
export const objectAsRecordWithoutNullables = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'ObjectAsRecordWithoutNullables',
		action: (value, option) =>
			pipe(
				value,
				MMatch.make,
				MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
				MMatch.orElse(() => objectAsRecord(formatSet).action(value, option))
			)
	});

/**
 * Same as `objectAsRecord` but records receive the following treatment:
 *
 * - For functions: returns a some of `option.functionLabel`
 * - For arrays: return a `none`
 * - For non-null objects: tries to call the toString method (only if it is different from
 *   Object.prototype.toString). Returns a `some` of the result if successful. Returns a `none`
 *   otherwise.
 *
 * This is the instance you will use most of the time.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValue = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'ObjectAsValue',
		action: (value, option) =>
			pipe(
				value,
				MMatch.make,
				MMatch.when(MTypes.isArray, () => Option.none()),
				MMatch.when(MTypes.isFunction, () => pipe(option.functionLabel, Array.of, Option.some)),
				MMatch.when(
					MTypes.isRecord,
					flow(
						MRecord.tryZeroParamStringFunction({
							functionName: 'toString',
							/* eslint-disable-next-line @typescript-eslint/unbound-method */
							exception: Object.prototype.toString
						}),
						Option.map(
							flow(
								// split resets RegExp.prototype.lastIndex after executing
								String.split(MRegExp.globalLineBreak),
								Array.map(PPFormattedString.makeWith(formatSet.otherValueFormatter))
							)
						)
					)
				),
				MMatch.orElse(() => objectAsRecord(formatSet).action(value, option))
			)
	});

/**
 * Same as `objectAsValue` but nullable values are not printed. Comes in handy when treeifying.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValueWithoutNullables = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'ObjectAsValueWithoutNullables',
		action: (value, option) =>
			pipe(
				value,
				MMatch.make,
				MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
				MMatch.orElse(() => objectAsValue(formatSet).action(value, option))
			)
	});
