/**
 * Type of the action of a ByPasser. The action takes as input a PPParameters (stringification
 * parameters) and the Value being currently printed. If the action returns a value of type
 * `Some<PPStringifiedValue.Type>`, this `PPStringifiedValue` is used as is to represent the input
 * value. If it returns a `none`, the normal stringification process is applied.
 */

import { MTypes } from '@parischap/effect-lib';
import { Option } from 'effect';
import type * as PPValue from '../internal/stringification/Value.js';
import type * as PPStringifiedValue from '../stringification/StringifiedValue.js';
import type * as PPByPasser from './ByPasser.js';
import type * as PPStyleMap from './StyleMap.js';

/**
 * Type of a PPByPasserAction
 *
 * @category Models
 */

export interface Type {
  (
    this: PPByPasser.Type,
    styleMap: PPStyleMap.Type,
  ): MTypes.OneArgFunction<PPValue.Any, Option.Option<PPStringifiedValue.Type>>;
}
