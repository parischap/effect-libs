/**
 * This module implements a `CVTemplatePartSeparator` type which is one of the constituents of
 * `CVTemplate`'s (see Template.ts and TemplatePart.ts)
 */

import { MData, MInputError, MString, MTypes } from '@parischap/effect-lib';
import { Either, pipe, Struct } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/TemplatePart/Separator/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a Separator
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** The string representing this separator */
  readonly value: string;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.value;
    };
  }

  /** Class constructor */
  private constructor({ value }: MTypes.Data<Type>) {
    super();
    this.value = value;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (value: string): Type => _make({ value });

/**
 * Builds a parser that implements this `CVTemplatePartSeparator`
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
