/**
 * Module that implements a class that defines a default behavior for:
 *
 * - the Effect Inspectable interface: if the id function returns a string `_id`, instances of the
 *   class will display by calling JSON.stringify on an object that contain all the own enumerable
 *   keys of the instance preceeded by an extra `_id` key having `_id` as value. If the id function
 *   return a function f, they will display as the result of calling `this.f()`
 * - the Effect Pipeable interface
 *
 * Since this class does not implement the Effect Equal.Equal interface, two instances of that class
 * will only be equal with the Equal.equals operator if they are the same object
 */

import { Inspectable, Pipeable } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/Base/';

/**
 * Symbol used to name the id function
 *
 * @category Model symbols
 */
export const idSymbol: unique symbol = Symbol.for(`${moduleTag}id/`) as idSymbol;
type idSymbol = typeof idSymbol;

/**
 * Type of an MDataBase
 *
 * @category Models
 */
export type Type = Pipeable.Pipeable
  & Inspectable.Inspectable & { [idSymbol](): string | (() => string) };

/**
 * Type of a DataBase
 *
 * @category Models
 */
export abstract class Class extends Pipeable.Class() implements Type {
  /**
   * Returns the `id` of `this`. If it returns a string, the `.toString()` function will return that
   * string under the `_id` key, and then all the own enumerable string keys of the instance. If it
   * returns a function, the result of calling this function will be the result of the `.toString()`
   * function
   */
  abstract [idSymbol](): string | (() => string);

  /** Returns the properties of `this` to stringify */
  toJSON(): unknown {
    const id = this[idSymbol]();
    return typeof id === 'string' ? Object.assign({ _id: id }, this) : id.call(this);
  }

  /** Necessary for the Inspectable interface, but not sure what this is for */
  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON();
  }

  /** Returns a printable version of this */
  override toString(): string {
    const id = this[idSymbol]();
    return typeof id === 'string' ?
        Inspectable.format(Object.assign({ _id: id }, this))
      : id.call(this);
  }
}
