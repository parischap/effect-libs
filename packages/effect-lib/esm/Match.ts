/**
 * Simple matcher that can only match against predicates and refinements. Fast and simple but
 * sufficient for most use cases. As the matcher is so simple, it needs no compilation which really
 * simplifies its use.
 *
 * @since 0.0.6
 */

import { Inspectable, Option, Pipeable, Predicate, Types, pipe } from 'effect';
import * as MInspectable from './Inspectable.js';
import * as MPipeable from './Pipeable.js';
import * as MPredicate from './Predicate.js';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/Match/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * @since 0.0.6
 * @category Models
 */
export interface Type<out Input, out Output, out Rest extends Input = Input>
	extends Inspectable.Inspectable,
		Pipeable.Pipeable {
	/**
	 * The value to match
	 *
	 * @since 0.0.6
	 */
	readonly value: Input;
	/**
	 * The result of the match when it has been found
	 *
	 * @since 0.0.6
	 */
	readonly result: Option.Option<Output>;
	/** @internal */
	readonly [TypeId]: {
		readonly _Input: Types.Covariant<Input>;
		readonly _Output: Types.Covariant<Output>;
		readonly _Rest: Types.Covariant<Rest>;
	};
}

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any, any>> = {
	[TypeId]: {
		_Input: MTypes.covariantValue,
		_Output: MTypes.covariantValue,
		_Rest: MTypes.covariantValue
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <Input, Output, Rest extends Input>(
	params: MTypes.Data<Type<Input, Output, Rest>>
): Type<Input, Output, Rest> => MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a new matcher
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make = <Input>(value: Input) => _make({ value, result: Option.none() });

/**
 * Matches against a refinement or a predicate. Returns a copy of self if self already has a result.
 * Otherwise, applies the predicate/refinement to the value of self. Returns a copy of self if the
 * predicate returns `false`. Otherwise, returns a copy of self with the result set to the output of
 * a function f called with the value of self as parameter. From a type perspective, the Rest is
 * only `refined` if the predicate is a refinement.
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleRecord = (value: MTypes.AnyRecord) => value;
 *
 * 	export const testMatcher = (value: MTypes.Unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isPrimitive, handlePrimitive),
 * 			MMatch.when(MTypes.isRecord, handleRecord),
 * 			MMatch.exhaustive
 * 		);
 */

export const when =
	<
		Input,
		Rest extends Input,
		// Pred can be a predicate on a type wider than Rest (eg. when using Predicate.struct with not all properties)
		Pred extends Predicate.Predicate<Rest>,
		Output1
	>(
		predicate: Pred,
		f: (value: NoInfer<MPredicate.Target<Pred> & Rest>) => Output1
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<Input, Output | Output1, Exclude<Rest, MPredicate.Coverage<Pred>>> =>
		_make({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value as Rest,
					Option.liftPredicate(predicate),
					Option.map(f as (value: Input) => Output1)
				)
			)
		});

/**
 * Matches against a primitive value sparing you the need to define a type guard. Returns a copy of
 * self if self already has a result. Otherwise, the value of self is compared to the provided value
 * using strict equality. Returns a copy of self if the two values are not equal. Otherwise, returns
 * a copy of self with the result set to the output of a function f called with the value of self as
 * parameter.From a type perspective, the Rest will only be 'refined` if it`s a finite type like an
 * Enum (but not `number` or `string`)
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MMatch } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	enum TestEnum {
 * 		A = `a`,
 * 		B = `b`,
 * 		C = `c`
 * 	}
 *
 * 	export const testMatcher = (value: TestEnum) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.whenIs(TestEnum.A, () => `a`),
 * 			MMatch.whenIs(TestEnum.B, () => `b`),
 * 			MMatch.whenIs(TestEnum.C, () => `c`),
 * 			MMatch.exhaustive
 * 		);
 */
export const whenIs =
	<Input extends MTypes.Primitive, Rest extends Input, const A extends Rest, Output1>(
		value: A,
		f: (value: A) => Output1
	) =>
	<Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Exclude<Rest, A>> =>
		_make({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value,
					Option.some,
					Option.filter((input: Input): input is A => input === value),
					Option.map(f)
				)
			)
		});

