import { MArray, MString, MTypes } from '@parischap/effect-lib';
import { MRegExp } from '@parischap/js-lib';
import * as Basis from './Basis.js';
import * as Errors from './Errors.js';
import * as MergedToken from './MergedToken.js';
import * as Token from './Token.js';

import { Array, Either, Number, Option, Record, String, Tuple, pipe } from 'effect';

//const moduleTag = '@parischap/effect-date/parseDateString/';
export type DefaultOption = 'zeroValues' | 'nowFragments' | 'none';

const defaultDate = function (defaultOption: DefaultOption) {
	switch (defaultOption) {
		case 'none':
			return;
		case 'nowFragments':
			return new Date();
		case 'zeroValues':
			return new Date(0, 0, 0, 0, 0, 0, 0);
	}
};

/*
 * Parses a date string according to the passed format. See Token.ts for the list and description of the tokens that can be used in the format param.
 * @param format example: `yyyy-MM-ddTHH:mm:ssXXX`
 * @param defaultOption: determines what to do if all the information required to build a date is not present in the format param: `zeroValues` will use 0 for the missing data, `nowFragments` will take the default values from the current date expressed in the current locale, and `none` will trigger an error.
 * @param locale locale to use to parse the date. If omitted, system locale is used. The locale is used for tokens that expect a string like `MMM`, `MMMM`, `EEE`, `EEEE`,...
 * @returns The function returns an error if the locale does not exist or if defaultOption===`none` and the format param does not contain sufficient information to calculate a date (e.g how can hour, minute,... be determined with format=`yyyy-MM-dd`?). Otherwise, it returns a function that takes a string to parse (`input`) and returns a date or an error if `input` does not match the format param or if it contains invalid parameters (e.g `25` for token `H`, or the same token with different values,...)
 */

export const parseDateString = (
	format: string,
	defaultOption: DefaultOption = 'none',
	locale?: string,
	eol = '\n',
	tabChar = '  '
): Either.Either<
	Errors.InexistentLocale | Errors.FormatMismatch,
	(input: string) => Either.Either<Errors.FormatMismatch | Errors.InvalidDateString, Date>
