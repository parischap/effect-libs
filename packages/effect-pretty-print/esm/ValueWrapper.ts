import {
	MArray,
	MFunction,
	MMatch,
	MOption,
	MPredicate,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Chunk,
	Equal,
	Hash,
	HashSet,
	MutableList,
	Number,
	Order,
	Predicate,
	Struct,
	flow,
	pipe
} from 'effect';
import * as FormattedString from './FormattedString.js';
import type * as Options from './Options.js';
import type * as utilities from './utilities.js';

export enum ParentType {
	Array,
	Function,
	NonNullObject,
	// Node has no parent because it is the top node
	Other
}

class Type<out V extends MTypes.Unknown = MTypes.Unknown> implements Equal.Equal {
	readonly value: V;
	readonly depth: number;
	readonly protoDepth: number;
	readonly options: Options.Type;
	readonly key: string | symbol;
	readonly stringKey: string;
	readonly hasFunctionValue: boolean;
	readonly hasSymbolicKey: boolean;
	readonly hasEnumerableKey: boolean;
	// eslint-disable-next-line functional/prefer-readonly-type -- Mutable for perf sake
	constituents: Constituents;
	// eslint-disable-next-line functional/prefer-readonly-type -- Mutable for perf sake
	valueLines: utilities.ValueLines;
	readonly parents: HashSet.HashSet<AllImmutable>;

	constructor(params: MTypes.Data<Type<V>>) {
		this.value = params.value;
		this.depth = params.depth;
		this.protoDepth = params.protoDepth;
		this.options = params.options;
		this.key = params.key;
		this.stringKey = params.stringKey;
		this.hasFunctionValue = params.hasFunctionValue;
		this.hasSymbolicKey = params.hasSymbolicKey;
		this.hasEnumerableKey = params.hasEnumerableKey;
		this.constituents = params.constituents;
		this.valueLines = params.valueLines;
		this.parents = params.parents;
	}

	// Useful for the parents property
	[Equal.symbol](that: Equal.Equal): boolean {
		return that instanceof Type ? this.value === that.value : false;
	}
	[Hash.symbol](): number {
		return Hash.cached(this, Hash.hash(this.value));
	}
}
export type All = Type<MTypes.Unknown>;
export type AllImmutable = Readonly<Type<MTypes.Unknown>>;

type RecordType = Type<MTypes.AnyRecord>;
type ArrayType = Type<MTypes.AnyArray>;
type FunctionType = Type<MTypes.AnyFunction>;
type PrimitiveType = Type<MTypes.Primitive>;
export type {
	ArrayType as Array,
	FunctionType as Function,
	PrimitiveType as Primitive,
	RecordType as Record
};

export type Constituents = ReadonlyArray<AllImmutable>;
export type RecordModifier = MTypes.OneArgFunction<RecordType>;

export const makeFromValue = (options: Options.Type) => (value: unknown) =>
	new Type({
		value: value as MTypes.Unknown,
		depth: 0,
		protoDepth: 0,
		options,
		key: '',
		stringKey: '',
		hasFunctionValue: false,
		hasSymbolicKey: false,
		hasEnumerableKey: false,
		constituents: Array.empty(),
		valueLines: Array.empty(),
		parents: HashSet.empty()
	});
export const isRecord = (self: All): self is RecordType =>
	pipe(self, Struct.get('value'), MTypes.isRecord);

export const isArray = (self: All): self is ArrayType =>
	pipe(self, Struct.get('value'), MTypes.isArray);

export const isFunction = (self: All): self is FunctionType =>
	pipe(self, Struct.get('value'), MTypes.isFunction);

export const isPrimitive = (self: All): self is PrimitiveType =>
	pipe(self, Struct.get('value'), MTypes.isPrimitive);

