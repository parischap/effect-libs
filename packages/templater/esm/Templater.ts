/**
 * A template is a string that contains targets where to read/write. Each target can appear between
 * 0 and n times. Targets can overlap, e.g. `falling-tree`, `tree`, `tree-shaking`. In this case,
 * the foremost and longest target takes precedence. For instance, in the template `this bundler is
 * good at tree-shaking`, although `tree` and `tree-shaking` are present at the same position, the
 * longest target `tree-shaking` will take precedence.
 *
 * I can give a length : alignment and padding a max-length no length
 */
import { MArray, MEither, MFunction, MString, MTuple, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Cause,
	Either,
	Function,
	Inspectable,
	Option,
	Order,
	Pipeable,
	Predicate,
	String,
	Tuple,
	Types,
	pipe
} from 'effect';
import { flow } from 'effect/Function';

const moduleTag = '@parischap/templater/Templater/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * During compilation, a template is split at the boundary of each target. So if there are n targets
 * in the template, we have, after compilation, an array of n blocks, each block containing the text
 * between the end of the previous target (or the start of the template if there is no previous
 * target) and the start of the current one, and the index, in targets, of the current target. There
 * remains a final text after the last target. Note: the static text of the first block and
 * finalStaticText may be empty strings.
 *
 * @category Models
 */
