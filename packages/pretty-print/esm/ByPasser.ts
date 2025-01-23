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
	MMatch,
	MOption,
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
import * as PPOptionAndPrecalc from './OptionAndPrecalc.js';
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
	 * Type of the action. The action takes as input a TextFormatterBuilder and a MarkShowerBuilder
	 * (see OptionAndPrecalc.ts) and the Value being currently printed (see Value.ts). If the action
	 * returns a value of type `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this
	 * `StringifiedValue` will be used as is to represent the input value. If it returns a `none` or
	 * `null` or `undefined`, the normal stringification process will be applied.
	 *
	 * @category Models
	 */
	export interface Type {
		(
			textFormatterBuilder: PPOptionAndPrecalc.TextFormatterBuilder.Type,
			markShowerBuilder: PPOptionAndPrecalc.MarkShowerBuilder.Type
		): MTypes.OneArgFunction<PPValue.All, MOption.OptionOrNullable<PPStringifiedValue.Type>>;
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
 * ByPasser instance that returns:
 *
 * - For functions: a some of the function name followed by parentheses
 * - For any other object than functions: tries to call the toString method (only if it is different
 *   from Object.prototype.toString). Returns a `some` of the result if successful. Returns a `none`
 *   otherwise. For any other value: returns a none
 *
 * This is the instance you will use most of the time.
 *
 * @category Instances
 */
export const bypassIfToStringed: Type = make({
	id: 'bypassIfToStringed',
	action: (textFormatterBuilder, markShowerBuilder) => {
		const functionNameTextFormatter = textFormatterBuilder('functionName');
		const toStringedObjectTextFormatter = textFormatterBuilder('toStringedObject');

		const functionPrefixMarkShower = markShowerBuilder('functionPrefix');
		const functionSuffixMarkShower = markShowerBuilder('functionSuffix');
		const defaultFunctionNameMarkShower = markShowerBuilder('defaultFunctionName');

		return (value) => {
			const inContextToStringedObjectTextFormatter: MTypes.OneArgFunction<string, ASText.Type> =
				toStringedObjectTextFormatter(value);
			return pipe(
				value,
				PPValue.value,
				MMatch.make,
				MMatch.when(
					MTypes.isFunction,
					flow(
						MFunction.name,
						Option.liftPredicate(
							Predicate.and(String.isNonEmpty, Predicate.not(MFunction.strictEquals('anonymous')))
						),
						Option.map(functionNameTextFormatter(value)),
						Option.getOrElse(pipe(value, defaultFunctionNameMarkShower, Function.constant)),
						ASText.prepend(functionPrefixMarkShower(value)),
						ASText.append(functionSuffixMarkShower(value)),
						PPStringifiedValue.fromText,
						Option.some
					)
				),
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
								Array.map(inContextToStringedObjectTextFormatter)
							)
						)
					)
				),
				MMatch.orElse(Function.constant(Option.none()))
			);
		};
	}
});
