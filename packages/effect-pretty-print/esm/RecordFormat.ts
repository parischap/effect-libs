import { MArray, MFunction, MMatch, MString, MTypes } from '@parischap/effect-lib';
import { Array, Data, Function, Option, String, flow, pipe } from 'effect';
import * as FormattedString from './FormattedString.js';
import * as ValueWrapper from './ValueWrapper.js';
import * as utilities from './utilities.js';

const $ = FormattedString.makeWith;

interface untaggedArrayLikeRecordFormat {
	readonly arrayStartDelimiter: string;
	readonly arrayEndDelimiter: string;
	readonly arraySeparator: string;
}

interface untaggedObjectLikeRecordFormat {
	readonly objectStartDelimiter: string;
	readonly objectEndDelimiter: string;
	readonly objectSeparator: string;
	readonly propertySeparator: string;
	readonly prototypePrefix: string;
	readonly prototypeSuffix: string;
}

export type All = Data.TaggedEnum<{
	readonly ArrayLike: untaggedArrayLikeRecordFormat;
	readonly ObjectLike: untaggedObjectLikeRecordFormat;
	readonly Auto: untaggedArrayLikeRecordFormat & untaggedObjectLikeRecordFormat;
}>;

const { $is, ArrayLike, ObjectLike, Auto } = Data.taggedEnum<All>();
export { ArrayLike, Auto, ObjectLike };
export const isArrayLikeRecordFormat = $is('ArrayLike');
export const isObjectLikeRecordFormat = $is('ObjectLike');
export const isAutoRecordFormat = $is('Auto');

export type ArrayLike = ReturnType<typeof ArrayLike>;
export type ObjectLike = ReturnType<typeof ObjectLike>;
export type Auto = ReturnType<typeof Auto>;

const formatConstituentsArrayLike =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<ArrayLike | Auto, ValueWrapper.RecordModifier> =>
	(self) =>
		flow(
			ValueWrapper.forInitConstituents(
				ValueWrapper.mapValueLines(
					MArray.modifyLast(
						FormattedString.append($(colorSet.recordSeparatorColorer)(self.arraySeparator))
					)
				)
			)
		);

const formatConstituentsObjectLike =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<ObjectLike | Auto, ValueWrapper.RecordModifier> =>
	(self) =>
	(recordWrapper) =>
		pipe(
			recordWrapper,
			ValueWrapper.forInitConstituents(
				ValueWrapper.mapValueLines(
					MArray.modifyLast(
						FormattedString.append($(colorSet.recordSeparatorColorer)(self.objectSeparator))
					)
				)
			),
			ValueWrapper.forEachConstituent(
				ValueWrapper.setValueLinesWith((wrapper) =>
					pipe(
						wrapper.valueLines,
						Array.match({
							onEmpty: () => Array.of(FormattedString.empty),
							onNonEmpty: Function.identity
						}),
						Array.modifyNonEmptyHead(
							flow(
								MMatch.make,
								MMatch.when(FormattedString.isEmpty, Function.identity),
								MMatch.orElse(
									FormattedString.prepend(
										$(colorSet.objectPropertySeparatorColorer)(self.propertySeparator)
									)
								),
								FormattedString.prepend(
									pipe(
										$(colorSet.prototypeMarkColorer)(self.prototypeSuffix),
										FormattedString.repeat(wrapper.protoDepth - recordWrapper.protoDepth)
									)
								),
								FormattedString.prepend(
									pipe(
										wrapper.key,
										MString.fromNonNullPrimitive,
										FormattedString.makeWith(
											wrapper.hasFunctionValue ? colorSet.functionPropertyKeyColorer
											: wrapper.hasSymbolicKey ? colorSet.symbolPropertyKeyColorer
											: colorSet.otherPropertyKeyColorer
										)
									)
								),
								FormattedString.prepend(
									pipe(
										$(colorSet.prototypeMarkColorer)(self.prototypePrefix),
										FormattedString.repeat(wrapper.protoDepth - recordWrapper.protoDepth)
									)
								)
							)
						)
					)
				)
			)
		);

