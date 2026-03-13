/**
 * Module that defines `CacheLookUp<A, B>`, the type of the lookup function used by a `Cache`. In
 * addition to the value of type A, the lookup function receives a memoized version of itself if it
 * needs to perform recursion. It also receives a flag indicating whether circularity was detected.
 * In that case, the memoized version of the function is not passed as recursion should be stopped
 * to avoid an infinite loop. The output of the function must contain the result of applying the
 * value of type A to the lookup function and a boolean indicating whether the result should be
 * stored in the cache. Note that when isCircular is true, the result is not stored in the cache
 * even if the result of the function indicates it should.
 */

import type * as MTypes from '../Types/types.js';

/**
 * Type that represents the lookup function of a Cache
 *
 * @category Models
 */
export interface Type<A, B> extends MTypes.OneArgFunction<
  | { readonly key: A; readonly memoized: undefined; readonly isCircular: true }
  | { readonly key: A; readonly memoized: (a: A) => B; readonly isCircular: false },
  MTypes.Pair<B, boolean>
> {}
