/* eslint functional/no-expression-statements: "off" */
import {
	Equal,
	Hash,
	Inspectable,
	MutableHashMap,
	MutableQueue,
	Option,
	Tuple,
	pipe
} from 'effect';
import * as MTypes from './types.js';

/**
 * This module implements a cache with a fixed capacity and time-to-live. The contents of the cache is populated by a lookup function which may be recursive. The cache capacity may temporarily be exceeded if the lookup function is recursive (because the cache is also used to determine circularity). Keys are compared using Equal.equals.
 */

/**
 * In addition to the key, the lookup function receives a memoized version of itself if it needs to perform recursion. It also receives a flag indicating whether circularity was detected. In that case, the memoized version of the function is not passed as recursion should be stopped to avoid an infinite loop. The output of the function must contain the result of the function and a boolean indicating whether the result should be stored in the cache. Note that when isCircular is true, the result is not stored in the cache even if the result of the function indicates it should.
 * @category models
 */
export type LookUp<A, B> = ({
	key,
	memoized,
	isCircular
}:
	| { readonly key: A; readonly memoized: undefined; readonly isCircular: true }
	// eslint-disable-next-line functional/prefer-readonly-type -- Return type
	| { readonly key: A; readonly memoized: (a: A) => B; readonly isCircular: false }) => [
	result: B,
	storeInCache: boolean
];

/**
 * @category models
 */
class ValueContainer<out B> implements Equal.Equal, Inspectable.Inspectable {
	readonly value: B;
	readonly storeDate: number;

	constructor({ value, storeDate }: MTypes.Data<ValueContainer<B>>) {
		this.value = value;
		this.storeDate = storeDate;
	}

	[Equal.symbol](that: unknown): boolean {
		return that instanceof ValueContainer && Equal.equals(that.value, this.value);
	}
	[Hash.symbol]() {
		return Hash.cached(this, Hash.hash(this.value));
	}
	toJSON() {
		return {
			value: Inspectable.toJSON(this.value),
			storeDate: Inspectable.toJSON(this.storeDate)
		};
	}
	[Inspectable.NodeInspectSymbol]() {
		return this.toJSON();
	}
	toString() {
		return Inspectable.format(this.toJSON());
	}
}

export { type ValueContainer };
export const makeValueContainer = <B>(params: MTypes.Data<ValueContainer<B>>) =>
	new ValueContainer(params);
/**
 * @category models
 */
class Type<in out A, in out B> {
	/**
	 * The key/value cache. A None means the value is currently nder calculation. A circular flag will be sent if the value needs to be retreived while it is being calculated.
	 */
	readonly store: MutableHashMap.MutableHashMap<A, Option.Option<ValueContainer<B>>>;
	/**
	 * A queue used to track the order in which keys were inserted so as to remove the oldest keys first in case the cache has bounded capacity
	 */
	readonly keyOrder: MutableQueue.MutableQueue<A>;
	/**
	 * The lookup function used to populate the cache
	 */
	readonly lookUp: LookUp<A, B>;
	/**
	 * The capicity ofthe cache. If undefined, the cache is unbounded
	 */
	readonly capacity: number | undefined;
	/**
	 * The lifespan of the values in the cache. If undefined, the values never expire
	 */
	readonly lifeSpan: number | undefined;

	constructor({
		lookUp,
		capacity,
		lifeSpan
	}: {
		readonly lookUp: LookUp<A, B>;
		readonly capacity?: number;
		readonly lifeSpan?: number;
	}) {
		this.store = MutableHashMap.empty();
		this.keyOrder = MutableQueue.unbounded();
		this.lookUp = lookUp;
		this.capacity = capacity;
		this.lifeSpan = lifeSpan;
	}
}

export { type Type };
/**
 * @category constructors
 */

/**
 * Creates a new cache. The lookup function is used to populate the cache. If the capacity is undefined, the cache is unbounded. If the lifespan is undefined,the values never expire. Keys are compared using Equal.equals.
 *  @category constructor
 */
export const make = <A, B>(params: {
	readonly lookUp: LookUp<A, B>;
	readonly capacity?: number;
	readonly lifeSpan?: number;
}) => new Type(params);

/**
 * Gets a value from the cache. If the value is not in the cache, the lookup function is called to populate the cache. If it is in the cache but is too old,the lookup function is called to refresh it.
 * @category utils
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
					MutableHashMap.set(store, a, Option.none());
					const [result, storeInCache] = self.lookUp({
						key: a,
						memoized: (a) => get(a)(self),
						isCircular: false
					});
					if (storeInCache) {
						MutableHashMap.set(
							store,
							a,
							Option.some(makeValueContainer({ value: result, storeDate: now }))
						);
						if (self.capacity !== undefined) {
							MutableQueue.offer(keyOrder, a);
							if (MutableQueue.length(keyOrder) > self.capacity) {
								MutableHashMap.remove(
									store,
									MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue)
								);
							}
						}
					} else MutableHashMap.remove(store, a);
					return result;
				},
				onSome: Option.match({
					onNone: () =>
						pipe({ key: a, memoized: undefined, isCircular: true }, self.lookUp, Tuple.getFirst),
					onSome: (valueContainer) => {
						if (self.lifeSpan !== undefined && now - valueContainer.storeDate > self.lifeSpan) {
							if (self.capacity !== undefined) {
								let head = MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue);
								while (!Equal.equals(a, head)) {
									MutableHashMap.remove(store, head);
									head = MutableQueue.poll(keyOrder, MutableQueue.EmptyMutableQueue);
								}
							}
							MutableHashMap.set(store, a, Option.none());
							const [result, storeInCache] = self.lookUp({
								key: a,
								memoized: (a) => get(a)(self),
								isCircular: false
							});
							if (storeInCache) {
								MutableHashMap.set(
									store,
									a,
									Option.some(makeValueContainer({ value: result, storeDate: now }))
								);
								if (self.capacity !== undefined) MutableQueue.offer(keyOrder, a);
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
