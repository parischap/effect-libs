/**
 * Compilation-free pattern matcher that branches on predicates and refinements.
 *
 * ## Mental model
 *
 * - **`Type<Input, Output, Rest>`** is a matcher in progress.
 *   - `Input` is the original value being matched.
 *   - `Output` is the union of result types contributed so far.
 *   - `Rest` is the part of `Input` that no previous refinement has eliminated.
 * - Each `when`/`whenIs`/`whenOr`/`whenAnd`/`tryFunction` short-circuits on success: as soon as a
 *   case produces an output, every subsequent case is skipped.
 * - Terminate with {@link exhaustive} (compile-time check that `Rest` is `never`) or
 *   {@link orElse} (runtime fallback).
 *
 * ## Common tasks
 *
 * - **Create**: {@link make}
 * - **Add cases**: {@link when}, {@link whenIs}, {@link whenIsOr}, {@link tryFunction}
 * - **Combine cases**: {@link whenOr}, {@link whenAnd}
 * - **Terminate**: {@link exhaustive}, {@link orElse}, {@link unsafeWhen}
 *
 * ## Quickstart
 *
 * **Example** (Sign of a number)
 *
 * ```ts
 * import { Number, pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * const sign = (n: number) =>
 *   pipe(
 *     n,
 *     MMatch.make,
 *     MMatch.when(Number.isLessThan(0), () => 'negative'),
 *     MMatch.when(Number.isGreaterThan(0), () => 'positive'),
 *     MMatch.orElse(() => 'zero'),
 *   );
 *
 * console.log(sign(5)); // 'positive'
 * console.log(sign(0)); // 'zero'
 * ```
 */

import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';

import type * as MPredicate from './Predicate.js';
import type * as MTypes from './types/types.js';

import * as MData from './Data/Data.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Match/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a matcher
 *
 * @category Models
 */
export class Type<out Input, out Output, out Rest extends Input> extends MData.Class {
  /** The input to match */
  readonly input: Input;
  /** The output of the matcher when it has been found */
  readonly output: Option.Option<Output>;

  /** Class constructor */
  private constructor({ input, output }: MTypes.Data<Type<Input, Output, Rest>>) {
    super();
    this.input = input;
    this.output = output;
  }

