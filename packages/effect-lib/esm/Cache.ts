/**
 * This module implements a mutable cache with an optional capacity and an optional time-to-live for
 * the result of a function called lookup function that takes values of type A and returns values of
 * type B. The lookup function may be recursive. The cache capacity may temporarily be exceeded if
 * the lookup function is recursive (because the cache is also used to determine circularity).
 * Values of type A are compared using the Effect Equal.equals operator for caching purposes
 * (because it uses a MutableHashMap under the hood for the store implementation)
 */
import { Array, Equal, MutableHashMap, MutableList, Option, Tuple, flow, pipe } from 'effect';
import * as MData from './Data/index.js';
import * as MCacheValueContainer from './internal/CacheValueContainer.js';
import * as MNumber from './Number.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Cache/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents the lookup function. In addition to the value of type A, the lookup function
 * receives a memoized version of itself if it needs to perform recursion. It also receives a flag
 * indicating whether circularity was detected. In that case, the memoized version of the function
 * is not passed as recursion should be stopped to avoid an infinite loop. The output of the
 * function must contain the result of applying the value of type A to the lookup function and a
 * boolean indicating whether the result should be stored in the cache. Note that when isCircular is
 * true, the result is not stored in the cache even if the result of the function indicates it
 * should.
 *
 * @category Models
 */