/**
 * Tries f on the input value and matches if f returns a some whose value becomes the result of the
 * matcher. Returns a copy of self if self already has a result. Otherwise, calls a function f with
 * the value of self as parameter. Returns a copy of self if f returns a `none`. Otherwise, returns
 * a copy of self with the result set to the output the f function (extracted from the `some`). From
 * a type perspective, the `Rest` will not be refined.
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MMatch } from '@parischap/effect-lib';
 * 	import { pipe, Array } from 'effect';
 *
 * 	export const testMatcher = (value: ReadonlyArray<number>) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.tryFunction(Array.get(1)),
 * 			MMatch.tryFunction(Array.get(5)),
 * 			MMatch.orElse(() => 0)
 * 		);
 */
export const tryFunction =
	<Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Option.Option<Output1>) =>
	<Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Rest> =>
		_make({
			value: self.value,
			result: Option.orElse(self.result, () => f(self.value as Rest))
		});

/**
 * Same as when but several predicates can be provided. The match occurs if one of the predicate
 * returns `true`. From a type perspective, the `Rest` will only be refined if all predicates are
 * refinements.
 *
 * @since 0.0.6
 * @category Utils
 */
export const whenOr =
	<
		Input,
		Rest extends Input,
		// R can be an array of predicates on a type wider than Rest (eg. when using Predicate.struct with not all properties)
		R extends MTypes.OverTwo<Predicate.Predicate<Rest>>,
		Output1
	>(
		...args: readonly [
			...refinements: R,
			f: (value: NoInfer<MPredicate.PredicatesToTargets<R>[number] & Rest>) => Output1
		]
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<Input, Output | Output1, Exclude<Rest, MPredicate.PredicatesToCoverages<R>[number]>> =>
		_make({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value,
					Option.liftPredicate(
						Predicate.some(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>)
					),
					Option.map(args[args.length - 1] as (value: Input) => Output1)
				)
			)
		});

/**
 * Same as when but several predicates can be provided. The match occurs if all the predicates
 * return `true`. From a type perspective, the `Rest` will only be refined if all predicates are
 * refinements.
 *
 * @since 0.0.6
 * @category Utils
 */
export const whenAnd =
	<
		Input,
		Rest extends Input,
		// R can be an array of predicates on a type wider than Rest (eg. when using Predicate.struct with not all properties)
		R extends MTypes.OverTwo<Predicate.Predicate<Rest>>,
		Output1
	>(
		...args: readonly [
			...refinements: R,
			f: (
				value: NoInfer<MTypes.TupleToIntersection<MPredicate.PredicatesToTargets<R>>> & Rest
			) => Output1
		]
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<
		Input,
		Output | Output1,
		Exclude<Rest, MTypes.TupleToIntersection<MPredicate.PredicatesToCoverages<R>>>
	> =>
		_make({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value,
					Option.liftPredicate(
						Predicate.every(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>)
					),
					Option.map(args[args.length - 1] as (value: Input) => Output1)
				)
			)
		});

/**
 * Returns the result of self if self already has a result. Otherwise, returns the result of f
 * applied to the value of self.
 *
 * @since 0.0.6
 * @category Utils
 */
export const orElse =
	<Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Output1) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.result, () => f(self.value as unknown as Rest));

/**
 * Same as orElse but we pass a predicate (useless from a javascript perspective) to tell the
 * compiler what `Rest` should be. Useful when we know better than Typescript.
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleRecord = (value: MTypes.AnyRecord) => value;
 *
 * 	export const testMatcher = (value: unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isRecord, handleRecord),
 * 			MMatch.unsafeWhen(MTypes.isPrimitive, handlePrimitive)
 * 		);
 */
export const unsafeWhen =
	<Input, Rest extends Input, Refinement extends MTypes.RefinementFrom<Rest>, Output1>(
		_predicate: Refinement,
		f: (value: NoInfer<MPredicate.Target<Refinement>>) => Output1
	) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.result, () => f(self.value as never));

/**
 * Returns the result of the matcher and shows a type error if `Rest` is not `never`
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleRecord = (value: MTypes.AnyRecord) => value;
 *
 * 	export const testMatcher = (value: MTypes.Unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isPrimitive, handlePrimitive),
 * 			MMatch.when(MTypes.isRecord, handleRecord),
 * 			MMatch.exhaustive
 * 		);
 */
export const exhaustive = <Input, Output>(self: Type<Input, Output, never>): Output =>
	(self.result as Option.Some<Output>).value;
