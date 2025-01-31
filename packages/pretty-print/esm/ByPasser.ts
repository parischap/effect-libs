/**
 * This module implements a type that defines a specific stringification process for certain values
 * (the normal stringification process is by-passed, hence its name). For instance, you may prefer
 * printing Dates as strings rather than as objects.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import {
	MFunction,
	MInspectable,
	MPipeable,
	MRecord,
	MRegExp,
	MTypes
} from '@parischap/effect-lib';

import { ASText } from '@parischap/ansi-styles';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import type * as PPOption from './Option.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/ByPasser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a ByPasser used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action. The action takes as input a ValueBasedFormatterConstructor, a
	 * MarkShowerConstructor (see OptionAndPrecalc.ts) and the Value being currently printed (see
	 * Value.ts). If the action returns a value of type `Some<StringifiedValue.Type>` or
	 * `StringifiedValue.Type`, this `StringifiedValue` will be used as is to represent the input
	 * value. If it returns a `none` or `null` or `undefined`, the normal stringification process will
	 * be applied.
	 *
	 * @category Models
	 */
	export interface Type {
		({
			valueBasedFormatterConstructor,
			markShowerConstructor
		}: {
			readonly valueBasedFormatterConstructor: PPOption.ValueBasedFormatterConstructor.Type;
			readonly markShowerConstructor: PPOption.MarkShowerConstructor.Type;
		}): MTypes.OneArgFunction<PPValue.All, Option.Option<PPStringifiedValue.Type>>;
	}
}

/**
 * Type that represents a ByPasser.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this ByPasser instance. Useful for equality and debugging */
	readonly id: string;

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
 * @category Constructors
 */
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
	Object.assign(action.bind({}), {
		id,
		...base
	});

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * ByPasser instance that has the following behavior:
 *
 * - For any function: a some of the function name followed by parentheses.
 * - For any other value: returns a `none`
 *
 * @category Instances
 */
export const functionToName: Type = make({
	id: 'FunctionToName',
	action: ({ valueBasedFormatterConstructor, markShowerConstructor }) => {
		const functionNameTextFormatter = valueBasedFormatterConstructor('FunctionName');

		const functionNameStartDelimiterMarkShower = markShowerConstructor(
			'FunctionNameStartDelimiter'
		);
		const functionNameEndDelimiterMarkShower = markShowerConstructor('FunctionNameEndDelimiter');
		const defaultFunctionNameMarkShower = markShowerConstructor('DefaultFunctionName');
		const messageStartDelimiterMarkShower = markShowerConstructor('MessageStartDelimiter');
		const messageEndDelimiterMarkShower = markShowerConstructor('MessageEndDelimiter');

		return (value) =>
			pipe(
				value,
				Option.liftPredicate(PPValue.isFunction),
				Option.map(
					flow(
						PPValue.value,
						MFunction.name,
						Option.liftPredicate(
							Predicate.and(String.isNonEmpty, Predicate.not(MFunction.strictEquals('anonymous')))
						),
						Option.map(functionNameTextFormatter(value)),
						Option.getOrElse(pipe(value, defaultFunctionNameMarkShower, Function.constant)),
						ASText.surround(
							functionNameStartDelimiterMarkShower(value),
							messageStartDelimiterMarkShower(value)
						),
						ASText.surround(
							functionNameEndDelimiterMarkShower(value),
							messageEndDelimiterMarkShower(value)
						),
						PPStringifiedValue.fromText
					)
				)
			);
	}
});

/**
 * ByPasser instance that has the following behavior:
 *
 * - For any non-primitive value : tries to call the toString method (only if it is different from
 *   Object.prototype.toString). Returns a `some` of the result if successful. Returns a `none`
 *   otherwise.
 * - For any other value: returns a `none`
 *
 * @category Instances
 */
export const objectToString: Type = make({
	id: 'ObjectToString',
	action: ({ valueBasedFormatterConstructor }) => {
		const toStringedObjectTextFormatter = valueBasedFormatterConstructor('ToStringedObject');

		return (value) => {
			const inContextToStringedObjectTextFormatter: MTypes.OneArgFunction<string, ASText.Type> =
				toStringedObjectTextFormatter(value);
			return pipe(
				value,
				Option.liftPredicate(PPValue.isNonPrimitive),
				Option.flatMap(
					flow(
						PPValue.value,
						MRecord.tryZeroParamStringFunction({
							functionName: 'toString',
							/* eslint-disable-next-line @typescript-eslint/unbound-method */
							exception: Object.prototype.toString
						})
					)
				),
				Option.map(
					flow(
						// split resets RegExp.prototype.lastIndex after executing
						String.split(MRegExp.globalLineBreak),
						Array.map(inContextToStringedObjectTextFormatter)
					)
				)
			);
		};
	}
});
