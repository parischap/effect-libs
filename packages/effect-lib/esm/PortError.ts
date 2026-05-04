/**
 * Tagged error type used to capture exceptions thrown by native JavaScript functions when those
 * functions are ported to the Effect world (e.g. `JSON.parse`, `JSON.stringify`).
 *
 * ## Mental model
 *
 * - **`Type`** is a `Data.TaggedError` that wraps a thrown value (`originalError`) together with
 *   context describing where the throw came from (`originalFunctionName`, `moduleName`,
 *   `libraryName`).
 * - Use this error in `Effect.try` (or equivalent) `catch` handlers to keep the original
 *   exception inspectable while moving error handling out of the throw/catch axis.
 *
 * ## Quickstart
 *
 * **Example** (Wrap a throwing native API)
 *
 * ```ts
 * import { Effect } from 'effect';
 * import * as MPortError from '@parischap/effect-lib/MPortError';
 *
 * const safeJSONParse = (s: string) =>
 *   Effect.try({
 *     try: () => JSON.parse(s),
 *     catch: (e) =>
 *       new MPortError.Type({
 *         originalError: e,
 *         originalFunctionName: 'JSON.parse',
 *         moduleName: 'my-module.ts',
 *         libraryName: 'my-app',
 *       }),
 *   });
 * ```
 *
 * @see {@link Type} — the tagged error
 */

import * as Data from 'effect/Data';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/PortError/';

/**
 * Tagged error wrapping an exception thrown by a native function call. Carries the original
 * thrown value plus contextual identifiers to help locate the source.
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
  readonly originalError: unknown;
  readonly originalFunctionName: string;
  readonly moduleName: string;
  readonly libraryName: string;
}> {}
