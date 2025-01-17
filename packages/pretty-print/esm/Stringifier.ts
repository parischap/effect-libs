/**
 * Type that represents a Stringifier, i.e. a function that takes a value and returns its string
 * representation (see StringifiedValue.ts).
 *
 * @since 0.0.1
 */

import { MTree, MTypes } from '@parischap/effect-lib';
import { Either, flow, Function, pipe } from 'effect';
import * as PPOption from './Option.js';
import * as PPOptionAndPrecalc from './OptionAndPrecalc.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';

/**
 * Type that represents a Stringifier
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> {}

export const make = (option: PPOption.Type): Type => {
	const optionAndPrecalc = PPOptionAndPrecalc.make(option);
	return flow(
		PPValue.makeFromTopValue,
		MTree.unfoldAndFold({
			unfold: (seed, isCyclical) =>
				Either.gen(function* () {
					if (isCyclical)
						return yield* Either.left(
							pipe(
								optionAndPrecalc.precompMarkMap,
								PPStyleMap.get('circularityDetection'),
								Function.apply(undefined),
								Function.apply(seed)
							)
						);
					//const byPassedValue = MOption.fromOptionOrNullable(option.byPasser.action(value, option));
					return 0 as never;
				}),
			foldNonLeaf: 1 as never,
			foldLeaf: 0 as never
		})
	);
};
/**
 * Function that transforms `self` into a Stringified
 *
 * @since 0.0.1
 * @category Utils
 */
/*export const stringify = (option: PPOption.Type): ((self: All) => PPStringifiedValue.Type) =>
		flow(
			MTree.unfoldAndFold(
				{unfold:(seed, isCyclical) =>
					pipe(
						seed,
						setIsCycleStart(isCyclical),
						MTuple.makeBothBy({
							toFirst: Function.identity,
							toSecond: flow(
								Option.liftPredicate(
									MPredicate.struct({
										byPassedValue: Option.isNone,
										depth: Number.lessThan(option.maxDepth),
										isCycleStart: Boolean.not
									})
								),
								Option.map(
									flow(
										MMatch.make,
										MMatch.when(isArray, toOwnAndPrototypesProperties(option)),
										MMatch.when(
											isNonNullObject,
											flow(
												toOwnAndPrototypesProperties(option),
												Array.sort(option.propertySortOrder),
												MFunction.fIfTrue({
													condition: option.dedupeRecordProperties,
													f: Array.dedupeWith((self, that) => self.key === that.key)
												})
											)
										),
										MMatch.orElse(() => Array.empty<All>())
									)
								),
								Option.getOrElse(() => Array.empty<All>())
							)
						})
					),
				(currentValue, stringifiedProps: PPStringifiedValues.Type) =>
					pipe(
						stringifiedProps,
						Array.match({
							onNonEmpty: option.recordFormatter.action(currentValue),
	
							onEmpty: () =>
								pipe(
									currentValue,
									MMatch.make,
									MMatch.tryFunction(Struct.get('byPassedValue')),
									MMatch.when(
										isPrimitive,
										flow(Struct.get('value'), MString.fromPrimitive, PPString.makeWith(), Array.of)
									),
									MMatch.unsafeWhen(
										isNonNullObject,
										flow(
											MMatch.make,
											MMatch.when(
												MPredicate.struct({
													depth: Number.greaterThanOrEqualTo(option.maxDepth)
												}),
												flow(
													MMatch.make,
													MMatch.when(isArray, () => option.arrayLabel),
													MMatch.when(
														MPredicate.struct({
															valueCategory: MFunction.strictEquals(MTypes.Category.Type.Function)
														}),
														() => option.functionLabel
													),
													MMatch.orElse(() => option.objectLabel),
													Array.of
												)
											),
											MMatch.when(Struct.get('isCycleStart'), () => Array.of(option.circularLabel)),
											MMatch.orElse(() => Array.empty<PPString.Type>())
										)
									)
								)
						}),
						option.propertyFormatter.action(currentValue)
					)}
			),
			Struct.get('value')
		);*/
