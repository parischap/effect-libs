/**
 * Type that represents a Stringifier, i.e. a function that takes a value and returns its string
 * representation (see StringifiedValue.ts).
 */

import { ASText } from '@parischap/ansi-styles';
import { MFunction, MMatch, MOption, MString, MTree, MTuple, MTypes } from '@parischap/effect-lib';
import { Array, Either, flow, Function, Number, Option, pipe } from 'effect';
import * as PPOption from './Option.js';
import * as PPOptionAndPrecalc from './OptionAndPrecalc.js';
import * as PPProperties from './Properties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

/**
 * Type that represents a Stringifier
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> {}

export const make = (option: PPOption.Type): Type => {
	const optionAndPrecalc = PPOptionAndPrecalc.make(option);
	const textShower = PPOptionAndPrecalc.toTextShower(optionAndPrecalc);
	const markShower = PPOptionAndPrecalc.toMarkShower(optionAndPrecalc);
	const contextualPropertyFormatter = option.propertyFormatter(optionAndPrecalc);
	const fromRecord = PPProperties.fromRecord(optionAndPrecalc);
	const circularityDetection = markShower('circularityDetection');
	const stringValue = textShower('stringValue');
	const stringStartDelimiter = markShower('stringStartDelimiter');
	const stringEndDelimiter = markShower('stringEndDelimiter');
	const otherValue = textShower('otherValue');
	const nullValue = markShower('nullValue');
	const undefinedValue = markShower('undefinedValue');
	const bigIntStartDelimiter = markShower('bigIntStartDelimiter');
	const bigIntEndDelimiter = markShower('bigIntEndDelimiter');
	const symbolValue = textShower('symbolValue');
	const arrayBeyondMaxDepth = markShower('arrayBeyondMaxDepth');
	const functionBeyondMaxDepth = markShower('functionBeyondMaxDepth');
	const objectBeyondMaxDepth = markShower('objectBeyondMaxDepth');

	return flow(
		PPValue.makeFromTopValue,
		MTree.unfoldAndFold({
			unfold: (seed, isCyclical) => {
				const propertyFormatter = contextualPropertyFormatter(seed);
				const byPasser = option.byPasser(textShower, markShower);

				const stringifiedValue =
					isCyclical ?
						pipe(seed, circularityDetection, PPStringifiedValue.fromText, Either.left)
					:	pipe(
							seed,
							MMatch.make,
							MMatch.tryFunction(
								flow(byPasser, MOption.fromOptionOrNullable, Option.map(Either.left))
							),
							MMatch.when(
								PPValue.isPrimitive,
								flow(
									PPValue.value<MTypes.Primitive>,
									flow(
										MMatch.make,
										MMatch.when(
											MTypes.isString,
											flow(
												stringValue(seed),
												ASText.prepend(stringStartDelimiter(seed)),
												ASText.append(stringEndDelimiter(seed))
											)
										),
										MMatch.whenOr(
											MTypes.isNumber,
											MTypes.isBoolean,
											flow(MString.fromNonNullablePrimitive, otherValue(seed))
										),
										MMatch.when(MTypes.isNull, pipe(seed, nullValue, Function.constant)),
										MMatch.when(MTypes.isUndefined, pipe(seed, undefinedValue, Function.constant)),
										MMatch.when(
											MTypes.isBigInt,
											flow(
												MString.fromNonNullablePrimitive,
												otherValue(seed),
												ASText.prepend(bigIntStartDelimiter(seed)),
												ASText.append(bigIntEndDelimiter(seed))
											)
										),
										MMatch.when(
											MTypes.isSymbol,
											flow(MString.fromNonNullablePrimitive, symbolValue(seed))
										),
										MMatch.exhaustive
									),
									PPStringifiedValue.fromText,
									Either.left
								)
							),
							MMatch.when(
								flow(PPValue.depth, Number.greaterThanOrEqualTo(option.maxDepth)),
								flow(
									MMatch.make,
									MMatch.when(PPValue.isArray, pipe(seed, arrayBeyondMaxDepth, Function.constant)),
									MMatch.when(
										flow(
											PPValue.valueCategory,
											MFunction.strictEquals(MTypes.Category.Type.Function)
										),
										pipe(seed, functionBeyondMaxDepth, Function.constant)
									),
									MMatch.orElse(pipe(seed, objectBeyondMaxDepth, Function.constant)),
									PPStringifiedValue.fromText,
									Either.left
								)
							),
							MMatch.orElse(
								flow(
									MTuple.makeBothBy({
										toFirst: Function.identity,
										toSecond: flow(
											MMatch.make,
											MMatch.when(PPValue.isArray, fromRecord),
											MMatch.unsafeWhen(
												PPValue.isRecord,
												flow(
													fromRecord,
													Array.sort(option.propertySortOrder),
													MFunction.fIfTrue({
														condition: option.dedupeRecordProperties,
														f: Array.dedupeWith((self, that) => self.key === that.key)
													})
												)
											)
										)
									}),
									Either.right
								)
							)
						);

				return Either.mapLeft(stringifiedValue, propertyFormatter);
			},
			foldNonLeaf: (value, children) => z as never,
			foldLeaf: Function.identity
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
											isRecord,
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
										isRecord,
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
