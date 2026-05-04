/**
 * Two-valued enum used by string-padding helpers to choose the side that gets filled.
 *
 * ## Mental model
 *
 * - **`Type.Left`** indicates that filler is added on the **left** of the source string (the
 *   characters of `self` end up flush right).
 * - **`Type.Right`** indicates the symmetric case.
 * - Pair this enum with {@link "./String.js" | `MString.pad`} / `MString.trim`.
 *
 * ## Quickstart
 *
 * **Example** (Right-aligned padding)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/MString';
 * import * as MStringFillPosition from '@parischap/effect-lib/String/StringFillPosition';
 *
 * console.log(
 *   pipe(
 *     '42',
 *     MString.pad({ length: 5, fillChar: '0', fillPosition: MStringFillPosition.Type.Left }),
 *   ),
 * );
 * // '00042'
 * ```
 */
import { flow } from 'effect';
import * as Function from 'effect/Function';

import type * as MTypes from '../types/types.js';

import * as MMatch from '../Match.js';

/**
 * Enum of fill positions.
 *
 * @category Models
 */
export enum Type {
  Right = 0,
  Left = 1,
}

/**
 * Returns the lowercase string representation of `self` (`'left'` or `'right'`).
 *
 * **Example**
 *
 * ```ts
 * import * as MStringFillPosition from '@parischap/effect-lib/String/StringFillPosition';
 *
 * console.log(MStringFillPosition.toString(MStringFillPosition.Type.Left)); // 'left'
 * ```
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = flow(
  MMatch.make,
  MMatch.whenIs(Type.Right, Function.constant('right')),
  MMatch.whenIs(Type.Left, Function.constant('left')),
  MMatch.exhaustive,
);