const hasEnumerableKey: Predicate.Predicate<All> = Struct.get('hasEnumerableKey');
const hasSymbolicKey: Predicate.Predicate<All> = Struct.get('hasSymbolicKey');
const hasFunctionValue: Predicate.Predicate<All> = Struct.get('hasFunctionValue');
const hasShowFunctions: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showFunctions')
);
const hasShowNonFunctions: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showNonFunctions')
);
const hasShowEnumerableProperties: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showEnumerableProperties')
);
const hasShowNonEnumerableProperties: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showNonEnumerableProperties')
);
const hasShowSymbolicProperties: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showSymbolicProperties')
);
const hasShowStringProperties: Predicate.Predicate<All> = flow(
	Struct.get('options'),
	Struct.get('showStringProperties')
);
const notHasProtoKey: Predicate.Predicate<All> = Predicate.or(
	hasSymbolicKey,
	flow(Struct.get('stringKey'), Predicate.not(MFunction.strictEquals('__proto__')))
);

export const keep: Predicate.Predicate<All> = flow(
	Predicate.every([
		Predicate.or(
			Predicate.and(hasFunctionValue, hasShowFunctions),
			Predicate.and(Predicate.not(hasFunctionValue), hasShowNonFunctions)
		),
		Predicate.or(
			Predicate.and(hasEnumerableKey, hasShowEnumerableProperties),
			Predicate.and(Predicate.not(hasEnumerableKey), hasShowNonEnumerableProperties)
		),
		Predicate.or(
			Predicate.and(Predicate.not(hasSymbolicKey), hasShowStringProperties),
			Predicate.and(hasSymbolicKey, hasShowSymbolicProperties)
		),
		// filter out the '__proto__' properties if there are some to avoid duplicate prototype keys
		notHasProtoKey
	])
);

/**
 * Sorts by prototypalDepth, lowest depth first
 * @category sorting
 */
export const byPrototypalDepth: Order.Order<AllImmutable> = Order.mapInput(
	Order.number,
	Struct.get('protoDepth')
);

/**
 * Sorts properties by stringKey (key converted to string)
 * @category sorting
 */
export const byStringKey: Order.Order<AllImmutable> = Order.mapInput(
	Order.string,
	Struct.get('stringKey')
);

/**
 * Sorts by callability (non functions first, then functions)
 * @category sorting
 */
export const byCallability: Order.Order<AllImmutable> = Order.mapInput(
	Order.boolean,
	Struct.get('hasFunctionValue')
);

/**
 * Sorts by type (symbolic keys first, then string keys)
 * @category sorting
 */
export const byType: Order.Order<AllImmutable> = Order.mapInput(
	Order.reverse(Order.boolean),
	Struct.get('hasSymbolicKey')
);

/**
 * Sorts by enumerability (non-enumerable keys first, then enumerable keys)
 * @category sorting
 */
export const byEnumerability: Order.Order<AllImmutable> = Order.mapInput(
	Order.boolean,
	Struct.get('hasEnumerableKey')
);

export const setValueLines =
	(valueLines: utilities.ValueLines) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => {
		// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
		self.valueLines = valueLines;
		return self;
	};

export const setValueLinesWith =
	<V extends MTypes.Unknown>(f: MTypes.OneArgFunction<NoInfer<Type<V>>, utilities.ValueLines>) =>
	(self: Type<V>): Type<V> =>
		pipe(self, setValueLines(f(self)));

export const mapValueLines = (
	f: MTypes.OneArgFunction<utilities.ValueLines>
): (<V extends MTypes.Unknown>(self: Type<V>) => Type<V>) =>
	setValueLinesWith(flow(Struct.get('valueLines'), f));

export const setConstituents =
	(constituents: Constituents) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => {
		// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
		self.constituents = constituents;
		return self;
	};

export const setConstituentsWith =
	<V extends MTypes.Unknown>(f: MTypes.OneArgFunction<NoInfer<Type<V>>, Constituents>) =>
	(self: Type<V>): Type<V> =>
		pipe(self, setConstituents(f(self)));

export const mapConstituents = (
	f: MTypes.OneArgFunction<Constituents>
): (<V extends MTypes.Unknown>(self: Type<V>) => Type<V>) =>
	setConstituentsWith(flow(Struct.get('constituents'), f));