export interface Type<out T extends string> extends Inspectable.Inspectable, Pipeable.Pipeable {
	readonly textAndTargetArray: ReadonlyArray<readonly [staticText: string, targetIndex: number]>;
	readonly finalStaticText: string;
	readonly targets: ReadonlyArray<T>;
	/** @internal */
	readonly [_TypeId]: {
		readonly _T: Types.Covariant<T>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<string> => Predicate.hasProperty(u, _TypeId);

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[_TypeId]: {
		_T: MTypes.covariantValue
	},
	toJSON<T extends string>(this: Type<T>) {
		return {
			_id: moduleTag,
			textAndTargetArray: Inspectable.toJSON(this.textAndTargetArray),
			finalStaticText: Inspectable.toJSON(this.finalStaticText),
			targets: Inspectable.toJSON(this.targets)
		};
	},
	[Inspectable.NodeInspectSymbol]<T extends string>(this: Type<T>) {
		return this.toJSON();
	},
	toString<T extends string>(this: Type<T>) {
		return Inspectable.format(this.toJSON());
	},
	pipe<T extends string>(this: Type<T>) {
		/* eslint-disable-next-line prefer-rest-params */
		return Pipeable.pipeArguments(this, arguments);
	}
};

/** Constructor */
const _make = <T extends string>(params: MTypes.Data<Type<T>>): Type<T> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a templater
 *
 * @category Constructor
 * @param template A template in which targets will be searched.
 * @param targets An array of strings containing the targets to find.
 */
export const make = <const T extends string>(
	template: string,
	targets: ReadonlyArray<T>
): Type<T> =>
	pipe(
		targets,
		Array.map(Function.flip(MString.searchAll)(template)),
		MArray.ungroup,
		// Suppress overlapping targets keeping the foremost longest one
		Array.sort(
			Order.mapInput(
				MString.SearchResult.byLongestFirst,
				([_, sR]: readonly [number, MString.SearchResult.Type]) => sR
			)
		),
		Array.chop((indexedSearchResults) => {
			const head = Array.headNonEmpty(indexedSearchResults);
			const [_, { endIndex: upperBound }] = head;
			return Tuple.make(
				head,
				Array.dropWhile(indexedSearchResults, ([_, { startIndex }]) => startIndex < upperBound)
			);
		}),
		Array.mapAccum(0, (startPos, [targetIndex, { startIndex: endPos, endIndex }]) =>
			Tuple.make(endIndex, Tuple.make(template.substring(startPos, endPos), targetIndex))
		),
		Tuple.mapBoth({
			onFirst: Function.flip(String.substring)(template),
			onSecond: Function.identity
		}),
		Tuple.swap,
		Tuple.appendElement(targets)
	) as never;

/**
 * Returns a copy of the original template where the targets have been replaced by the passed array
 * of `targetValues` which must be passed in the same order as the targets. If targetValues contains
 * fewer elements than targets, the missing values are replaced by the empty string. If it contains
 * more elements, the extra elements are ignored
 *
 * @category Utils
 */
export const write =
	<const T extends ReadonlyArray<string>>(self: Type<T>) =>
	(targetValues: MTypes.MapToReadonlyTarget<T, string>): string =>
		pipe(
			self,
			MTuple.firstTwo,
			Tuple.mapBoth({
				onFirst: flow(
					Array.map(
						flow(
							Tuple.mapBoth({
								onFirst: Function.identity,
								onSecond: flow(
									MFunction.flipDual(Array.get<string>)(targetValues),
									Option.getOrElse(() => '')
								)
							}),
							Array.join('')
						)
					),
					Array.join('')
				),
				onSecond: Function.identity
			}),
			Array.join('')
		);

/**
 * Reads the value of the targets from filledOutTemplate. The targets in the original template
 * indicate where to start reading the data. The target patterns passed to this function indicate
 * the amount and shape of data to be read from that position. If targetPatterns is shorter than
 * targets, the missing patterns will be replaced with an empty string (/^$/). If there are more
 * patterns than there are targets, the extra patterns are ignored. Returns an error if
 * filledoutTemplate does not comply with template, if conflicting values are read for the same
 * target, or if a pattern cannot be matched. Otherwise it returns the read values. For each target,
 * the returned value will be a none if the target does not exist in the template or if no pattern
 * was provided for that target
 *
 * @category Utils
 */

export const read = <const T extends ReadonlyArray<string>>(
	self: Type<T>,
	targetPatterns: MTypes.MapToReadonlyTarget<T, RegExp>
): ((
	filledOutTemplate: string
) => Either.Either<
	MTypes.MapToReadonlyTarget<T, Option.Option<string>>,
	MBadArgumentError.BadFormat | MBadArgumentError.TooMany<string>
>) => {
	const [textAndTargetArray, finalStaticText, targets] = self;

	const textAndPatternArray = pipe(
		textAndTargetArray,
		Array.map(([staticText, targetIndex]) =>
			Tuple.make(
				staticText,
				targetIndex,
				pipe(
					targetPatterns,
					Array.get(targetIndex),
					Either.fromOption(() => new Cause.NoSuchElementException())
				)
			)
		)
	);

	return (filledOutTemplate) =>
		Either.gen(function* () {
			const [afterAllTargets, values] = yield* pipe(
				textAndPatternArray,
				Array.mapAccum(
					Either.right(filledOutTemplate) as Either.Either<string, MBadArgumentError.BadFormat>,
					(leftToReadEither, [staticText, targetIndex, targetPattern], position) =>
						pipe(
							Either.gen(function* () {
								const leftToRead = yield* pipe(leftToReadEither);

								const [_1, strippedOfStaticText] = yield* pipe(
									leftToRead,
									MString.splitAt(staticText.length),
									Tuple.mapBoth({
										onFirst: MBadArgumentError.BadFormat.check({
											expected: staticText,
											id: 'filledOutTemplate',
											positions: [position],
											moduleTag,
											functionName: 'read'
										}),
										onSecond: Either.right
									}),
									Either.all
								);

								const targetValue = yield* pipe(
									targetPattern,
									Either.flatMap((pattern) =>
										pipe(
											strippedOfStaticText,
											MBadArgumentError.BadFormat.extractMatch({
												expected: pattern,
												id: 'filledOutTemplate',
												positions: [position],
												moduleTag,
												functionName: 'read'
											})
										)
									),
									MEither.optionFromOptional
								);
								const strippedOfTargetValue = pipe(
									targetValue,
									Option.map(
										flow(String.length, String.substring, Function.apply(strippedOfStaticText))
									),
									Option.getOrElse(() => strippedOfStaticText)
								);

								return Tuple.make(strippedOfTargetValue, Tuple.make(targetIndex, targetValue));
							}),
							MEither.traversePair
						)
				),
				Tuple.mapSecond(Either.all),
				Either.all
			);

			yield* pipe(
				afterAllTargets,
				MBadArgumentError.BadFormat.check({
					expected: finalStaticText,
					id: 'filledOutTemplate',
					positions: [textAndTargetArray.length],
					moduleTag,
					functionName: 'read'
				})
			);

			const result = yield* pipe(
				values,
				MArray.groupByNum({
					size: targets.length,
					fKey: Tuple.getFirst,
					fValue: Tuple.getSecond
				}),
				Array.map((valuesByTarget, position) =>
					pipe(
						valuesByTarget,
						Option.all,
						Either.fromOption(() => new Cause.NoSuchElementException()),
						Either.andThen(
							MArray.match012({
								onEmpty: () => Either.left(new Cause.NoSuchElementException()),
								onSingleton: Either.right,
								onOverTwo: (e) =>
									Either.left(
										new MBadArgumentError.TooMany({
											id: pipe(targets, MArray.unsafeGet(position)),
											positions: pipe(
												values,
												MArray.findAll(flow(Tuple.getFirst, MFunction.strictEquals(position)))
											),
											moduleTag,
											functionName: 'read',
											elements: e
										})
									)
							})
						)
						//MEither.optionFromOptional
					)
				),
				Either.all
			);
			return result as MTypes.MapToReadonlyTarget<T, Option.Option<string>>;
		}) as never;
};