> =>
	Either.gen(function* () {
		const now = defaultDate(defaultOption);

		const hyphen = eol + tabChar + '-';
		const commaAndHyphen = ',' + hyphen;

		const [formatPattern, tokensInOrder] = pipe(
			format,
			MRegExp.escape,
			MString.replaceMulti(Token.structWithMergedToken, ({ parsePattern }) => parsePattern)
		);

		const formatRegExp = new RegExp(formatPattern);

		// Decoder that converts tokens to merged tokens
		const tokenToMergedTokenDecoder = yield* pipe(
			tokensInOrder,
			Array.map(([_, { tokenToMergedToken }]) => pipe(locale, tokenToMergedToken)),
			Either.all
		);

		// Prepare decoder that converts merged tokens to merged bases and checks the coherence of the value of the merged tokens that were not used to build the date
		const mergedTokensPositions: Record.Record<MergedToken.JoinedRecordWithPositions> = pipe(
			tokensInOrder,
			Array.map(([_, { mergedToken }], position) => Tuple.make(mergedToken, position)),
			Array.groupBy(([{ key }]) => key),
			Record.map((arr) =>
				pipe(arr, Array.headNonEmpty, ([mergedTokenRecord]) => ({
					...mergedTokenRecord,
					positions: Array.map(arr, ([_, position]) => position)
				}))
			)
		);

		const decodersAndChecks = yield* pipe(
			Basis.structWithMergedTokensByMergedBasis,
			Record.map(({ bases, defaultValue }) =>
				pipe(
					bases,
					Array.map(({ basisFromMergedTokens, mergedBasis }) => ({
						mergedBasis,
						basisFromMergedTokens: {
							decoder: basisFromMergedTokens.decoder,
							mergedTokenParamsInOrder: Array.map(
								basisFromMergedTokens.mergedTokenParamsInOrder,
								(mergedToken) => pipe(mergedTokensPositions, Record.get(mergedToken))
							)
						}
					})),
					MArray.extractFirst<
						Basis.DescriptorWithParamsAvailability,
						Basis.DescriptorWithAllParamsAvailable
					>(Basis.isDescriptorWithAllParamsAvailable),
					([basisWithAllParamsAvailable, otherBases]) =>
						Either.gen(function* () {
							const mergedTokenToBasisDecoder = yield* pipe(
								Option.match(basisWithAllParamsAvailable, {
									onNone: () =>
										pipe(
											now,
											Either.liftPredicate(
												MTypes.isNotUndefined,
												() =>
													// Why not use BadArgument.BadFormat ?
													new Errors.FormatMismatch({
														message: `Provided format: '${format}' does not contain enough information to calculate a date`
													})
											),
											Either.map((now) => () => Either.right(defaultValue(now)))
										),
									onSome: ({ basisFromMergedTokens: { decoder, mergedTokenParamsInOrder } }) =>
										pipe(
											mergedTokenParamsInOrder,
											Array.map((o) => Array.headNonEmpty(o.value.positions)),
											decoder,
											Either.right
										)
								})
							);

							const checks = pipe(
								otherBases,
								Array.map(
									({ basisFromMergedTokens: { mergedTokenParamsInOrder } }) =>
										mergedTokenParamsInOrder
								),
								Array.flatten,
								Array.getSomes,
								Array.map(
									({
										descriptor: { dateToMergedToken, label: mergedTokenLabel },
										key,
										positions
									}) =>
										(date: Date, mergedTokenValues: ReadonlyArray<number>) =>
											(
												pipe(mergedTokenValues, MArray.unsafeGet(Array.headNonEmpty(positions))) ===
												dateToMergedToken(date)
											) ?
												Option.none()
											:	Option.some(
													`merged token ${key}(${mergedTokenLabel}) at position(s) ${pipe(
														positions,
														Array.map((pos) => MString.fromNonNullablePrimitive(pos + 1)),
														Array.join(', ')
													)} has an incoherent value`
												)
								)
							);
							return Tuple.make(mergedTokenToBasisDecoder, checks);
						})
				)
			),
			Either.all
		);

		const mergedTokensToMergedBasesDecoders = pipe(
			decodersAndChecks,
			Record.map(([decoder]) => decoder)
		);
		const mergedTokensChecks = pipe(
			decodersAndChecks,
			Record.map(([_, checks]) => checks)
		);

		return (input: string) =>
			pipe(
				Either.gen(function* () {
					const matches = yield* pipe(
						input,
						String.match(formatRegExp),
						Either.fromOption(
							() =>
								new Errors.FormatMismatch({
									message: `Input '${self}' does not match the provided format: '${format}'`
								})
						)
					);

					// Convert the token values to merged token values and check that multiple items of the same merge token all received the same value
					const mergedTokenValues = yield* pipe(
						matches,
						MArray.takeRightBut(1)<string>,
						Array.zip(tokenToMergedTokenDecoder),
						Array.map(([tokenValue, decoder]) => decoder(tokenValue)),
						Either.all,
						Either.flatMap((mergedTokenValues) =>
							Either.gen(function* () {
								const incoherences = pipe(
									mergedTokensPositions,
									Record.map(({ descriptor: { label }, key, positions }) =>
										pipe(
											positions,
											Array.map((position) => pipe(mergedTokenValues, MArray.unsafeGet(position))),
											Array.dedupe,
											(valueArray) =>
												valueArray.length === 1 ?
													Option.none()
												:	Option.some(
														`merged token ${key}(${label}) at position(s) ${pipe(
															positions,
															Array.map((pos) => MString.fromNonNullablePrimitive(pos + 1)),
															Array.join(', ')
														)} has an incoherent value`
													)
										)
									),
									Record.values,
									Array.getSomes
								);
								return MTypes.isEmptyArray(incoherences) ? mergedTokenValues : (
										yield* pipe(
											Either.left(
												new Errors.InvalidDateString({
													message:
														'Following incoherences were found: ' +
														hyphen +
														Array.join(incoherences, commaAndHyphen)
												})
											)
										)
									);
							})
						)
					);

					// Convert  the merged token values to merged bases values
					const bases = yield* pipe(
						mergedTokensToMergedBasesDecoders,
						Record.map((decoder) => decoder(mergedTokenValues)),
						Either.all
					);

					// Calculate the final date
					const result = pipe(bases, Record.values, Number.sumAll);

					// Check that the merged tokens that could not be used to calculate the date are coherent with those that were used
					return yield* pipe(
						result,
						Number.sum(pipe(bases, MReadonlyRecord.unsafeGet('Z'))),
						(dateToCheckMs) => {
							// Input date elements are provided in zone Z. The check functions return elements in UTC. For the check functions to return coherent results, we need to apply the zone offset a second time
							const dateToCheck = new Date(dateToCheckMs);
							const incoherences = pipe(
								mergedTokensChecks,
								Record.map((arr) =>
									pipe(
										arr,
										Array.map((check) => check(dateToCheck, mergedTokenValues)),
										Array.getSomes
									)
								),
								Record.values,
								Array.flatten
							);
							return MTypes.isEmptyArray(incoherences) ?
									Either.right(new Date(result))
								:	Either.left(
										new Errors.InvalidDateString({
											message:
												'Following incoherences were found: ' +
												hyphen +
												Array.join(incoherences, commaAndHyphen)
										})
									);
						}
					);
				})
			);
	});