export type LookUp<A, B> = ({
  key,
  memoized,
  isCircular,
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
export class Type<in out A, in out B> extends MData.Class {
  /**
   * The lookup function cache associating values of type A to values of type B. A `None` B value
   * means the B value is currently under calculation. A circular flag will be sent if the value
   * needs to be retreived while it is being calculated.
   */
  readonly store: MutableHashMap.MutableHashMap<A, Option.Option<MCacheValueContainer.Type<B>>>;

  /**
   * A list used to track the order in which values of type A were inserted in the store so as to
   * remove the oldest keys first in case the cache has bounded capacity
   */
  readonly keyListInOrder: MutableList.MutableList<A>;

  /** The lookup function used to populate the cache */
  readonly lookUp: LookUp<A, B>;

  /**
   * The capicity of the cache. If `Infinity` is passed, the cache is unbounded. If `NaN` or a
   * negative value is passed, capacity is set to 0
   */
  readonly capacity: number;

  /**
   * The lifespan of the values in the cache. If `Infinity` is passed, the values never expire. If
   * `NaN` or a negative value is passed, the lifespan is set to 0
   */
  readonly lifeSpan: number;

  /** Class constructor */
  private constructor(params: MTypes.Data<Type<A, B>>) {
    super();
    this.store = params.store;
    this.keyListInOrder = params.keyListInOrder;
    this.lookUp = params.lookUp;
    this.capacity = params.capacity;
    this.lifeSpan = params.lifeSpan;
  }

  /** Static constructor */
  static make<A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Creates a new cache. The lookup function is used to populate the cache. If the capacity is
 * undefined, the cache is unbounded. If the lifespan is undefined, the values never expire. Keys
 * are compared using Equal.equals.
 *
 * @category Constructors
 * @example
 *   import { MCache, MTypes } from '@parischap/effect-lib';
 *   import { Record, Tuple, pipe } from 'effect';
 *
 *   export const nonRecursiveCache = MCache.make({
 *     lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 *   });
 *
 *   interface RecursiveStructure {
 *     [key: string]: string | RecursiveStructure;
 *   }
 *
 *   export const recursiveCache = MCache.make<RecursiveStructure, string>({
 *     lookUp: ({ key, memoized, isCircular }) =>
 *       isCircular ?
 *         Tuple.make(`Circular`, false)
 *       : Tuple.make(
 *           pipe(
 *             key,
 *             Record.reduce('', (acc, value) =>
 *               MTypes.isString(value) ? acc + value : acc + memoized(value),
 *             ),
 *           ),
 *           true,
 *         ),
 *     capacity: 2,
 *   });
 */
export const make = <A, B>({
  lookUp,
  capacity = Infinity,
  lifeSpan = Infinity,
}: {
  readonly lookUp: LookUp<A, B>;
  readonly capacity?: number;
  readonly lifeSpan?: number;
}) =>
  Type.make({
    lookUp,
    capacity: Number.isNaN(capacity) || capacity < 0 ? 0 : capacity,
    lifeSpan: Number.isNaN(lifeSpan) || lifeSpan < 0 ? 0 : lifeSpan,
    store: MutableHashMap.empty<A, Option.Option<MCacheValueContainer.Type<B>>>(),
    keyListInOrder: MutableList.empty<A>(),
  });

/**
 * Gets a value from the cache. If the value is not in the cache (value comparison is based on
 * Equal.equals), the lookup function is called to populate the cache. If it is in the cache but is
 * too old,the lookup function is called to refresh it.
 *
 * @category Utils
 * @example
 *   import { MCache } from '@parischap/effect-lib';
 *   import { Tuple } from 'effect';
 *
 *   const testCache = MCache.make({
 *     lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 *   });
 *
 *   assert.deepStrictEqual(MCache.get(3)(testCache), 6);
 */
export const get =
  <A>(a: A) =>
  <B>(self: Type<A, B>): B => {
    const { lifeSpan, capacity, store, keyListInOrder } = self;
    const now = MNumber.isFinite(lifeSpan) ? Date.now() : 0;
    const hasBoundedCapacity = MNumber.isFinite(capacity);

    return pipe(
      store,
      MutableHashMap.get(a),
      Option.match({
        onNone: () => {
          MutableHashMap.set(store, a, Option.none());
          const [result, storeInCache] = self.lookUp({
            key: a,
            memoized: (a) => get(a)(self),
            isCircular: false,
          });
          if (storeInCache) {
            MutableHashMap.set(
              store,
              a,
              Option.some(MCacheValueContainer.make({ value: result, storeDate: now })),
            );
            if (hasBoundedCapacity) {
              MutableList.prepend(keyListInOrder, a);
              if (MutableList.length(keyListInOrder) > capacity) {
                MutableHashMap.remove(store, MutableList.pop(keyListInOrder));
              }
            }
          } else MutableHashMap.remove(store, a);
          return result;
        },
        onSome: Option.match({
          onNone: () =>
            pipe({ key: a, memoized: undefined, isCircular: true }, self.lookUp, Tuple.getFirst),
          onSome: (valueContainer) => {
            if (
              // if lifespan===0, we don't do the test because it could return false if the two values are stored in the same millisecond.
              lifeSpan <= 0
              || now - valueContainer.storeDate > lifeSpan
            ) {
              if (hasBoundedCapacity) {
                let head = MutableList.pop(keyListInOrder);
                while (!Equal.equals(a, head)) {
                  MutableHashMap.remove(store, head);

                  head = MutableList.pop(keyListInOrder);
                }
              }

              MutableHashMap.set(store, a, Option.none());
              const [result, storeInCache] = self.lookUp({
                key: a,
                memoized: (a) => get(a)(self),
                isCircular: false,
              });
              if (storeInCache) {
                MutableHashMap.set(
                  store,
                  a,
                  Option.some(MCacheValueContainer.make({ value: result, storeDate: now })),
                );
                if (hasBoundedCapacity) MutableList.prepend(keyListInOrder, a);
              } else MutableHashMap.remove(store, a);
              return result;
            }
            return valueContainer.value;
          },
        }),
      }),
    );
  };

/**
 * Returns a function that gets a value from the `self`
 *
 * @category Utils
 */
export const toGetter =
  <A, B>(self: Type<A, B>): MTypes.OneArgFunction<A, B> =>
  (a) =>
    pipe(self, get(a));

/**
 * Returns an array of the keys whose value is currently stored in the cache
 *
 * @category Utils
 */
export const keysInStore = <A, B>(self: Type<A, B>): Array<A> =>
  pipe(
    self.store,
    Array.fromIterable,
    Array.filter(flow(Tuple.getSecond, Option.isSome)),
    Array.map(Tuple.getFirst),
  );
