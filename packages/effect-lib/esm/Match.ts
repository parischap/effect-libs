/**
 * Simple matcher that can only match against predicates and refinements. Fast and simple but sufficient for most use cases. As the matcher is so simple, it needs no compilation which really simplifies its use.
 */

import { Option, Predicate, Types, pipe } from 'effect';
import * as MFunction from './Function.js';
import * as MPredicate from './Predicate.js';
import * as MTypes from './types.js';

/**
 * @category models
 */
class Type<out Input, out Output, Rest extends Input = Input> {
	/**
	 * The value to match
	 */
	readonly value: Input;
	/**
	 * The result of the match when it has been found
	 */
	readonly result: Option.Option<Output>;
	readonly _rest?: Types.Covariant<Rest>;

	constructor({ value, result }: MTypes.Data<Type<Input, Output>>) {
		this.value = value;
		this.result = result;
	}
}
export { type Type };
/**
 * @category constructors
 */
export const make = <Input>(value: Input) => new Type({ value, result: Option.none() });

/**
 * @category combinators
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
	): Type<Input, Output | Output1, Exclude<Rest, MPredicate.Difference<Pred>>> =>
		new Type({
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
 * @category combinators
 */
export const whenIs =
	<Input, Rest extends Input, const A extends Rest, Output1>(value: A, f: (value: A) => Output1) =>
	<Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Exclude<Rest, A>> =>
		new Type({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(self.value, Option.some, Option.filter(MFunction.is(value)), Option.map(f))
			)
		});

/**
 * @category combinators
 */
export const tryFunction =
	<Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Option.Option<Output1>) =>
	<Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Rest> =>
		new Type({
			value: self.value,
			result: Option.orElse(self.result, () => f(self.value as Rest))
		});

/**
 * @category combinators
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
	): Type<Input, Output | Output1, Exclude<Rest, MPredicate.PredicatesToDifferences<R>[number]>> =>
		new Type({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value,
					Option.liftPredicate(
						MPredicate.fromOredPredicates(
							args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>
						)
					),
					Option.map(args[args.length - 1] as (value: Input) => Output1)
				)
			)
		});

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
		Exclude<Rest, MTypes.TupleToIntersection<MPredicate.PredicatesToDifferences<R>>>
	> =>
		new Type({
			value: self.value,
			result: Option.orElse(self.result, () =>
				pipe(
					self.value,
					Option.liftPredicate(
						MPredicate.fromAndedPredicates(
							args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>
						)
					),
					Option.map(args[args.length - 1] as (value: Input) => Output1)
				)
			)
		});

/**
 * @category combinators
 */
export const unsafeWhen =
	<Input, Rest extends Input, Refinement extends MTypes.RefinementFrom<Rest>, Output1>(
		_predicate: Refinement,
		f: (value: NoInfer<MPredicate.Target<Refinement>>) => Output1
	) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.result, () => f(self.value as never));

/**
 * @category combinators
 */
export const orElse =
	<Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Output1) =>
	<Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
		Option.getOrElse(self.result, () => f(self.value as unknown as Rest));

/**
 * @category combinators
 */
/*export const orElseThrow = <Input, Rest extends Input, Output>(
	self: Type<Input, Output, Rest>
): Output =>
	Option.getOrElse(self.result, () => {
		throw new Error('Abnormal error');
	});*/

export const exhaustive = <Input, Output>(self: Type<Input, Output, never>): Output =>
	(self.result as Option.Some<Output>).value;