  /** Static constructor */
  static make<Input, Output, Rest extends Input>(
    params: MTypes.Data<Type<Input, Output, Rest>>,
  ): Type<Input, Output, Rest> {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Builds a new matcher.
 *
 * - Use to start building a matcher for a value.
 * - The returned matcher has no cases yet.
 * - Chain with `when`, `whenIs`, etc. to add cases.
 *
 * **Example** (Create matcher)
 *
 * ```ts
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * const m = MMatch.make(5);
 * console.log(m.input); // 5
 * ```
 *
 * @category Constructors
 */
export const make = <Input>(input: Input): Type<Input, never, Input> =>
  Type.make({ input, output: Option.none() });

/**
 * Matches against a refinement or a predicate. Returns a copy of `self` if `self` already has an
 * output. Otherwise, applies the predicate/refinement to `self.input`. Returns a copy of `self` if
 * the predicate returns `false`. Otherwise, returns a copy of `self` with the output set to
 * `f(self.input)`.
 *
 * - Use to add a case to the matcher.
 * - If a previous case matched, this case is skipped.
 * - Use with refinements for type narrowing.
 * - Use with predicates for boolean checks.
 *
 * **Example** (Add matching case)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 * import * as Number from 'effect/Number';
 *
 * const result = pipe(
 *   5,
 *   MMatch.make,
 *   MMatch.when(Number.isLessThan(0), () => 'negative'),
 *   MMatch.when(Number.isGreaterThan(0), () => 'positive'),
 *   MMatch.orElse(() => 'zero'),
 * );
 * console.log(result); // "positive"
 * ```
 *
 * @category Utils
 */

export const when: {
  <Input, Rest extends Input, Refined extends Rest, Output1>(
    predicate: Predicate.Refinement<NoInfer<Rest>, Refined>,
    f: (value: Refined) => Output1,
  ): <Output>(
    self: Type<Input, Output, Rest>,
  ) => Type<Input, Output | Output1, Exclude<Rest, Refined>>;
  <Input, Rest extends Input, Output1>(
    predicate: Predicate.Predicate<NoInfer<Rest>>,
    f: (value: Rest) => Output1,
  ): <Output>(self: Type<Input, Output, Rest>) => Type<Input, Output | Output1, Rest>;
} =
  <Input, Rest extends Input, Output1>(
    predicate: Predicate.Predicate<Rest>,
    f: (value: Rest) => Output1,
  ) =>
  <Output>(self: Type<Input, Output, Rest>) =>
    Type.make({
      input: self.input,
      output: Option.orElse(self.output, () =>
        pipe(
          self.input as Rest,
          Option.liftPredicate(predicate),
          Option.map(f as MTypes.OneArgFunction<Input, Output1>),
        ),
      ),
    }) as never;

/**
 * Matches against a primitive value using strict equality. Returns a copy of `self` if `self`
 * already has an output. Otherwise, `self.input` is compared to the provided value using strict
 * equality. Returns a copy of `self` if the two values are not equal. Otherwise, returns a copy of
 * `self` with the output set to the result of `f(self.input)`.
 *
 * - Use when matching against specific literal values.
 * - Comparison uses strict equality (`===`).
 * - Useful for enum matching or constant comparisons.
 *
 * **Example** (Match against value)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * enum Status {
 *   A = 'a',
 *   B = 'b',
 * }
 * const describe = (s: Status) =>
 *   pipe(
 *     s,
 *     MMatch.make,
 *     MMatch.whenIs(Status.A, () => 'A status'),
 *     MMatch.orElse(() => 'other'),
 *   );
 * console.log(describe(Status.A)); // "A status"
 * ```
 *
 * @category Utils
 */
export const whenIs =
  <Input extends MTypes.Primitive, Rest extends Input, const A extends Rest, Output1>(
    value: A,
    f: (value: A) => Output1,
  ) =>
  <Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Exclude<Rest, A>> =>
    Type.make({
      input: self.input,
      output: Option.orElse(self.output, () =>
        pipe(
          self.input,
          Option.liftPredicate((input: Input): input is A => input === value),
          Option.map(f),
        ),
      ),
    });

/**
 * Matches against multiple primitive values using strict equality. Returns a copy of `self` if
 * `self` already has an output. Otherwise, `self.input` is compared to each provided value using
 * strict equality. Returns a copy of `self` if no values match. Otherwise, returns a copy of `self`
 * with the output set to the result of `f(self.input)`.
 *
 * - Use when matching against multiple literal values with the same handler.
 * - All values are compared using strict equality (`===`).
 * - Efficient alternative to chaining multiple `whenIs` calls.
 *
 * **Example** (Match against multiple values)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * enum Status {
 *   A = 'a',
 *   B = 'b',
 *   C = 'c',
 * }
 * const describe = (s: Status) =>
 *   pipe(
 *     s,
 *     MMatch.make,
 *     MMatch.whenIs(Status.A, () => 'A'),
 *     MMatch.whenIsOr(Status.B, Status.C, () => 'B or C'),
 *     MMatch.exhaustive,
 *   );
 * console.log(describe(Status.B)); // "B or C"
 * ```
 *
 * @category Utils
 */
export const whenIsOr =
  <
    Input extends MTypes.Primitive,
    Rest extends Input,
    R extends MTypes.ReadonlyOverTwo<Rest>,
    Output1,
  >(
    ...args: readonly [...values: R, f: (value: R[number]) => Output1]
  ) =>
  <Output>(
    self: Type<Input, Output, Rest>,
  ): Type<Input, Output | Output1, Exclude<Rest, R[number]>> =>
    Type.make({
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
                      input === value,
                ),
              ),
            ),
          ),
          Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>),
        ),
      ),
    });

