/**
 * Simple matcher that can only match against predicates and refinements. Fast and simple but
 * sufficient for most use cases. As the matcher is so simple, it needs no compilation which really
 * simplifies its use.
 */

import { Array, Inspectable, Option, Pipeable, Predicate, Types, pipe } from 'effect';
import * as MInspectable from './Inspectable.js';
import * as MPipeable from './Pipeable.js';
import * as MPredicate from './Predicate.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/effect-lib/Match/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a matcher
 *
 * @category Models
 */
export interface Type<out Input, out Output, out Rest extends Input>
	extends Inspectable.Inspectable,
		Pipeable.Pipeable {
	/** The input to match */
	readonly input: Input;
	/** The output of the matcher when it has been found */
	readonly output: Option.Option<Output>;
	/** @internal */
	readonly [_TypeId]: {
		readonly _Input: Types.Covariant<Input>;
		readonly _Output: Types.Covariant<Output>;
		readonly _Rest: Types.Covariant<Rest>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown, unknown, unknown> =>
	Predicate.hasProperty(u, _TypeId);

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any, any, any>> = {
	[_TypeId]: {
		_Input: MTypes.covariantValue,
		_Output: MTypes.covariantValue,
		_Rest: MTypes.covariantValue
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <Input, Output, Rest extends Input>(params: {
	readonly input: Input;
	readonly output: Option.Option<Output>;
}): Type<Input, Output, Rest> => MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a new matcher
 *
 * @category Constructors
 */
export const make = <Input>(input: Input): Type<Input, never, Input> =>
	_make({ input, output: Option.none() });

/**
 * Matches against a refinement or a predicate. Returns a copy of `self` if `self` already has an
 * output. Otherwise, applies the predicate/refinement to `self.input`. Returns a copy of `self` if
 * the predicate returns `false`. Otherwise, returns a copy of `self` with the output set to
 * `f(self.input)`. From a type perspective, the Rest is only `refined` if the predicate is a
 * refinement.
 *
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleNonPrimitive = (value: MTypes.NonPrimitive) => value;
 *
 * 	export const testMatcher = (value: MTypes.Unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isPrimitive, handlePrimitive),
 * 			MMatch.when(MTypes.isNonPrimitive, handleNonPrimitive),
 * 			MMatch.exhaustive
 * 		);
 */

export const when: {
	<Input, Rest extends Input, Refined extends Rest, Output1>(
		predicate: Predicate.Refinement<NoInfer<Rest>, Refined>,
		f: (value: Refined) => Output1
	): <Output>(
		self: Type<Input, Output, Rest>
	) => Type<Input, Output | Output1, Exclude<Rest, Refined>>;
	<Input, Rest extends Input, Output1>(
		predicate: Predicate.Predicate<NoInfer<Rest>>,
		f: (value: Rest) => Output1
	): <Output>(self: Type<Input, Output, Rest>) => Type<Input, Output | Output1, Rest>;
} =
	<Input, Rest extends Input, Output1>(
		predicate: Predicate.Predicate<Rest>,
		f: (value: Rest) => Output1
	) =>
	<Output>(self: Type<Input, Output, Rest>) =>
		_make({
			input: self.input,
			output: Option.orElse(self.output, () =>
				pipe(
					self.input as Rest,
					Option.liftPredicate(predicate),
					Option.map(f as MTypes.OneArgFunction<Input, Output1>)
				)
			)
		}) as never;

/**
 * Matches against a primitive value sparing you the need to define a type guard. Returns a copy of
 * `self` if `self` already has an output. Otherwise, `self.input` is compared to the provided value
 * using strict equality. Returns a copy of `self` if the two values are not equal. Otherwise,
 * returns a copy of self with the output set to the result of `f(self.input)`. From a type
 * perspective, the Rest will only be 'refined` if it`s a finite type like an Enum (but not `number`
 * or `string`)
 *
 * @category Utils
 * @example
 * 	import { MMatch } from '@parischap/effect-lib';
 * 	import { pipe, Function } from 'effect';
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
 * 			MMatch.whenIs(TestEnum.A, Function.constant(`a`)),
 * 			MMatch.whenIs(TestEnum.B, Function.constant(`b`)),
 * 			MMatch.whenIs(TestEnum.C, Function.constant(`c`)),
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
			input: self.input,
			output: Option.orElse(self.output, () =>
				pipe(
					self.input,
					Option.liftPredicate((input: Input): input is A => input === value),
					Option.map(f)
				)
			)
		});

/**
 * Same as whenIs but you can pass several values to match against.
 *
 * @category Utils
 * @example
 * 	import { MMatch } from '@parischap/effect-lib';
 * 	import { pipe, Function } from 'effect';
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
 * 			MMatch.whenIs(TestEnum.A, Function.constant(`a`)),
 * 			MMatch.whenIsOr(TestEnum.B, TestEnum.C, Function.constant(`b`)),
 * 			MMatch.exhaustive
 * 		);
 */
export const whenIsOr =
	<
		Input extends MTypes.Primitive,
		Rest extends Input,
		R extends MTypes.ReadonlyOverTwo<Rest>,
		Output1
	>(
		...args: readonly [...values: R, f: (value: R[number]) => Output1]
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<Input, Output | Output1, Exclude<Rest, R[number]>> =>
		_make({
			input: self.input,
			output: Option.orElse(self.output, () =>
				pipe(
					self.input,
					Option.liftPredicate(
						Predicate.some(
							pipe(
								args.slice(0, -1),
								Array.map(
									(value) =>
										(input: Input): input is R[number] =>
											input === value
								)
							)
						)
					),
					Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>)
				)
			)
		});

/**
 * Returns a copy of `self` if `self` already has an output. Otherwise, tries `f` on `self.input`
 * and matches if `f` returns a `some` whose value becomes the output of the matcher. Returns a copy
 * of `self` if `f` returns a `none`. From a type perspective, the `Rest` will not be refined.
 *
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
			input: self.input,
			output: Option.orElse(self.output, () => f(self.input as Rest))
		});

/**
 * Same as when but several predicates can be provided. The match occurs if one of the predicate
 * returns `true`. From a type perspective, the `Rest` will only be refined if all predicates are
 * refinements.
 *
 * @category Utils
 */
export const whenOr =
	<Input, Rest extends Input, R extends MTypes.ReadonlyOverTwo<Predicate.Predicate<Rest>>, Output1>(
		...args: readonly [
			...refinements: R,
			// R can be an array of predicates on a type wider than Rest (eg. when using Predicate.struct with not all properties), so MPredicate.PredicatesToTargets<R>[number] can be larger than Rest
			f: (
				value: NoInfer<MTypes.IntersectAndSimplify<MPredicate.PredicatesToTargets<R>[number], Rest>>
			) => Output1
		]
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<Input, Output | Output1, Exclude<Rest, MPredicate.PredicatesToCoverages<R>[number]>> =>
		_make({
			input: self.input,
			output: Option.orElse(self.output, () =>
				pipe(
					self.input,
					Option.liftPredicate(
						Predicate.some(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>)
					),
					Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>)
				)
			)
		});

/**
 * Same as when but several predicates can be provided. The match occurs if all the predicates
 * return `true`. From a type perspective, the `Rest` will only be refined if all predicates are
 * refinements.
 *
 * @category Utils
 */
export const whenAnd =
	<Input, Rest extends Input, R extends MTypes.ReadonlyOverTwo<Predicate.Predicate<Rest>>, Output1>(
		...args: readonly [
			...refinements: R,
			f: (
				// R can be an array of predicates on a type wider than Rest (eg. when using Predicate.struct with not all properties), so MTypes.ToKeyIntersection<MPredicate.PredicatesToTargets<R>> can be wider than Rest
				value: NoInfer<
					MTypes.IntersectAndSimplify<
						MTypes.ToKeyIntersection<MPredicate.PredicatesToTargets<R>>,
						Rest
					>
				>
			) => Output1
		]
	) =>
	<Output>(
		self: Type<Input, Output, Rest>
	): Type<
		Input,
		Output | Output1,
		Exclude<Rest, MTypes.ToKeyIntersection<MPredicate.PredicatesToCoverages<R>>>
	> =>
		_make({
			input: self.input,
			output: Option.orElse(self.output, () =>
				pipe(
					self.input,
					Option.liftPredicate(
						Predicate.every(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>)
					),
					Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>)
				)
			)
		});

/**
 * Returns `self.output` if `self` already has an output. Otherwise, returns the result of f applied
 * to `self.input`.
 *
 * @category Utils
 */
export const orElse =
	<Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Output1) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.output, () => f(self.input as unknown as Rest));

/**
 * Same as orElse but we pass a predicate (useless from a javascript perspective) to tell the
 * compiler what `Rest` should be. Useful when we know better than Typescript.
 *
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleNonPrimitive = (value: MTypes.NonPrimitive) => value;
 *
 * 	export const testMatcher = (value: MTypes.Unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isNonPrimitive, handleNonPrimitive),
 * 			MMatch.unsafeWhen(MTypes.isPrimitive, handlePrimitive)
 * 		);
 */
export const unsafeWhen =
	<Input, Rest extends Input, Refined extends Rest, Output1>(
		_predicate: Predicate.Refinement<Rest, Refined>,
		f: (value: NoInfer<Refined>) => Output1
	) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.output, () => f(self.input as never));

/**
 * Returns the output of the matcher and shows a type error if `Rest` is not `never`
 *
 * @category Utils
 * @example
 * 	import { MMatch, MTypes } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	const handlePrimitive = (value: MTypes.Primitive) => value;
 * 	const handleNonPrimitive = (value: MTypes.NonPrimitive) => value;
 *
 * 	export const testMatcher = (value: MTypes.Unknown) =>
 * 		pipe(
 * 			value,
 * 			MMatch.make,
 * 			MMatch.when(MTypes.isPrimitive, handlePrimitive),
 * 			MMatch.when(MTypes.isNonPrimitive, handleNonPrimitive),
 * 			MMatch.exhaustive
 * 		);
 */
export const exhaustive = <Input, Output>(self: Type<Input, Output, never>): Output =>
	(self.output as Option.Some<Output>).value;
