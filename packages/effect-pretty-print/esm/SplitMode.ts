import { MArray, MMatch, MTypes } from '@parischap/effect-lib';
import { Array, Data, Number, Order, Struct, flow } from 'effect';
import * as FormattedString from './FormattedString.js';
import * as RecordFormat from './RecordFormat.js';
import * as ValueWrapper from './ValueWrapper.js';
import type * as utilities from './utilities.js';

const $ = FormattedString.makeWith;

interface untaggedSingleLine {
	readonly singleLineRecordFormat: RecordFormat.All;
}

interface untaggedMultiLine {
	readonly multiLineRecordFormat: RecordFormat.All;
	readonly indentMode: utilities.IndentMode;
}

interface untaggedAutoLimit {
	/**
	 * Limit, which when strictly superseded, triggers multi-line mode
	 */
	readonly limit: number;
}

export type All = Data.TaggedEnum<{
	readonly SingleLine: untaggedSingleLine;
	readonly MultiLine: untaggedMultiLine;
	readonly AutoBasedOnConstituentNumber: untaggedSingleLine & untaggedMultiLine & untaggedAutoLimit;
	readonly AutoBasedOnConstituentsLength: untaggedSingleLine &
		untaggedMultiLine &
		untaggedAutoLimit;
	readonly AutoBasedOnLongestConstituentsLength: untaggedSingleLine &
		untaggedMultiLine &
		untaggedAutoLimit;
	readonly SingleLineForArraysMultiLineForOthers: untaggedSingleLine & untaggedMultiLine;
}>;
const {
	$is,
	SingleLine,
	MultiLine,
	AutoBasedOnConstituentNumber,
	AutoBasedOnConstituentsLength,
	AutoBasedOnLongestConstituentsLength,
	SingleLineForArraysMultiLineForOthers
} = Data.taggedEnum<All>();
export {
	AutoBasedOnConstituentNumber,
	AutoBasedOnConstituentsLength,
	AutoBasedOnLongestConstituentsLength,
	MultiLine,
	SingleLine,
	SingleLineForArraysMultiLineForOthers
};

export const isSingleLine = $is('SingleLine');
export const isMultiLine = $is('MultiLine');
export const isAutoBasedOnConstituentNumber = $is('AutoBasedOnConstituentNumber');
export const isAutoBasedOnConstituentsLength = $is('AutoBasedOnConstituentsLength');
export const isAutoBasedOnLongestConstituentsLength = $is('AutoBasedOnLongestConstituentsLength');
export const isSingleLineForArraysMultiLineForOthers = $is('SingleLineForArraysMultiLineForOthers');

export type SingleLine = ReturnType<typeof SingleLine>;
export type MultiLine = ReturnType<typeof MultiLine>;
export type AutoBasedOnConstituentNumber = ReturnType<typeof AutoBasedOnConstituentNumber>;
export type AutoBasedOnConstituentsLength = ReturnType<typeof AutoBasedOnConstituentsLength>;
export type AutoBasedOnLongestConstituentsLength = ReturnType<
	typeof AutoBasedOnLongestConstituentsLength
>;
export type SingleLineForArraysMultiLineForOthers = ReturnType<
	typeof SingleLineForArraysMultiLineForOthers
>;

const formatSingleLine =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<
		| SingleLine
		| AutoBasedOnConstituentNumber
		| AutoBasedOnConstituentsLength
		| AutoBasedOnLongestConstituentsLength
		| SingleLineForArraysMultiLineForOthers,
		ValueWrapper.RecordModifier
	> =>
	(self) =>
		flow(
			RecordFormat.formatConstituents(colorSet)(self.singleLineRecordFormat),
			ValueWrapper.makeValueLinesFromConstituents,
			RecordFormat.addDelimitersToValueLines(colorSet)(self.singleLineRecordFormat),
			ValueWrapper.joinValueLines
		);

