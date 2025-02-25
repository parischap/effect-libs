/**
 * This module implements a type that defines a specific stringification process for certain values
 * (the normal stringification process is by-passed, hence its name). For instance, you may prefer
 * printing a Date as a string rather than as an object with all its technical properties.
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
import * as PPValueBasedFormatterConstructor from './ValueBasedFormatterConstructor.js';

export const moduleTag = '@parischap/pretty-print/ByPasser/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a ByPasser used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action. The action takes as input a ValueBasedFormatterConstructor (see
	 * ValueBasedFormatterConstructor.ts), a MarkShowerConstructor (see Option.ts) and the Value being
	 * currently printed. If the action returns a value of type `Some<StringifiedValue.Type>`, this
	 * `StringifiedValue` will be used as is to represent the input value. If it returns a `none`, the
	 * normal stringification process will be applied.
	 *
	 * @category Models
	 */
	export interface Type {
		(
			this: PPOption.Type,
			{
				valueBasedFormatterConstructor,
				markShowerConstructor
			}: {
				readonly valueBasedFormatterConstructor: PPValueBasedFormatterConstructor.Type;
				readonly markShowerConstructor: PPOption.MarkShowerConstructor.Type;
			}
		): MTypes.OneArgFunction<PPValue.All, Option.Option<PPStringifiedValue.Type>>;
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
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
	Object.assign(MFunction.clone(action), {
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
 * ByPasser instance that does not bypass any value
 *
 * @category Instances
 */
export const empty: Type = make({
	id: 'Empty',
	action: () => () => Option.none()
});

/**
 * ByPasser instance that has the following behavior:
 *
 * - For any function: a some of the function name surrounded by the function delimiters and the
 *   message delimiters. If the function name is an empty string, `anonymous` is used instead.
 * - For any other value: returns a `none`
 *
 * @category Instances
 */
export const functionToName: Type = make({
	id: 'FunctionToName',
	action: ({ valueBasedFormatterConstructor, markShowerConstructor }) => {
		const messageTextFormatter = valueBasedFormatterConstructor('Message');

		const functionNameStartDelimiterMarkShower = markShowerConstructor(
			'FunctionNameStartDelimiter'
		);
		const functionNameEndDelimiterMarkShower = markShowerConstructor('FunctionNameEndDelimiter');
		const messageStartDelimiterMarkShower = markShowerConstructor('MessageStartDelimiter');
		const messageEndDelimiterMarkShower = markShowerConstructor('MessageEndDelimiter');

		return (value) =>
			pipe(
				value,
				Option.liftPredicate(PPValue.isFunction),
				Option.map(
					flow(
						PPValue.content,
						MFunction.name,
						Option.liftPredicate(String.isNonEmpty),
						Option.getOrElse(Function.constant('anonymous')),
						messageTextFormatter(value),
						ASText.surround(
							functionNameStartDelimiterMarkShower(value),
							functionNameEndDelimiterMarkShower(value)
						),
						ASText.surround(
							messageStartDelimiterMarkShower(value),
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
			const inContextToStringedObjectTextFormatter = toStringedObjectTextFormatter(value);
			return pipe(
				value,
				Option.liftPredicate(PPValue.isNonPrimitive),
				Option.flatMap(
					flow(
						PPValue.content,
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
						Array.map((s, _i) => inContextToStringedObjectTextFormatter(s))
					)
				)
			);
		};
	}
});