export const forEachConstituent =
	(f: MTypes.OneArgFunction<All, void>) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => {
		pipe(self.constituents, Array.forEach(f));
		return self;
	};

export const forInitConstituents =
	(f: MTypes.OneArgFunction<All, void>) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => {
		// eslint-disable-next-line functional/no-expression-statements
		pipe(self.constituents, MArray.modifyInit(f));
		return self;
	};

export const forLastConstituent =
	(f: MTypes.OneArgFunction<All, void>) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => {
		// eslint-disable-next-line functional/no-expression-statements
		pipe(self.constituents, MArray.modifyLast(f));
		return self;
	};

export const joinValueLines: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = mapValueLines(
	flow(FormattedString.join(FormattedString.empty), Array.of)
);

export const makeValueLinesFromConstituents: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> =
	setValueLinesWith(
		flow(Struct.get('constituents'), Array.map(Struct.get('valueLines')), Array.flatten)
	);

const getRecordConstituents = (self: RecordType): Constituents => {
	const options = self.options;
	let currentRecord = self.value;
	let constituents = Chunk.empty<All>();
	let currentProtoDepth = self.protoDepth;
	const nextDepth = self.depth + 1;

	do {
		// eslint-disable-next-line functional/no-expression-statements
		constituents = Chunk.appendAll(
			constituents,
			pipe(
				currentRecord,
				// Record.map does not map on non enumerable properties
				Reflect.ownKeys,
				Array.map((key) => {
					const value = currentRecord[key] as MTypes.Unknown;
					return new Type({
						value,
						depth: nextDepth,
						protoDepth: currentProtoDepth,
						options,
						key,
						stringKey: MString.fromNonNullPrimitive(key),
						hasFunctionValue: MTypes.isFunction(value),
						hasSymbolicKey: MTypes.isSymbol(key),
						hasEnumerableKey: Object.prototype.propertyIsEnumerable.call(currentRecord, key),
						constituents: Array.empty(),
						valueLines: Array.empty(),
						parents: HashSet.add(self.parents, self)
					});
				}),
				Chunk.fromIterable
			)
		);
		const prototype = Reflect.getPrototypeOf(currentRecord);
		// eslint-disable-next-line functional/no-expression-statements
		if (prototype !== null) currentRecord = prototype;
		else break;
	} while (++currentProtoDepth <= options.maxPrototypeDepth);

	return pipe(constituents, Array.filter(keep));
};

export const stringify = (self: All): All => {
	const options = self.options;
	let toOpenOrStringify: ReadonlyArray<All> = Array.of(self);
	const toStringify: MutableList.MutableList<RecordType> = MutableList.empty<RecordType>();
	do {
		// eslint-disable-next-line functional/no-expression-statements
		toOpenOrStringify = pipe(
			toOpenOrStringify,
			Array.reduce(Chunk.empty<All>(), (nextToOpenOrStringify, wrapper) =>
				pipe(
					wrapper,
					setValueLinesWith(
						flow(
							MMatch.make,
							MMatch.when(
								isPrimitive,
								flow(
									MMatch.make,
									MMatch.tryFunction(flow(options.byPasser, MOption.fromOptionOrNullable)),
									MMatch.orElse(
										flow(
											Struct.get('value'),
											MString.fromPrimitive,
											FormattedString.makeWith(),
											Array.of
										)
									)
								)
							),
							MMatch.unsafeWhen(isRecord, (record) =>
								pipe(
									record,
									flow(
										MMatch.make,
										MMatch.tryFunction(flow(options.byPasser, MOption.fromOptionOrNullable)),
										MMatch.when(
											MPredicate.struct({
												depth: Number.greaterThanOrEqualTo(options.maxDepth)
											}),
											flow(
												MMatch.make,
												MMatch.when(isArray, () => options.arrayLabel),
												MMatch.when(isFunction, () => options.functionLabel),
												MMatch.orElse(() => options.objectLabel),
												Array.of
											)
										),
										MMatch.when(flow(Struct.get('parents'), HashSet.has<All>(record)), () =>
											Array.of(options.circularLabel)
										),
										MMatch.orElse((record) => {
											// eslint-disable-next-line functional/no-expression-statements
											MutableList.prepend(
												toStringify,
												pipe(
													record,
													setConstituentsWith(getRecordConstituents),
													options.propertyFilter,
													mapConstituents(
														flow(
															MFunction.fIfTrue({
																condition: !MTypes.isArray(record.value) || options.sortArrays,
																f: Array.sort(options.propertySortOrder)
															}),
															MFunction.fIfTrue({
																condition: options.dedupeRecordProperties,
																f: Array.dedupeWith((self, that) => self.key === that.key)
															})
														)
													)
												)
											);
											return Array.empty<FormattedString.Type>();
										})
									)
								)
							)
						)
					),
					Struct.get('constituents'),
					Chunk.fromIterable,
					(newElems) => Chunk.appendAll(nextToOpenOrStringify, newElems)
				)
			),
			Array.fromIterable
		);
	} while (MTypes.isOverOne(toOpenOrStringify));

	let currentRecord: RecordType | undefined;
	while ((currentRecord = MutableList.shift(toStringify)) !== undefined) {
		// eslint-disable-next-line functional/no-expression-statements
		pipe(currentRecord, options.recordFormatter, setConstituents(Array.empty()));
	}
	return self;
};

