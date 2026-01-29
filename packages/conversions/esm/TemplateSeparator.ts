/**
 * This module implements a `CVTemplateSeparator` type which is one of the constituents of
 * `CVTemplate`'s (see Template.ts and TemplatePart.ts)
 */

import { MInputError, MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';

import { Either, pipe, Pipeable, Predicate, Struct } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/TemplateSeparator/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * `CVTemplateSeparator` Type
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
  /** The string representing this separator */
  readonly value: string;

  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Proto */
const _proto: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  [MInspectable.IdSymbol](this: Type) {
    return this.value;
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(_proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (value: string): Type => _make({ value });

/**
 * Builds a parser that implements this `CVTemplateSeparator`
 *
 * @category Destructors
 */
export const toParser =
  (self: Type) =>
  (pos: number, text: string): Either.Either<string, MInputError.Type> => {
    const { value } = self;
    const { length } = value;
    return pipe(
      text,
      MInputError.assertStartsWith({
        startString: value,
        name: `remaining text for separator at position ${MString.fromNumber(10)(pos)}`,
      }),
      Either.map(MString.takeRightBut(length)),
    );
  };

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');

/**
 * Slash Separator instance
 *
 * @category Instances
 */
export const slash: Type = make('/');

/**
 * Backslash Separator instance
 *
 * @category Instances
 */
export const backslash: Type = make('\\');

/**
 * Dot Separator instance
 *
 * @category Instances
 */
export const dot: Type = make('.');

/**
 * Hyphen Separator instance
 *
 * @category Instances
 */
export const hyphen: Type = make('-');

/**
 * Colon Separator instance
 *
 * @category Instances
 */
export const colon: Type = make(':');

/**
 * Comma Separator instance
 *
 * @category Instances
 */
export const comma: Type = make(',');

/**
 * Space Separator instance
 *
 * @category Instances
 */
export const space: Type = make(' ');
