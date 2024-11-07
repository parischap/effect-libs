import * as Errors from '@parischap/date/Errors';
import * as MergedBasis from '@parischap/date/MergedBasis';
import * as MergedToken from '@parischap/date/MergedToken';
import { MArray, MFunction } from '@parischap/effect-lib';
import { Array, Either, HashMap, Option, Record, pipe } from 'effect';
export interface BasisFromMergedTokens<out E> {
	(
		paramIndexToMergedTokenIndex: ReadonlyArray<number>
	): (mergedTokenValues: ReadonlyArray<number>) => Either.Either<number, E>;
}

export interface Descriptor<out E, out P> {
	readonly mergedBasis: MergedBasis.Type;
	readonly basisFromMergedTokens: {
		decoder: BasisFromMergedTokens<E>;
		readonly mergedTokenParamsInOrder: ReadonlyArray<P>;
	};
}

const Descriptor = MFunction.make<
	Descriptor<[paramIndex: number, message: string], MergedToken.Type>
>;

export interface DescriptorWithParamsAvailability
	extends Descriptor<
		Errors.InvalidDateString,
		Option.Option<MergedToken.JoinedRecordWithPositions>
	> {}

export interface DescriptorWithAllParamsAvailable
	extends Descriptor<
		Errors.InvalidDateString,
		Option.Some<MergedToken.JoinedRecordWithPositions>
	> {}

const getParam = (
	paramIndex: number,
	mergedTokenValues: ReadonlyArray<number>,
	paramIndexToMergedTokenIndex: ReadonlyArray<number>
): number =>
	pipe(
		mergedTokenValues,
		MArray.unsafeGet(pipe(paramIndexToMergedTokenIndex, MArray.unsafeGet(paramIndex)))
	);

const struct = {
	yearOrdinalDay: Descriptor({
		mergedBasis: 'dayMs',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) => {
				const year = getParam(0, mergedTokenValues, paramIndexToMergedTokenIndex);
				const ordinalDay = getParam(1, mergedTokenValues, paramIndexToMergedTokenIndex);
				const a = struct.yo;
				return Either.mapLeft(
					Date.yearOrdinalDayToMs(year, ordinalDay),
					(e) => new Errors.InvalidDateString({ message: '' })
				);
			},
			mergedTokenParamsInOrder: ['year', 'ordinalDay']
		}
	}),
	yearMonthDay: Descriptor({
		mergedBasis: 'dayMs',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const y = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: -utils.MAX_YEAR,
							max: utils.MAX_YEAR
						})
					);

					const M = yield* pipe(
						1,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 1,
							max: 12
						})
					);

					const monthStartMs = utils.utcTimeOfMonthStart(M, y);
					// javascript accepts years with 13 months...
					const nextMonthStartMs = utils.utcTimeOfMonthStart(M + 1, y);
					const d = yield* pipe(
						2,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 1,
							max: Math.floor((nextMonthStartMs - monthStartMs) / utils.DAY_MS)
						})
					);

					return monthStartMs + (d - 1) * utils.DAY_MS;
				}),
			mergedTokenParamsInOrder: ['year', 'month', 'monthDay']
		}
	}),
	yearIsoWeekDay: Descriptor({
		mergedBasis: 'dayMs',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const y = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: -utils.MAX_YEAR,
							max: utils.MAX_YEAR
						})
					);

					const firstYearWeekStartMs = utils.utcTimeOfYearFirstWeekStart(y);
					const nextFirstYearWeekStartMs = utils.utcTimeOfYearFirstWeekStart(y + 1);
					const W = yield* pipe(
						1,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 1,
							max: Math.floor((nextFirstYearWeekStartMs - firstYearWeekStartMs) / utils.WEEK_MS)
						})
					);

					const E = yield* pipe(
						2,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 1,
							max: 7
						})
					);

					return firstYearWeekStartMs + (W - 1) * utils.WEEK_MS + (E - 1) * utils.DAY_MS;
				}),
			mergedTokenParamsInOrder: ['year', 'isoWeek', 'weekDay']
		}
	}),
	hour24: Descriptor({
		mergedBasis: 'hour',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const H = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 0,
							max: 23
						})
					);
					return H * utils.HOUR_MS;
				}),
			mergedTokenParamsInOrder: ['hour24']
		}
	}),
	ha: Descriptor({
		mergedBasis: 'H',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const h = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 0,
							max: 11
						})
					);
					const a = pipe(
						mergedTokenValues,
						MArray.unsafeGet(MArray.unsafeGet(1)(paramIndexToMergedTokenIndex))
					);
					return (h + a) * utils.HOUR_MS;
				}),
			mergedTokenParamsInOrder: ['hour12', 'meridiem']
		}
	}),
	m: Descriptor({
		mergedBasis: 'm',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const m = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 0,
							max: 59
						})
					);
					return m * utils.MINUTE_MS;
				}),
			mergedTokenParamsInOrder: ['minute']
		}
	}),
	s: Descriptor({
		mergedBasis: 's',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const s = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 0,
							max: 59
						})
					);
					return s * utils.SECOND_MS;
				}),
			mergedTokenParamsInOrder: ['second']
		}
	}),
	S: Descriptor({
		mergedBasis: 'S',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.gen(function* () {
					const S = yield* pipe(
						0,
						getAndCheck({
							paramIndexToMergedTokenIndex,
							mergedTokenValues,
							min: 0,
							max: 999
						})
					);
					return S;
				}),
			mergedTokenParamsInOrder: ['millisecond']
		}
	}),
	Z: Descriptor({
		mergedBasis: 'Z',
		basisFromMergedTokens: {
			decoder: (paramIndexToMergedTokenIndex) => (mergedTokenValues) =>
				Either.right(
					-pipe(
						mergedTokenValues,
						MArray.unsafeGet(MArray.unsafeGet(0)(paramIndexToMergedTokenIndex))
					) * utils.HOUR_MS
				),
			mergedTokenParamsInOrder: ['timeZoneOffset']
		}
	})
};

