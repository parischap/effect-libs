/**
 * This module implements a type alias and utility functions for arrays of `PPValue`'s (see
 * `Value.ts`). It provides the two main constructors used during traversal — one that extracts own
 * and inherited properties from a non-primitive value, and one that extracts elements from an
 * iterable — plus sorting helpers.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import type * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as Tuple from 'effect/Tuple';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as MArray from '@parischap/effect-lib/MArray';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTuple from '@parischap/effect-lib/MTuple';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as PPStringifiedValue from '../../stringification/StringifiedValue.js';
import * as PPValue from './Value.js';

/**
 * Type of a Values
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPValue.Any> {}

/**
 * Returns an array of `PPValue`'s for every direct and inherited property of `nonPrimitive`. Own
 * properties come first, followed by properties of the direct prototype, then the prototype of the
 * prototype, and so on. Traversal stops when a prototype is not a non-primitive value (typically
 * `null`) or when `maxPrototypeDepth` is reached. A `maxPrototypeDepth` of `0` returns no
 * properties; `1` returns only own properties; `2` returns own properties plus those of the direct
 * prototype; etc.
 *
 * @category Constructors
 */
export const fromNonPrimitiveKeysAndValues = ({
  nonPrimitive,
  maxPrototypeDepth,
}: {
  readonly nonPrimitive: PPValue.NonPrimitive;
  readonly maxPrototypeDepth: number;
}): Type => {
  const depth = nonPrimitive.depth + 1;
  const { content } = nonPrimitive;
  interface Seed {
    readonly protoDepth: number;
    readonly content: MTypes.Unknown;
  }
  return pipe(
    { protoDepth: 0, content },
    MArray.unfold<Seed, Type>(
      flow(
        Option.liftPredicate(
          MPredicate.struct({
            protoDepth: Number.isLessThan(maxPrototypeDepth),
            content: MTypes.isNonPrimitive,
          }),
        ),
        Option.map(
          flow(
            MTuple.replicate(2),
            Tuple.evolve(
              Tuple.make(
                ({ protoDepth, content }) => {
                  // Record.map will not return all keys
                  const ownKeys = Reflect.ownKeys(content);
                  const isFunctionProto = content === MFunction.proto;

                  return Array.filterMap(ownKeys, (key) =>
                    // The arguments and caller properties of the function prototype are deprecated, reading them causes an error
                    isFunctionProto && (key === 'arguments' || key === 'caller')
                      ? Result.failVoid
                      : Result.succeed(
                          PPValue.fromNonPrimitiveValueAndKey({
                            nonPrimitive: content,
                            key,
                            depth,
                            protoDepth,
                          }),
                        ),
                  );
                },
                // While partial type argument inference is not available, flow does not work here
                (s) =>
                  pipe(
                    s,
                    MStruct.evolve({
                      protoDepth: Number.increment,
                      content: Reflect.getPrototypeOf,
                    }),
                  ),
              ),
            ),
          ),
        ),
      ),
    ),
    Array.flatten,
    // Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
    Array.filter(
      MPredicate.struct({
        oneLineStringKey: Predicate.not(MPredicate.strictEquals('__proto__')),
      }),
    ),
  );
};

/**
 * Returns an empty array if `nonPrimitive` is not iterable. Otherwise, returns a `PPValue` for each
 * element yielded by its iterator. If the element is a two-element tuple `[key, value]`, `key`
 * becomes the string key (using `stringifier` when it is not already a string) and `value` becomes
 * the content (this is the Map case). Otherwise the element becomes the content and the key is the
 * auto-generated string index of that element in the sequence.
 *
 * @category Constructors
 */
export const fromNonPrimitiveIterable = ({
  nonPrimitive,
  stringifier,
}: {
  readonly nonPrimitive: PPValue.NonPrimitive;
  readonly stringifier: MTypes.OneArgFunction<unknown, PPStringifiedValue.Type>;
}): Type => {
  const depth = nonPrimitive.depth + 1;

  return pipe(
    nonPrimitive.content,
    Option.liftPredicate(MTypes.isIterable),
    Option.map(
      flow(
        Array.fromIterable,
        Array.map((containedValue, index) =>
          pipe(
            containedValue,
            Result.liftPredicate(
              (u): u is [unknown, unknown] => MTypes.isArray(u) && MTypes.isPair(u),
              Function.identity,
            ),
            Result.mapBoth({
              onSuccess: flow(
                Tuple.evolve(
                  Tuple.make(
                    flow(
                      Result.liftPredicate(MTypes.isString, stringifier),
                      Result.map(flow(ASText.fromString, PPStringifiedValue.fromText)),
                      Result.merge,
                      PPStringifiedValue.toUnstyledStrings,
                    ),
                  ),
                ),
                Tuple.appendElement(false),
              ),
              onFailure: flow(
                Tuple.make,
                MTuple.prependElement(pipe(index, MString.fromNumber(10), Array.of)),
                Tuple.appendElement(true),
              ),
            }),
            Result.merge,
            ([stringKey, content, hasGeneratedKey]) =>
              PPValue.fromNonPrimitiveIterable({
                content,
                stringKey,
                hasGeneratedKey,
                depth,
              }),
          ),
        ),
      ),
    ),
    Option.getOrElse(() => Array.empty<PPValue.Any>()),
  );
};

/**
 * Returns a function that sorts a `PPValues` by `order` when `order` is a `some`, or the identity
 * function when `order` is `none`
 *
 * @category Utils
 */
export const sort = (order: Option.Option<Order.Order<PPValue.Any>>): MTypes.OneArgFunction<Type> =>
  pipe(
    order,
    Option.map((order) => Array.sort(order)),
    Option.getOrElse(() => Function.identity),
  );
