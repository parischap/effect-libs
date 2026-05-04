/**
 * Mutable cache with optional bounded capacity and optional time-to-live built around a user-supplied
 * lookup function. The lookup function may be recursive, in which case the cache is also used to
 * detect circularity.
 *
 * ## Mental model
 *
 * - **`Type<A, B>`** is a mutable store mapping keys of type `A` to values of type `B`, populated
 *   on demand by `lookUp`.
 * - Keys are compared with `Equal.equals` (the underlying store is a `MutableHashMap`).
 * - Eviction is FIFO: when capacity is exceeded the oldest insertion is evicted first.
 * - When `lifeSpan` elapses for an entry, the next read triggers a fresh lookup; entries inserted
 *   before the expired one are also evicted in the process to keep insertion order consistent with
 *   age.
 *
 * ## Common tasks
 *
 * - **Construct**: {@link make}
 * - **Read**: {@link get}, {@link toGetter}
 * - **Inspect**: {@link toKeys}
 *
 * ## Gotchas
 *
 * - The cache is **mutable** — `get` mutates the underlying store. Sharing a cache across fibers
 *   without external coordination is unsafe.
 * - When the lookup function is recursive, capacity may be temporarily exceeded: every key in the
 *   recursion chain is reserved (with an empty entry) before a result is produced, so a chain of
 *   `n` recursive calls reserves `n` entries even past `capacity`. Excess entries are reclaimed
 *   once the recursion unwinds.
 * - When `isCircular` is `true`, the value returned by `lookUp` is **never** stored, regardless of
 *   the second tuple element.
 *
 * ## Quickstart
 *
 * **Example** (Basic cache usage)
 *
 * ```ts
 * import { Tuple, pipe } from 'effect';
 * import * as MCache from '@parischap/effect-lib/MCache';
 *
 * const cache = MCache.make({
 *   lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 * });
 *
 * console.log(pipe(cache, MCache.get(5))); // 10
 * ```
 *
 * @see {@link make} — create a new cache
 */
import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as MutableHashMap from 'effect/MutableHashMap';
import * as MutableList from 'effect/MutableList';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

import * as MData from './Data/Data.js';
import * as MCacheValueContainer from './internal/CacheValueContainer.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Cache/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of the lookup function passed to {@link make}. The lookup receives a record carrying the
 * `key` to look up, an `isCircular` flag, and a `memoized` callback that re-enters the cache
 * recursively when `isCircular` is `false`.
 *
 * - The function returns a `[result, storeInCache]` tuple. `storeInCache` only acts as a hint:
 *   when `isCircular` is `true`, the value is never stored regardless of `storeInCache`.
 * - Use the `memoized` parameter inside the lookup body to recurse through the cache instead of
 *   calling the lookup directly; this enables circularity detection.
 *
 * @category Models
 */
export interface LookUp<A, B> extends MTypes.OneArgFunction<
  | { readonly key: A; readonly memoized: undefined; readonly isCircular: true }
  | { readonly key: A; readonly memoized: (a: A) => B; readonly isCircular: false },
  MTypes.Pair<B, boolean>
> {}

/**
 * Type of a cache.
 *
 * @category Models
 */
export class Type<in out A, in out B> extends MData.Class {
  /**
   * The underlying store. A key mapped to `Option.none` means a lookup is currently in progress
   * (used to detect circular recursion).
   */
  readonly store: MutableHashMap.MutableHashMap<A, Option.Option<MCacheValueContainer.Type<B>>>;

  /**
   * The order in which keys were inserted, used to evict the oldest first when the cache reaches
   * its capacity.
   */
  readonly keyListInOrder: MutableList.MutableList<A>;

  /** The lookup function used to populate the cache. */
  readonly lookUp: LookUp<A, B>;

  /**
   * The capacity of the cache. `Infinity` means unbounded; `NaN` or a negative value is normalized
   * to `0`.
   */
  readonly capacity: number;

  /**
   * The lifespan of cached values, in milliseconds. `Infinity` means values never expire; `NaN` or
   * a negative value is normalized to `0`. A `0` lifespan means every subsequent lookup considers
   * the entry expired.
   */
  readonly lifeSpan: number;

  /** Class constructor. */
  private constructor(params: MTypes.Data<Type<A, B>>) {
    super();
    this.store = params.store;
    this.keyListInOrder = params.keyListInOrder;
    this.lookUp = params.lookUp;
    this.capacity = params.capacity;
    this.lifeSpan = params.lifeSpan;
  }

  /** Static constructor. */
  static make<A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> {
    return new Type(params);
  }

