/** This module implements a PPMark, which is a piece of text that appears in a stringified value */

import { MData, MTypes } from '@parischap/effect-lib';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap//parameters/Mark/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPMark
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** The text to be displayed for this mark */
  readonly text: string;

  /**
   * The name of the part that this mark belongs to. Several marks can belong to the same part. The
   * partName is used to determine the style to apply for this mark (see PPStyleMap.ts).
   */
  readonly partName: string;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({ text, partName }: MTypes.Data<Type>) {
    super();
    this.text = text;
    this.partName = partName;
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

/**
 * Constructor of a PPMark
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);