/**
 * Tries applying a function that returns an Option. Matches if the function returns a `some`.
 * Returns a copy of `self` if `self` already has an output. Otherwise, applies `f` to `self.input`.
 * If `f` returns `some`, sets the output. If `f` returns `none`, tries the next case.
 *
 * - Use when matching using optional computations.
 * - Useful for extracting values from containers like arrays.
 * - The match succeeds only when `f` returns `Option.some`.
 *
 * **Example** (Match with optional function)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import { Array } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * const result = pipe(
 *   [1, 2, 3],
 *   MMatch.make,
 *   MMatch.tryFunction(Array.get(1)),
 *   MMatch.orElse(() => 0),
 * );
 * console.log(result); // 2
 * ```
 *
 * @category Utils
 */
export const tryFunction =
  <Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Option.Option<Output1>) =>
  <Output>(self: Type<Input, Output, Rest>): Type<Input, Output | Output1, Rest> =>
    Type.make({
      input: self.input,
      output: Option.orElse(self.output, () => f(self.input as Rest)),
    });

/**
 * Matches using multiple predicates. The match occurs if one of the predicates returns `true`.
 * Returns a copy of `self` if `self` already has an output. Otherwise, applies all predicates to
 * `self.input` and returns a copy with the output set to `f(self.input)` if any predicate matches.
 *
 * - Use when multiple unrelated conditions trigger the same handler.
 * - Efficient alternative to chaining multiple `when` calls with OR logic.
 * - All predicates are evaluated (non-short-circuit).
 *
 * **Example** (Match with multiple predicates)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 * import * as Number from 'effect/Number';
 *
 * const result = pipe(
 *   5,
 *   MMatch.make,
 *   MMatch.whenOr(
 *     Number.isLessThan(0),
 *     Number.isGreaterThan(10),
 *     () => 'out of range',
 *   ),
 *   MMatch.orElse(() => 'in range'),
 * );
 * console.log(result); // "in range"
 * ```
 *
 * @category Utils
 */
export const whenOr =
  <Input, Rest extends Input, R extends MTypes.ReadonlyOverTwo<Predicate.Predicate<Rest>>, Output1>(
    ...args: readonly [
      ...refinements: R,
      // R can be an array of predicates on a type wider than Rest (eg. when using Predicate.struct with not all properties), so MPredicate.PredicatesToTargets<R>[number] can be larger than Rest
      f: (
        value: NoInfer<
          MTypes.IntersectAndSimplify<MPredicate.PredicatesToTargets<R>[number], Rest>
        >,
      ) => Output1,
    ]
  ) =>
  <Output>(
    self: Type<Input, Output, Rest>,
  ): Type<Input, Output | Output1, Exclude<Rest, MPredicate.PredicatesToCoverages<R>[number]>> =>
    Type.make({
      input: self.input,
      output: Option.orElse(self.output, () =>
        pipe(
          self.input,
          Option.liftPredicate(
            Predicate.some(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>),
          ),
          Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>),
        ),
      ),
    });

/**
 * Matches using multiple predicates where all must be satisfied. The match occurs if all predicates
 * return `true`. Returns a copy of `self` if `self` already has an output. Otherwise, applies all
 * predicates to `self.input` and returns a copy with the output set to `f(self.input)` if all
 * match.
 *
 * - Use when multiple conditions must all be true to trigger the same handler.
 * - Efficient alternative to chaining multiple `when` calls with AND logic.
 * - All predicates are evaluated.
 *
 * **Example** (Match with all predicates required)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 * import * as Number from 'effect/Number';
 *
 * const result = pipe(
 *   5,
 *   MMatch.make,
 *   MMatch.whenAnd(
 *     Number.isGreaterThan(0),
 *     Number.isLessThan(10),
 *     () => 'in range',
 *   ),
 *   MMatch.orElse(() => 'out of range'),
 * );
 * console.log(result); // "in range"
 * ```
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
        >,
      ) => Output1,
    ]
  ) =>
  <Output>(
    self: Type<Input, Output, Rest>,
  ): Type<
    Input,
    Output | Output1,
    Exclude<Rest, MTypes.ToKeyIntersection<MPredicate.PredicatesToCoverages<R>>>
  > =>
    Type.make({
      input: self.input,
      output: Option.orElse(self.output, () =>
        pipe(
          self.input,
          Option.liftPredicate(
            Predicate.every(args.slice(0, -1) as ReadonlyArray<Predicate.Predicate<Input>>),
          ),
          Option.map(args[args.length - 1] as MTypes.OneArgFunction<Input, Output1>),
        ),
      ),
    });

/**
 * Provides a default value if no match has occurred. Returns the output if there is one, otherwise
 * returns `f(self.input)`.
 *
 * - Use to handle the case where no previous predicates matched.
 * - Receives the original input value.
 * - Guaranteed to produce a result (exhaustive).
 *
 * **Example** (Provide default value)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 * import * as Number from 'effect/Number';
 *
 * const result = pipe(
 *   5,
 *   MMatch.make,
 *   MMatch.when(Number.isLessThan(0), () => 'negative'),
 *   MMatch.orElse(() => 'non-negative'),
 * );
 * console.log(result); // "non-negative"
 * ```
 *
 * @category Utils
 */
