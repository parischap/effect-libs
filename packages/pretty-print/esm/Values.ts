/** Type that is an alias for an array of Value's (see Value.ts). */

import { MArray, MFunction, MPredicate, MStruct, MTuple, MTypes } from '@parischap/effect-lib';
import { Array, Either, flow, Function, Number, Option, pipe, Predicate, Tuple } from 'effect';
import * as PPOption from './Option.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

/**
 * Type of a Values
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPValue.All> {}

/**
 * Builds a Values from the keys of a non-primitive value and its prototypes
 *
 * @category Constructors
 */
export const fromProperties =
	(maxPrototypeDepth: number) =>
	(nonPrimitive: PPValue.NonPrimitive): Type => {
		const depth = nonPrimitive.depth + 1;
		const nonPrimitiveContent = nonPrimitive.content;

		return pipe(
			{ protoDepth: 0, nonPrimitiveContent },
			MArray.unfoldNonEmpty(
				MTuple.makeBothBy({
					toFirst: ({ protoDepth, nonPrimitiveContent }) =>
						pipe(
							nonPrimitiveContent,
							// Record.map will not return all keys
							Reflect.ownKeys,
							Array.map((key) =>
								PPValue.fromNonPrimitiveValueAndKey({
									nonPrimitiveContent,
									key,
									depth,
									protoDepth
								})
							)
						),
					toSecond: flow(
						MStruct.evolve({
							protoDepth: Number.increment,
							nonPrimitiveContent: Reflect.getPrototypeOf
						}),
						Option.liftPredicate(
							MPredicate.struct({
								protoDepth: Number.lessThanOrEqualTo(maxPrototypeDepth),
								nonPrimitiveContent: MTypes.isNonPrimitive
							})
						)
					)
				})
			),
			Array.flatten,
			// Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
			Array.filter(
				MPredicate.struct({ stringKey: Predicate.not(MFunction.strictEquals('__proto__')) })
			)
		);
	};

/**
 * Builds a Values from an iterable non-primitive value
 *
 * @category Constructors
 */
export const fromIterable =
	(stringifier: PPOption.Stringifier.Type) =>
	(nonPrimitive: PPValue.NonPrimitive): Type => {
		const depth = nonPrimitive.depth + 1;
		const nonPrimitiveContent = nonPrimitive.content;

		return pipe(
			nonPrimitiveContent,
			Option.liftPredicate(MTypes.isIterable),
			Option.map(
				flow(
					Array.fromIterable,
					Array.filterMap((nextProp, i) =>
						pipe(
							nextProp,
							Either.liftPredicate(MTypes.isArray, Function.identity),
							Either.mapBoth({
								onLeft: pipe(Tuple.make(i, nextProp), Option.some, Function.constant),
								onRight: Option.liftPredicate(MTypes.isPair)
							}),
							Either.merge
						)
					),
					Array.map(([key, content]) =>
						PPValue.fromIterable({
							content,
							stringKey: pipe(key, stringifier, PPStringifiedValue.toUnstyledStrings),
							depth
						})
					)
				)
			),
			Option.getOrElse(Function.constant(Array.empty()))
		);
	};