  /** Returns the `id` of `this`. */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Returns the TypeMarker of the class. */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Builds a new cache backed by `lookUp`.
 *
 * - Use to wrap an expensive function in a cache. Keys are compared with `Equal.equals`.
 * - `capacity` defaults to `Infinity` (unbounded).
 * - `lifeSpan` defaults to `Infinity` (entries never expire).
 *
 * **Example** (Bounded cache with TTL)
 *
 * ```ts
 * import { Tuple } from 'effect';
 * import * as MCache from '@parischap/effect-lib/MCache';
 *
 * const cache = MCache.make({
 *   lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 *   capacity: 100,
 *   lifeSpan: 60_000, // 1 minute
 * });
 * ```
 *
 * @category Constructors
 */
export const make = <A, B>({
  lookUp,
  capacity = Infinity,
  lifeSpan = Infinity,
}: {
  readonly lookUp: LookUp<A, B>;
  readonly capacity?: number;
  readonly lifeSpan?: number;
}): Type<A, B> =>
  Type.make({
    lookUp,
    capacity: Number.Number.isNaN(capacity) || capacity < 0 ? 0 : capacity,
    lifeSpan: Number.Number.isNaN(lifeSpan) || lifeSpan < 0 ? 0 : lifeSpan,
    store: MutableHashMap.empty(),
    keyListInOrder: MutableList.make(),
  });

/**
 * Reads the value associated with `a` from `self`. Triggers a lookup when the key is missing or
 * its entry has expired.
 *
 * - Keys are compared with `Equal.equals`.
 * - When the lookup is already in progress for `a` (recursive call), `lookUp` is invoked with
 *   `isCircular: true` and the returned value is not stored.
 * - On expiration of an entry, every entry inserted before it is evicted as well to keep the
 *   FIFO insertion order in sync with element age.
 *
 * **Example** (Reading from the cache)
 *
 * ```ts
 * import { Tuple, pipe } from 'effect';
 * import * as MCache from '@parischap/effect-lib/MCache';
 *
 * const cache = MCache.make({
 *   lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 * });
 *
 * console.log(pipe(cache, MCache.get(5))); // 10
 * ```
 *
 * @see {@link toGetter} — return a reusable getter bound to a cache
 *
 * @category Utils
 */
export const get =
  <A>(a: A) =>
  <B>(self: Type<A, B>): B => {
    const { lifeSpan, capacity, store, keyListInOrder } = self;
    const now = Number.Number.isFinite(lifeSpan) ? Date.now() : 0;
    const hasBoundedCapacity = Number.Number.isFinite(capacity);

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
              MutableList.append(keyListInOrder, a);
              if (keyListInOrder.length > capacity) {
                MutableHashMap.remove(store, MutableList.take(keyListInOrder));
              }
            }
          } else MutableHashMap.remove(store, a);
          return result;
        },
        onSome: Option.match({
          onNone: () =>
            pipe({ key: a, memoized: undefined, isCircular: true }, self.lookUp, Tuple.get(0)),
          onSome: (valueContainer) => {
            if (
              // if lifespan===0, we don't do the test because it could return false if the two values are stored in the same millisecond.
              lifeSpan <= 0 ||
              now - valueContainer.storeDate > lifeSpan
            ) {
              if (hasBoundedCapacity) {
                let head = MutableList.take(keyListInOrder);
                while (!Equal.equals(a, head)) {
                  MutableHashMap.remove(store, head);

                  head = MutableList.take(keyListInOrder);
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
                if (hasBoundedCapacity) MutableList.append(keyListInOrder, a);
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
 * Returns a getter bound to `self`, suitable for point-free lookups.
 *
 * - Use when the same cache will be queried by many call sites and you want to capture it once.
 * - Equivalent to `(a) => MCache.get(a)(self)`.
 *
 * **Example** (Reusable getter)
 *
 * ```ts
 * import { Tuple } from 'effect';
 * import * as MCache from '@parischap/effect-lib/MCache';
 *
 * const cache = MCache.make({
 *   lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 * });
 * const lookup = MCache.toGetter(cache);
 *
 * console.log(lookup(5)); // 10
 * ```
 *
 * @see {@link get} — single-shot read
 *
 * @category Utils
 */
export const toGetter =
  <A, B>(self: Type<A, B>): MTypes.OneArgFunction<A, B> =>
  (a) =>
    pipe(self, get(a));

/**
 * Returns the keys whose value is currently present in the cache.
 *
 * - Keys whose lookup is in progress (i.e. mapped to `Option.none`) are excluded.
 * - The order of the returned array reflects the iteration order of the underlying
 *   `MutableHashMap`, which is implementation-defined.
 *
 * **Example** (Listing cached keys)
 *
 * ```ts
 * import { Tuple, pipe } from 'effect';
 * import * as MCache from '@parischap/effect-lib/MCache';
 *
 * const cache = MCache.make({
 *   lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
 * });
 *
 * pipe(cache, MCache.get(1));
 * pipe(cache, MCache.get(2));
 * console.log(MCache.toKeys(cache)); // [1, 2]
 * ```
 *
 * @category Utils
 */
export const toKeys = <A, B>(self: Type<A, B>): Array<A> =>
  pipe(
    self.store,
    Array.fromIterable,
    Array.filter(flow(Tuple.get(1), Option.isSome)),
    Array.map(Tuple.get(0)),
  );
