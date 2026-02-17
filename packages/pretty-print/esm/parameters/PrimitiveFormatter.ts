/**
 * This module implements a type that takes care of the formatting of primitive values, e.g.
 * surround strings in quotes, add 'n' at the end of a bigint, display numbers with a thousand
 * separator,...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import * as MFunction from '@parischap/effect-lib/MFunction'
import * as MInspectable from '@parischap/effect-lib/MInspectable'
import * as MMatch from '@parischap/effect-lib/MMatch'
import * as MPipeable from '@parischap/effect-lib/MPipeable'
import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Either from 'effect/Either'
import * as Equal from 'effect/Equal'
import * as Equivalence from 'effect/Equivalence'
import * as Function from 'effect/Function'
import * as Hash from 'effect/Hash'
import * as Number from 'effect/Number'
import * as Pipeable from 'effect/Pipeable'
import * as Predicate from 'effect/Predicate'
import * as String from 'effect/String'
import * as Struct from 'effect/Struct'
import type * as PPOption from './Option.js';
import * as PPValue from './Value.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/PrimitiveFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a PrimitiveFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
  /**
   * Type of the action of a PrimitiveFormatter. The action takes a Primitive value (see Value.ts)
   * and returns an unstyled string representing that value.
   */
  export interface Type {
    (this: PPOption.Type, value: PPValue.Primitive): string;
  }
}

/**
 * Type that represents a PrimitiveFormatter
 *
 * @category Models
 */
export interface Type extends Action.Type, Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
  /** Id of this PrimitiveFormatter instance. Useful for equality and debugging */
  readonly id: string;

  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  [Equal.symbol](this: Type, that: unknown): boolean {
    return has(that) && equivalence(this, that);
  },
  [Hash.symbol](this: Type) {
    return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
  },
  [MInspectable.IdSymbol](this: Type) {
    return this.id;
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
  Object.assign(MFunction.clone(action), {
    id,
    ...base,
  });

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * PropertyFormatter contructor that builds an instance that works like util.inspect
 *
 * @category Constructors
 */
export const utilInspectLikeMaker = (
  {
    id,
    maxStringLength,
    numberFormatter,
  }: {
    readonly id: string;
    readonly maxStringLength: number;
    readonly numberFormatter: Intl.NumberFormat;
  } = { id: 'UtilInspectLike', maxStringLength: 10_000, numberFormatter: new Intl.NumberFormat() },
): Type =>
  make({
    id,
    action: flow(
      PPValue.content,
      MMatch.make,
      MMatch.when(
        MTypes.isString,
        flow(
          Either.liftPredicate(
            flow(String.length, Number.greaterThan(maxStringLength)),
            Function.identity,
          ),
          Either.map(flow(String.takeLeft(maxStringLength), MString.append('...'))),
          Either.merge,
          MString.append("'"),
          MString.prepend("'"),
        ),
      ),
      MMatch.when(
        MTypes.isNumber,
        flow((n) => numberFormatter.format(n)),
      ),
      MMatch.when(
        MTypes.isBigInt,
        flow((n) => numberFormatter.format(n), MString.append('n')),
      ),
      MMatch.orElse(MString.fromPrimitive),
    ),
  });