export type Type = keyof typeof struct;

//export const map: HashMap.HashMap<Type, Descriptor> = HashMap.fromIterable(structEntries);

export const structWithMergedTokensByMergedBasis: Record.Record<{
	defaultValue: MergedBasis.DefaultValue;
	bases: ReadonlyArray<Descriptor<Errors.InvalidDateString, string>>;
}> = pipe(
	struct,
	Record.map(({ basisFromMergedTokens, mergedBasis }) => ({
		mergedBasis,
		basisFromMergedTokens: {
			decoder:
				(paramIndexToMergedTokenIndex: ReadonlyArray<number>) =>
				(mergedTokenValues: ReadonlyArray<number>) =>
					pipe(
						mergedTokenValues,
						basisFromMergedTokens.decoder(paramIndexToMergedTokenIndex),
						Either.mapLeft(
							([paramIndex, message]) =>
								new Errors.InvalidDateString({
									message: `Disallowed value for merged token ${pipe(basisFromMergedTokens.mergedTokenParamsInOrder, MArray.unsafeGet(paramIndex), (mergedToken) => MergedToken.name(mergedToken))}. ${message}`
								})
						)
					),
			mergedTokenParamsInOrder: basisFromMergedTokens.mergedTokenParamsInOrder
		}
	})),
	Record.toEntries,
	Array.groupBy(([_, { mergedBasis }]) => mergedBasis),
	Record.map((group, mergedBasis) => ({
		defaultValue: pipe(
			MergedBasis.map,
			HashMap.get(mergedBasis),
			Option.getOrThrowWith(
				() => new Error(`Abnormal Error. ${mergedBasis} not found in MergedBasis.map`)
			),
			({ defaultValue }) => defaultValue
		),
		bases: Array.map(group, ([_, basisDescriptor]) => basisDescriptor)
	}))
);