/*export const matchValue: {
	<H, I, J>(params: {
		readonly onFunction: (f: MTypes.AnyFunction) => H;
		readonly onArray: (a: MTypes.AnyArray) => I;
		readonly onNonNullObject: (o: MTypes.AnyRecord) => J;
	}): (self: { readonly value: MTypes.AnyRecord }) => H | I | J;

	<A, B, C, D, E, F, G, H, I, J>(params: {
		readonly onString: (s: string) => A;
		readonly onNumber: (n: number) => B;
		readonly onbigInt: (n: bigInt) => C;
		readonly onBoolean: (b: boolean) => D;
		readonly onSymbol: (s: symbol) => E;
		readonly onUndefined: () => F;
		readonly onNull: () => G;
		readonly onFunction: (f: MTypes.AnyFunction) => H;
		readonly onArray: (a: MTypes.AnyArray) => I;
		readonly onNonNullObject: (o: MTypes.AnyRecord) => J;
	}): (self: { readonly value: MTypes.Unknown }) => A | B | C | D | E | F | G | H | I | J;
} =
	<A, B, C, D, E, F, G, H, I, J>(params: {
		readonly onString?: (s: string) => A;
		readonly onNumber?: (n: number) => B;
		readonly onbigInt?: (n: bigInt) => C;
		readonly onBoolean?: (b: boolean) => D;
		readonly onSymbol?: (s: symbol) => E;
		readonly onUndefined?: () => F;
		readonly onNull?: () => G;
		readonly onFunction: (f: MTypes.AnyFunction) => H;
		readonly onArray: (a: MTypes.AnyArray) => I;
		readonly onNonNullObject: (o: MTypes.AnyRecord) => J;
	}) =>
	(self: { readonly value: MTypes.Unknown }): A | B | C | D | E | F | G | H | I | J =>
		pipe(
			self,
			Struct.get('value'),
			MMatch.make,
			MMatch.when(MTypes.isString, params.onString as (s: string) => A),
			MMatch.when(MTypes.isNumber, params.onNumber as (n: number) => B),
			MMatch.when(MTypes.isBigInt, params.onbigInt as (n: bigInt) => C),
			MMatch.when(MTypes.isBoolean, params.onBoolean as (b: boolean) => D),
			MMatch.when(MTypes.isSymbol, params.onSymbol as (s: symbol) => E),
			MMatch.when(MTypes.isUndefined, params.onUndefined as () => F),
			MMatch.when(MTypes.isNull, params.onNull as () => G),
			MMatch.when(
				MTypes.isRecord,
				flow(
					MMatch.make,
					MMatch.when(MTypes.isFunction, params.onFunction),
					MMatch.when(MTypes.isArray, params.onArray),
					MMatch.orElse(params.onNonNullObject)
				)
			),
			MMatch.exhaustive
		);*/
