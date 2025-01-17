/**
 * This module implements a type that defines a specific stringification process for certain values
 * (the normal stringification process is by-passed, hence its name). For instance, you may prefer
 * printing Dates as strings rather than as objects.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
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

import { ASText } from '@parischap/ansi-styles';
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
import * as PPOptionAndPrecalc from './OptionAndPrecalc.js';
import type * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/ByPasser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a ByPasser used as an action
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action. The first parameter contains the Option instance passed by the user
	 * enriched by some precalced values (see OptionAndPrecalc.ts). The second parameter is the Value
	 * (see Value.ts) being currently displayed. If the action returns a value of type
	 * `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this `StringifiedValue` will be used
	 * as is to represent the input value. If it returns a `none` or `null` or `undefined`, the normal
	 * stringification process will be applied.
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			PPOptionAndPrecalc.Type,
			MTypes.OneArgFunction<PPValue.All, MOption.OptionOrNullable<PPStringifiedValue.Type>>
		> {}
}

/**
 * Type that represents a ByPasser.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/**
	 * Id of this ByPasser instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

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

/** Base */
const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
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
 * @since 0.0.1
 * @category Constructors
 */
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
	Object.assign(action.bind({}), {
		id,
		...base
	});

/**
 * Function that returns a ByPasser instance which prints primitives as util.inspect does. It does
 * not provide any special treatment for objects.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecord: Type = make({
	id: 'ObjectAsRecord',
	action: (optionAndPrecalc) => (value) => {
		const textShower = pipe(value, PPOptionAndPrecalc.toTextShower(optionAndPrecalc));
		const markShower = pipe(value, PPOptionAndPrecalc.toMarkShower(optionAndPrecalc));
		return pipe(
			value,
			PPValue.value,
			MMatch.make,
			MMatch.when(
				MTypes.isString,
				flow(
					textShower('stringValue'),
					ASText.prepend(markShower('stringStartDelimiter')),
					ASText.append(markShower('stringEndDelimiter')),
					Array.of,
					Option.some
				)
			),
			MMatch.whenOr(
				MTypes.isNumber,
				MTypes.isBoolean,
				MTypes.isNull,
				MTypes.isUndefined,
				flow(MString.fromPrimitive, textShower('otherValue'), Array.of, Option.some)
			),
			MMatch.when(
				MTypes.isBigInt,
				flow(
					MString.fromNonNullablePrimitive,
					textShower('otherValue'),
					ASText.prepend(markShower('bigIntStartDelimiter')),
					ASText.append(markShower('bigIntEndDelimiter')),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isSymbol,
				flow(MString.fromNonNullablePrimitive, textShower('symbolValue'), Array.of, Option.some)
			),
			MMatch.orElse(() => Option.none())
		);
	}
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
					MTypes.isNonNullObject,
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
								Array.map(PPString.makeWith(formatSet.otherValueFormatter))
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
