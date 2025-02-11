/**
 * This module implements a cache with a fixed capacity and time-to-live. The contents of the cache
 * is populated by a lookup function which may be recursive. The cache capacity may temporarily be
 * exceeded if the lookup function is recursive (because the cache is also used to determine
 * circularity). Keys are compared using Equal.equals.
 */
import {
	Array,
	Equal,
	Inspectable,
	MutableHashMap,
	MutableQueue,
	Option,
	Pipeable,
	Predicate,
	Tuple,
	Types,
	flow,
	pipe
} from 'effect';
import * as MInspectable from './Inspectable.js';
import * as MPipeable from './Pipeable.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/Cache/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * This namespace implements a ValueContainer which is a container for a value to be stored in a
 * cache.
 */
namespace ValueContainer {
	const namespaceTag = moduleTag + 'ValueContainer/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Interface that represents a ValueContainer
	 *
	 * @category Models
	 */
	export interface Type<out A> extends Inspectable.Inspectable, Pipeable.Pipeable {
		/** The value calculated by the LookUp function */
		readonly value: A;
		/** The time at which the value was calculated */
		readonly storeDate: number;
		/** @internal */
		readonly [_TypeId]: {
			readonly _A: Types.Covariant<A>;
		};
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, _TypeId);

	/** Prototype */
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const proto: MTypes.Proto<Type<any>> = {
		[_TypeId]: {
			_A: MTypes.covariantValue
		},
		...MInspectable.BaseProto(namespaceTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
		MTypes.objectFromDataAndProto(proto, params);
}

/**
 * Type that represents the lookup function. In addition to the key, the lookup function receives a
 * memoized version of itself if it needs to perform recursion. It also receives a flag indicating
 * whether circularity was detected. In that case, the memoized version of the function is not
 * passed as recursion should be stopped to avoid an infinite loop. The output of the function must
 * contain the result of the lookup and a boolean indicating whether the result should be stored in
 * the cache. Note that when isCircular is true, the result is not stored in the cache even if the
 * result of the function indicates it should.
 *
 * @category Models
 */
export type LookUp<A, B> = ({
	key,
	memoized,
	isCircular
}:
	| { readonly key: A; readonly memoized: undefined; readonly isCircular: true }
	| { readonly key: A; readonly memoized: (a: A) => B; readonly isCircular: false }) => MTypes.Pair<
	B,
	boolean
>;

/**
 * Type that represents a Cache
 *
 * @category Models
 */
export interface Type<in out A, in out B> extends Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The key/value cache. A None value means the value is currently under calculation. A circular
	 * flag will be sent if the value needs to be retreived while it is being calculated.
	 */
	readonly store: MutableHashMap.MutableHashMap<A, Option.Option<ValueContainer.Type<B>>>;
	/**
	 * A queue used to track the order in which keys were inserted so as to remove the oldest keys
	 * first in case the cache has bounded capacity
	 */
	readonly keyOrder: MutableQueue.MutableQueue<A>;
	/** The lookup function used to populate the cache */
	readonly lookUp: LookUp<A, B>;
	/** The capicity of the cache. If undefined, the cache is unbounded */
	readonly capacity: number | undefined;
	/** The lifespan of the values in the cache. If undefined, the values never expire */
	readonly lifeSpan: number | undefined;
	/** @internal */
	readonly [_TypeId]: {
		readonly _A: Types.Invariant<A>;
		readonly _B: Types.Invariant<B>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown, unknown> => Predicate.hasProperty(u, _TypeId);

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any, any>> = {
	[_TypeId]: {
		_A: MTypes.invariantValue,
		_B: MTypes.invariantValue
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Creates a new cache. The lookup function is used to populate the cache. If the capacity is
 * undefined, the cache is unbounded. If the lifespan is undefined, the values never expire. Keys
 * are compared using Equal.equals.
 *
 * @category Constructors
 * @example
 * 	import { MCache, MTypes } from '@parischap/effect-lib';
 * 	import { Record, Tuple, pipe } from 'effect';
 *
 * 	export const nonRecursiveCache = MCache.make({
 * 		lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true)
 * 	});
 *
 * 	interface RecursiveStructure {
 * 		// eslint-disable-next-line functional/prefer-readonly-type
 * 		[key: string]: string | RecursiveStructure;
 * 	}
 *
 * 	export const recursiveCache = MCache.make<RecursiveStructure, string>({
 * 		lookUp: ({ key, memoized, isCircular }) =>
 * 			isCircular ?
 * 				Tuple.make(`Circular`, false)
 * 			:	Tuple.make(
 * 					pipe(
 * 						key,
 * 						Record.reduce('', (acc, value) =>
 * 							MTypes.isString(value) ? acc + value : acc + memoized(value)
 * 						)
 * 					),
 * 					true
 * 				),
 * 		capacity: 2
 * 	});
 */
export const make = <A, B>({
	lookUp,
	capacity = undefined,
	lifeSpan = undefined
}: {
	readonly lookUp: LookUp<A, B>;
	readonly capacity?: number;
	readonly lifeSpan?: number;
}) =>
	_make({
		lookUp,
		capacity,
		lifeSpan,
		store: MutableHashMap.empty<A, Option.Option<ValueContainer.Type<B>>>(),
		keyOrder: MutableQueue.unbounded<A>()
	});

/**
 * Gets a value from the cache. If the value is not in the cache (value comparison is based on
 * Equal.equals), the lookup function is called to populate the cache. If it is in the cache but is
 * too old,the lookup function is called to refresh it.
 *
 * @category Destructors
 * @example
 * 	import { MCache } from '@parischap/effect-lib';
 * 	import { Tuple } from 'effect';
 *
 * 	const testCache = MCache.make({
 * 		lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true)
 * 	});
 *
 * 	assert.deepStrictEqual(MCache.get(3)(testCache), 6);
 */
export const get =
	<A>(a: A) =>
	<B>(self: Type<A, B>): B => {
		const now = MTypes.isUndefined(self.lifeSpan) ? 0 : Date.now();
		const store = self.store;
		const keyOrder = self.keyOrder;
		return pipe(
			store,
			MutableHashMap.get(a),
			Option.match({
				onNone: () => {
					/* eslint-disable-next-line functional/no-expression-statements */
					MutableHashMap.set(store, a, Option.none());
					const [result, storeInCache] = self.lookUp({
						key: a,
						memoized: (a) => get(a)(self),
						isCircular: false
					});
					if (storeInCache) {
						/* eslint-disable-next-line functional/no-expression-statements */
						MutableHashMap.set(
							store,
							a,
							Option.some(ValueContainer.make({ value: result, storeDate: now }))
						);
						if (self.capacity !== undefined) {
							/* eslint-disable-next-line functional/no-expression-statements */
							MutableQueue.offer(keyOrder, a);
							if (MutableQueue.length(keyOrder) > self.capacity) {
								/* eslint-disable-next-line functional/no-expression-statements */
								MutableHashMap.remove(
									store,
									MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue)
								);
							}
						}
						/* eslint-disable-next-line functional/no-expression-statements */
					} else MutableHashMap.remove(store, a);
					return result;
				},
				onSome: Option.match({
					onNone: () =>
						pipe({ key: a, memoized: undefined, isCircular: true }, self.lookUp, Tuple.getFirst),
					onSome: (valueContainer) => {
						if (
							self.lifeSpan !== undefined &&
							// if lifespan===0, we don't do the test because it could return false if the two values are stored in the same millisecond.
							(self.lifeSpan === 0 || now - valueContainer.storeDate > self.lifeSpan)
						) {
							if (self.capacity !== undefined) {
								let head = MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue);
								while (!Equal.equals(a, head)) {
									/* eslint-disable-next-line functional/no-expression-statements */
									MutableHashMap.remove(store, head);
									/* eslint-disable-next-line functional/no-expression-statements */
									head = MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue);
								}
							}
							/* eslint-disable-next-line functional/no-expression-statements */
							MutableHashMap.set(store, a, Option.none());
							const [result, storeInCache] = self.lookUp({
								key: a,
								memoized: (a) => get(a)(self),
								isCircular: false
							});
							if (storeInCache) {
								/* eslint-disable-next-line functional/no-expression-statements */
								MutableHashMap.set(
									store,
									a,
									Option.some(ValueContainer.make({ value: result, storeDate: now }))
								);
								if (self.capacity !== undefined)
									/* eslint-disable-next-line functional/no-expression-statements */
									MutableQueue.offer(keyOrder, a);
								/* eslint-disable-next-line functional/no-expression-statements */
							} else MutableHashMap.remove(store, a);
							return result;
						} else {
							return valueContainer.value;
						}
					}
				})
			})
		);
	};

/**
 * Returns a function that gets a value from the `self`
 *
 * @category Destructors
 */
export const toGetter =
	<A, B>(self: Type<A, B>): MTypes.OneArgFunction<A, B> =>
	(a) =>
		pipe(self, get(a));

/**
 * Returns an array of the keys whose value is currently stored in the cache
 *
 * @category Destructors
 */
export const keysInStore = <A, B>(self: Type<A, B>): Array<A> =>
	pipe(
		self.store,
		Array.fromIterable,
		Array.filter(flow(Tuple.getSecond, Option.isSome)),
		Array.map(Tuple.getFirst)
	);
