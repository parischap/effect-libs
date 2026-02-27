/**
 * Type of the action of a ByPasser. The action takes as input a ValueBasedStylerConstructor (see
 * ValueBasedStylerConstructor.ts) and a MarkShowerConstructor (see MarkShowerConstructor.ts). If
 * the action returns a value of type `Some<PPStringifiedValue.Type>`, this `PPStringifiedValue` is
 * used as is to represent the input value. If it returns a `none`, the normal stringification
 * process is applied.
 */

import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Option from 'effect/Option'
import type * as PPValue from '../internal/stringification/Value.js';
import type * as PPStringifiedValue from '../stringification/StringifiedValue.js';
import type * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import type * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';

/**
 * Type of a PPByPasserAction
 *
 * @category Models
 */

export interface Type {
  ({
    valueBasedStylerConstructor,
    markShowerConstructor,
  }: {
    readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
    readonly markShowerConstructor: PPMarkShowerConstructor.Type;
  }): MTypes.OneArgFunction<PPValue.Any, Option.Option<PPStringifiedValue.Type>>;
}