const formatMultiLine =
	(
		colorSet: utilities.ColorSet
	): MTypes.OneArgFunction<
		| MultiLine
		| AutoBasedOnConstituentNumber
		| AutoBasedOnConstituentsLength
		| AutoBasedOnLongestConstituentsLength
		| SingleLineForArraysMultiLineForOthers,
		ValueWrapper.RecordModifier
	> =>
	(self) =>
		flow(
			RecordFormat.formatConstituents(colorSet)(self.multiLineRecordFormat),
			ValueWrapper.forInitConstituents(
				ValueWrapper.mapValueLines(
					flow(
						MArray.modifyHead(
							FormattedString.prepend(
								$(colorSet.multiLineIndentColorer)(self.indentMode.initPropFirstLine)
							)
						),
						MArray.modifyTail(
							FormattedString.prepend(
								$(colorSet.multiLineIndentColorer)(self.indentMode.initPropInBetween)
							)
						)
					)
				)
			),
			ValueWrapper.forLastConstituent(
				ValueWrapper.mapValueLines(
					flow(
						MArray.modifyHead(
							FormattedString.prepend(
								$(colorSet.multiLineIndentColorer)(self.indentMode.lastPropFirstLine)
							)
						),
						MArray.modifyTail(
							FormattedString.prepend(
								$(colorSet.multiLineIndentColorer)(self.indentMode.lastPropInBetween)
							)
						)
					)
				)
			),
			ValueWrapper.makeValueLinesFromConstituents,
			RecordFormat.addDelimitersToValueLines(colorSet)(self.multiLineRecordFormat)
		);

export const format = (
	colorSet: utilities.ColorSet
): MTypes.OneArgFunction<All, ValueWrapper.RecordModifier> =>
	flow(
		MMatch.make,
		MMatch.when(isSingleLine, formatSingleLine(colorSet)),
		MMatch.when(isMultiLine, formatMultiLine(colorSet)),
		MMatch.when(isAutoBasedOnConstituentNumber, (autoSplitMode) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(
					flow(
						Struct.get('constituents')<ValueWrapper.Record>,
						Array.length,
						Number.lessThanOrEqualTo(autoSplitMode.limit)
					),
					formatSingleLine(colorSet)(autoSplitMode)
				),
				MMatch.orElse(formatMultiLine(colorSet)(autoSplitMode))
			)
		),
		MMatch.when(isAutoBasedOnConstituentsLength, (autoSplitMode) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(
					flow(
						Struct.get('constituents')<ValueWrapper.Record>,
						Array.map(
							flow(
								Struct.get('valueLines'),
								Array.map(FormattedString.printedLength),
								Number.sumAll
							)
						),
						Number.sumAll,
						Number.lessThanOrEqualTo(autoSplitMode.limit)
					),
					formatSingleLine(colorSet)(autoSplitMode)
				),
				MMatch.orElse(formatMultiLine(colorSet)(autoSplitMode))
			)
		),
		MMatch.when(isAutoBasedOnLongestConstituentsLength, (autoSplitMode) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(
					flow(
						Struct.get('constituents')<ValueWrapper.Record>,
						Array.map(
							flow(
								Struct.get('valueLines'),
								Array.map(FormattedString.printedLength),
								Number.sumAll
							)
						),
						Array.match({
							onEmpty: () => false,
							onNonEmpty: flow(
								Array.max(Order.number),
								Number.lessThanOrEqualTo(autoSplitMode.limit)
							)
						})
					),
					formatSingleLine(colorSet)(autoSplitMode)
				),
				MMatch.orElse(formatMultiLine(colorSet)(autoSplitMode))
			)
		),
		MMatch.when(isSingleLineForArraysMultiLineForOthers, (autoSplitMode) =>
			flow(
				MMatch.make<ValueWrapper.Record>,
				MMatch.when(ValueWrapper.isArray, formatSingleLine(colorSet)(autoSplitMode)),
				MMatch.orElse(formatMultiLine(colorSet)(autoSplitMode))
			)
		),
		MMatch.exhaustive
	);