export const formatConstituents = (
	colorSet: utilities.ColorSet
): MTypes.OneArgFunction<All, ValueWrapper.RecordModifier> =>
	flow(
		MMatch.make,
		MMatch.when(isArrayLikeRecordFormat, formatConstituentsArrayLike(colorSet)),
		MMatch.when(isObjectLikeRecordFormat, formatConstituentsObjectLike(colorSet)),
		MMatch.when(isAutoRecordFormat, (autoRecordFormat) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(ValueWrapper.isArray, formatConstituentsArrayLike(colorSet)(autoRecordFormat)),
				MMatch.when(
					ValueWrapper.isFunction,
					formatConstituentsObjectLike(colorSet)(autoRecordFormat)
				),
				MMatch.orElse(formatConstituentsObjectLike(colorSet)(autoRecordFormat))
			)
		),
		MMatch.exhaustive
	);

const addDelimitersToValueLinesArrayLike =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<ArrayLike | Auto, ValueWrapper.RecordModifier> =>
	(self) =>
	(recordWrapper) => {
		const colorer: utilities.Colorer = utilities.colorFromColorWheel(
			colorSet.recordDelimitersColorerWheel,
			recordWrapper.depth
		);

		return pipe(
			recordWrapper,
			ValueWrapper.mapValueLines(
				flow(
					Array.prepend(
						pipe(
							self.arrayStartDelimiter,
							Option.liftPredicate(String.isNonEmpty),
							Option.map(FormattedString.makeWith(colorer)),
							Option.getOrElse(() => FormattedString.empty)
						)
					),
					MFunction.fIfTrue({
						condition: String.isNonEmpty(self.arrayEndDelimiter),
						f: Array.append(FormattedString.makeWith(colorer)(self.arrayEndDelimiter))
					})
				)
			)
		);
	};

const addDelimitersToValueLinesObjectLike =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<ObjectLike | Auto, ValueWrapper.RecordModifier> =>
	(self) =>
	(recordWrapper) => {
		const colorer: utilities.Colorer = utilities.colorFromColorWheel(
			colorSet.recordDelimitersColorerWheel,
			recordWrapper.depth
		);

		return pipe(
			recordWrapper,
			ValueWrapper.mapValueLines(
				flow(
					Array.prepend(
						pipe(
							self.objectStartDelimiter,
							Option.liftPredicate(String.isNonEmpty),
							Option.map(FormattedString.makeWith(colorer)),
							Option.getOrElse(() => FormattedString.empty)
						)
					),
					MFunction.fIfTrue({
						condition: String.isNonEmpty(self.objectEndDelimiter),
						f: Array.append(FormattedString.makeWith(colorer)(self.objectEndDelimiter))
					})
				)
			)
		);
	};

export const addDelimitersToValueLines = (
	colorSet: utilities.ColorSet
): MTypes.OneArgFunction<All, ValueWrapper.RecordModifier> =>
	flow(
		MMatch.make,
		MMatch.when(isArrayLikeRecordFormat, addDelimitersToValueLinesArrayLike(colorSet)),
		MMatch.when(isObjectLikeRecordFormat, addDelimitersToValueLinesObjectLike(colorSet)),
		MMatch.when(isAutoRecordFormat, (autoRecordFormat) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(
					ValueWrapper.isArray,
					addDelimitersToValueLinesArrayLike(colorSet)(autoRecordFormat)
				),
				MMatch.when(
					ValueWrapper.isFunction,
					addDelimitersToValueLinesObjectLike(colorSet)(autoRecordFormat)
				),
				MMatch.orElse(addDelimitersToValueLinesObjectLike(colorSet)(autoRecordFormat))
			)
		),
		MMatch.exhaustive
	);
