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
 * will only be equal with the Equal.equals operator if they are the same object. Hence the name,
 * ReferenceEquality
 */

import { Inspectable, Pipeable, Predicate } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/ReferenceEquality/';

/** Symbol used to name the id function */
export const idSymbol: unique symbol = Symbol.for(`${moduleTag}id/`) as idSymbol;
type idSymbol = typeof idSymbol;

/** Symbol used to name the type marker getter */
export const typeMarkerSymbol: unique symbol = Symbol.for(
  `${moduleTag}typeMarker/`,
) as typeMarkerSymbol;
type typeMarkerSymbol = typeof typeMarkerSymbol;

/** Symbol used to name the hasSameTypeMarkerAs function */
export const hasSameTypeMarkerAsSymbol: unique symbol = Symbol.for(
  `${moduleTag}hasSameTypeMarkerAs/`,
) as hasSameTypeMarkerAsSymbol;
type hasSameTypeMarkerAsSymbol = typeof hasSameTypeMarkerAsSymbol;

export abstract class Type<S extends symbol>
  extends Pipeable.Class()
  implements Inspectable.Inspectable, Pipeable.Pipeable
{
  /**
   * Function that returns the id of the class. If it returns a string, the `.toString()` function
   * will return that string under the `_id` key, and then all the own enumerable string keys of the
   * instance. If it returns a function, the result of calling this function will be the result of
   * the `.toString()` function
   */
  protected abstract [idSymbol](this: this): string | ((this: this) => string);

  /**
   * TypeMarker of the class. The typemarker makes sure that an object which has the same data as
   * instances of this class but which is not an instance of this class cannot be passed to
   * functions expecting instances of this class without triggering a type error
   */
  protected abstract get [typeMarkerSymbol](): S;

  /**
   * Predicate that returns true if `that` has the same type marker as this. It would be tempting to
   * make it a type guard. But two instances of the same generic class that have the same type
   * marker do not necessaraly have the same type
   */
  protected [hasSameTypeMarkerAsSymbol](this: this, that: unknown): boolean {
    return (
      Predicate.hasProperty(that, typeMarkerSymbol)
      && this[typeMarkerSymbol] === that[typeMarkerSymbol]
    );
  }

  /** Returns the properties of `this` to stringify */
  toJSON(this: this): unknown {
    const id = this[idSymbol]();
    return typeof id === 'string' ? Object.assign({ _id: id }, this) : id.call(this);
  }

  /** Necessary for the Inspectable interface, but not sure what this is for */
  [Inspectable.NodeInspectSymbol](this: this): unknown {
    return this.toJSON();
  }

  /** Returns a printable version of this */
  override toString(this: this): string {
    return Inspectable.format(this.toJSON());
  }
}