export const orElse =
  <Input, Rest extends Input, Output1>(f: (value: NoInfer<Rest>) => Output1) =>
  <Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
    Option.getOrElse(self.output, () => f(self.input as unknown as Rest));

/**
 * Terminates the matcher with `f` applied to the input, **without evaluating the runtime
 * predicate**. The supplied `refinement` is only used at the type level to narrow the input handed
 * to `f`.
 *
 * - Use to remove a final type-level case the matcher can't otherwise prove (e.g. the last branch
 *   of a discriminated union after every other variant has been matched).
 * - When a previous case already produced an output, that output is returned and `f` is not
 *   called.
 * - Unsafe: if the runtime value does not actually satisfy `refinement`, `f` is still invoked,
 *   silently producing a value typed as if narrowing succeeded.
 *
 * **Example** (Closing a discriminated union)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 *
 * type Shape =
 *   | { readonly _tag: 'Circle'; readonly r: number }
 *   | { readonly _tag: 'Square'; readonly s: number };
 *
 * const area = (shape: Shape) =>
 *   pipe(
 *     shape,
 *     MMatch.make,
 *     MMatch.when(
 *       (s): s is Extract<Shape, { readonly _tag: 'Circle' }> => s._tag === 'Circle',
 *       (c) => Math.PI * c.r * c.r,
 *     ),
 *     MMatch.unsafeWhen(
 *       (s): s is Extract<Shape, { readonly _tag: 'Square' }> => s._tag === 'Square',
 *       (s) => s.s * s.s,
 *     ),
 *   );
 *
 * console.log(area({ _tag: 'Circle', r: 1 })); // 3.141592653589793
 * console.log(area({ _tag: 'Square', s: 2 })); // 4
 * ```
 *
 * @see {@link exhaustive} — safe terminator when `Rest` is statically `never`
 *
 * @category Utils
 */
export const unsafeWhen =
  <Input, Rest extends Input, Refined extends Rest, Output1>(
    _predicate: Predicate.Refinement<Rest, Refined>,
    f: (value: NoInfer<Refined>) => Output1,
  ) =>
  <Output>(self: Type<Input, Output, Rest>): Output | Output1 =>
    Option.getOrElse(self.output, () => f(self.input as never));

/**
 * Returns the output of the matcher if all cases are covered. Shows a type error if `Rest` is not
 * `never`, meaning there are still uncovered input cases.
 *
 * - Use only when you have covered all possible input cases.
 * - Throws if no case matched.
 * - TypeScript ensures exhaustiveness through the `Rest` type parameter.
 * - Prefer `orElse` for non-exhaustive patterns.
 *
 * **Example** (Exhaustive match)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MMatch from '@parischap/effect-lib/MMatch';
 * import * as Number from 'effect/Number';
 *
 * enum Status {
 *   Active = 'a',
 *   Inactive = 'i',
 * }
 * const describe = (s: Status) =>
 *   pipe(
 *     s,
 *     MMatch.make,
 *     MMatch.whenIs(Status.Active, () => 'Active'),
 *     MMatch.whenIs(Status.Inactive, () => 'Inactive'),
 *     MMatch.exhaustive,
 *   );
 * console.log(describe(Status.Active)); // "Active"
 * ```
 *
 * @category Utils
 */
export const exhaustive = <Input, Output>(self: Type<Input, Output, never>): Output =>
  (self.output as Option.Some<Output>).value;
