/** Module providing a tagged error type for wrapping exceptions thrown by native JavaScript functions ported to the Effect world. Captures the original error along with contextual information (function name, module, library). */

import * as Data from 'effect/Data';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/PortError/';

/**
 * Type of a Port Error
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
  readonly originalError: unknown;
  readonly originalFunctionName: string;
  readonly moduleName: string;
  readonly libraryName: string;
}> {}
