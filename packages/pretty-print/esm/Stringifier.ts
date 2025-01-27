/**
 * Type that represents a Stringifier, i.e. a function that takes a value and returns its string
 * representation (see StringifiedValue.ts).
 */

import { ASText } from '@parischap/ansi-styles';
import { MFunction, MMatch, MOption, MString, MTree, MTuple, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Either,
	flow,
	Function,
	HashMap,
	MutableHashMap,
	Number,
	Option,
	pipe
} from 'effect';
import * as PPOption from './Option.js';
import * as PPProperties from './Properties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';

/**
 * Namespace of a TextFormatterBuilder
 *
 * @category Models
 */
export namespace TextFormatterBuilder {
	/**
	 * Type of a TextFormatterBuilder
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, PPValueBasedFormatter.Type> {}
}

/**
 * Namespace of a MarkShower
 *
 * @category Models
 */
export namespace MarkShower {
	/**
	 * Type of a MarkShower
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValue.All, ASText.Type> {}

	/**
	 * MarkShower instance that always prints an empty Text
	 *
	 * @category Instances
	 */
	export const empty: Type = (_context) => ASText.empty;
}

/**
 * Namespace of a MarkShowerMap
 *
 * @category Models
 */
export namespace MarkShowerMap {
	/**
	 * Type of a MarkShowerMap
	 *
	 * @category Models
	 */
	export interface Type extends HashMap.HashMap<string, MarkShower.Type> {}
}

/**
 * Namespace of a MarkShowerBuilder
 *
 * @category Models
 */
export namespace MarkShowerBuilder {
	/**
	 * Type of a MarkShowerBuilder
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, MarkShower.Type> {}
}

/**
 * Type that represents a Stringifier
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> {}

export const make = (option: PPOption.Type): Type => {
	const styleMap = option.styleMap;
	const markShowerMap: MarkShowerMap.Type = HashMap.map(
		option.markMap.marks,
		({ text, partName }) =>
			pipe(
				styleMap,
				PPStyleMap.get(partName),
				(contextFormatter) => (value) => contextFormatter(value)(text)
			)
	);

	const markShowerBuilder: MarkShowerBuilder.Type = (markName) =>
		pipe(
			markShowerMap,
			HashMap.get(markName),
			Option.getOrElse(Function.constant(MarkShower.empty))
		);

	const textFormatterBuilder: TextFormatterBuilder.Type = (partName) =>
		pipe(styleMap, PPStyleMap.get(partName));

	const stringValueTextFormatter = textFormatterBuilder('stringValue');
	const otherValueTextFormatter = textFormatterBuilder('otherValue');
	const symbolValueTextFormatter = textFormatterBuilder('symbolValue');
	const messageTextFormatter = textFormatterBuilder('message');

	const stringStartDelimiterMarkShower = markShowerBuilder('stringStartDelimiter');
	const stringEndDelimiterMarkShower = markShowerBuilder('stringEndDelimiter');
	const nullValueMarkShower = markShowerBuilder('nullValue');
	const undefinedValueMarkShower = markShowerBuilder('undefinedValue');
	const bigIntStartDelimiterMarkShower = markShowerBuilder('bigIntStartDelimiter');
	const bigIntEndDelimiterMarkShower = markShowerBuilder('bigIntEndDelimiter');
	const circularityMarkShower = markShowerBuilder('circularObject');
	const circularReferenceStartDelimiterMarkShower = markShowerBuilder(
		'circularReferenceStartDelimiter'
	);
	const circularReferenceEndDelimiterMarkShower = markShowerBuilder(
		'circularReferenceEndDelimiter'
	);
	const arrayBeyondMaxDepthMarkShower = markShowerBuilder('arrayBeyondMaxDepth');
	const functionBeyondMaxDepthMarkShower = markShowerBuilder('functionBeyondMaxDepth');
	const objectBeyondMaxDepthMarkShower = markShowerBuilder('objectBeyondMaxDepth');
	const messageStartDelimiterMarkShower = markShowerBuilder('messageStartDelimiter');
	const messageEndDelimiterMarkShower = markShowerBuilder('messageEndDelimiter');

	const byPasser = option.byPasser(textFormatterBuilder, markShowerBuilder);
	const propertyFormatter = option.propertyFormatter(textFormatterBuilder, markShowerBuilder);
	const recordFormatter = option.recordFormatter(textFormatterBuilder, markShowerBuilder);
	const fromRecord = PPProperties.fromRecord(option);

	let lastCyclicalIndex = 1;
	const cyclicalMap = MutableHashMap.empty<PPValue.NonPrimitiveType, number>();

	return flow(
		PPValue.makeFromTopValue,
		MTree.unfoldAndFold<PPValue.NonPrimitiveType, PPStringifiedValue.Type, PPValue.All>({
			unfold: (seed, cyclicalRef) =>
				pipe(
					seed,
					MMatch.make,
					MMatch.tryFunction(flow(byPasser, MOption.fromOptionOrNullable, Option.map(Either.left))),
					MMatch.when(
						PPValue.isPrimitive,
						flow(
							PPValue.value<MTypes.Primitive>,
							flow(
								MMatch.make,
								MMatch.when(
									MTypes.isString,
									flow(
										stringValueTextFormatter(seed),
										ASText.prepend(stringStartDelimiterMarkShower(seed)),
										ASText.append(stringEndDelimiterMarkShower(seed))
									)
								),
								MMatch.whenOr(
									MTypes.isNumber,
									MTypes.isBoolean,
									flow(MString.fromNonNullablePrimitive, otherValueTextFormatter(seed))
								),
								MMatch.when(MTypes.isNull, pipe(seed, nullValueMarkShower, Function.constant)),
								MMatch.when(
									MTypes.isUndefined,
									pipe(seed, undefinedValueMarkShower, Function.constant)
								),
								MMatch.when(
									MTypes.isBigInt,
									flow(
										MString.fromNonNullablePrimitive,
										otherValueTextFormatter(seed),
										ASText.prepend(bigIntStartDelimiterMarkShower(seed)),
										ASText.append(bigIntEndDelimiterMarkShower(seed))
									)
								),
								MMatch.when(
									MTypes.isSymbol,
									flow(MString.fromNonNullablePrimitive, symbolValueTextFormatter(seed))
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
							MMatch.when(
								PPValue.isArray,
								pipe(seed, arrayBeyondMaxDepthMarkShower, Function.constant)
							),
							MMatch.when(
								flow(PPValue.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function)),
								pipe(seed, functionBeyondMaxDepthMarkShower, Function.constant)
							),
							MMatch.orElse(pipe(seed, objectBeyondMaxDepthMarkShower, Function.constant)),
							ASText.prepend(messageStartDelimiterMarkShower(seed)),
							ASText.append(messageEndDelimiterMarkShower(seed)),
							PPStringifiedValue.fromText,
							Either.left
						)
					),
					MMatch.unsafeWhen(PPValue.isNonPrimitive, (nonPrimitiveValue) =>
						pipe(
							cyclicalRef,
							Option.map((cyclicalValue) =>
								pipe(
									cyclicalMap,
									MutableHashMap.get(cyclicalValue),
									Option.getOrElse(() => {
										/* eslint-disable-next-line functional/no-expression-statements */
										MutableHashMap.set(cyclicalMap, cyclicalValue, lastCyclicalIndex);
										return lastCyclicalIndex++;
									}),
									MString.fromNonNullablePrimitive,
									messageTextFormatter(seed),
									ASText.prepend(circularityMarkShower(seed)),
									ASText.prepend(messageStartDelimiterMarkShower(seed)),
									ASText.append(messageEndDelimiterMarkShower(seed)),
									PPStringifiedValue.fromText,
									Either.left
								)
							),
							Option.getOrElse(
								pipe(
									nonPrimitiveValue,
									MTuple.makeBothBy({
										toFirst: Function.identity,
										toSecond: flow(
											MMatch.make,
											MMatch.when(PPValue.isArray, fromRecord),
											MMatch.orElse(
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
									Either.right,
									Function.constant
								)
							)
						)
					)
				),
			foldNonLeaf: (value, children) =>
				pipe(
					children,
					recordFormatter(value),
					pipe(
						cyclicalMap,
						MutableHashMap.get(value),
						Option.map(
							flow(
								MString.fromNonNullablePrimitive,
								messageTextFormatter(value),
								ASText.prepend(circularReferenceStartDelimiterMarkShower(value)),
								ASText.append(circularReferenceEndDelimiterMarkShower(value)),
								PPStringifiedValue.prependToFirstLine
							)
						),
						Option.getOrElse(Function.constant(Function.identity))
					),
					propertyFormatter(value)
				),
			foldLeaf: Function.identity
		})
	);
};
