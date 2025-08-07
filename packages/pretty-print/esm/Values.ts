/** Type that is an alias for an array of Value's (see Value.ts). */

import { ASText } from '@parischap/ansi-styles';
import {
	MArray,
	MFunction,
	MPredicate,
	MString,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import { Array, Either, flow, Number, Option, pipe, Predicate } from 'effect';
import type * as PPOption from './Option.js';
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
					toFirst: ({ protoDepth, nonPrimitiveContent }) => {
						// Record.map will not return all keys
						const ownKeys = Reflect.ownKeys(nonPrimitiveContent);
						const isFunctionProto = nonPrimitiveContent === MFunction.proto;

						return Array.filterMap(ownKeys, (key) =>
							// The arguments and caller properties of the function prototype are deprecated, reading them causes an error
							isFunctionProto && (key === 'arguments' || key === 'caller') ?
								Option.none()
							:	Option.some(
									PPValue.fromNonPrimitiveValueAndKey({
										nonPrimitiveContent,
										key,
										depth,
										protoDepth
									})
								)
						);
					},
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
				MPredicate.struct({ oneLineStringKey: Predicate.not(MPredicate.strictEquals('__proto__')) })
			)
		);
	};

/**
 * Builds a Values from an iterable non-primitive value returning a value iterator
 *
 * @category Constructors
 */
export const fromValueIterable = (nonPrimitive: PPValue.NonPrimitive): Type =>
	pipe(
		nonPrimitive.content,
		Option.liftPredicate(MTypes.isIterable),
		Option.map(
			flow(
				Array.fromIterable,
				Array.map((content, i) =>
					PPValue.fromIterable({
						content,
						stringKey: pipe(i, MString.fromNumber(10), Array.of),
						depth: nonPrimitive.depth + 1
					})
				)
			)
		),
		Option.getOrElse(() => Array.empty())
	);
/**
 * Builds a Values from an iterable non-primitive value returning a key/value iterator
 *
 * @category Constructors
 */
export const fromKeyValueIterable =
	(stringifier: PPOption.Stringifier.Type) =>
	(nonPrimitive: PPValue.NonPrimitive): Type =>
		pipe(
			nonPrimitive.content,
			Option.liftPredicate(MTypes.isIterable),
			Option.map(
				flow(
					Array.fromIterable,
					Array.filterMap((nextProp) =>
						pipe(
							nextProp,
							Option.liftPredicate(MTypes.isArray),
							Option.filter(MTypes.isPair),
							Option.map(([key, content]) =>
								PPValue.fromIterable({
									content,
									stringKey: pipe(
										key,
										Either.liftPredicate(MTypes.isString, stringifier),
										Either.map(flow(ASText.fromString, PPStringifiedValue.fromText)),
										Either.merge,
										PPStringifiedValue.toUnstyledStrings
									),
									depth: nonPrimitive.depth + 1
								})
							)
						)
					)
				)
			),
			Option.getOrElse(() => Array.empty())
		);
