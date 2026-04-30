/** Alias for a map of PPStyle's (see Style.ts). The keys of the map are PartNames (see PartNames.ts) */

import { flow } from 'effect';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPPartName from '../../Parameters/PartName.js';
import type * as PPStyle from '../../Parameters/Style.js';

/**
 * Type of a PPStyles
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<PPPartName.Type, PPStyle.Type> {}

/**
 * Returns the PPStyle associated with `partName` which identifies a part of a stringified value.
 * Returns `ASContextStyler.none` if `partName` is not present in `self`.
 *
 * @category Destructors
 */
export const get = (partName: PPPartName.Type): MTypes.OneArgFunction<Type, PPStyle.Type> =>
  flow(
    HashMap.get(partName),
    Option.getOrElse(() => ASContextStyler.none),
  );
