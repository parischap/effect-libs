/**
 * This module implements a map of the different marks that appear in a value to stringify.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import * as MData from '@parischap/effect-lib/MData'
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as HashMap from 'effect/HashMap'
import * as Predicate from 'effect/Predicate'
import * as Struct from 'effect/Struct'
import * as PPMarks from '../internal/parameters/Marks.js';
import * as PPMark from './Mark.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/parampeters/MarkMap/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPMarkMap
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** Name of this MarkMap instance. Useful for equality and debugging. */
  readonly name: string;
  /** Map of the different marks that appear in a value to stringify */
  readonly marks: PPMarks.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, marks }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.marks = marks;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a PPMarkMap
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `marks` property of `self`
 *
 * @category Destructors
 */
export const marks: MTypes.OneArgFunction<Type, PPMarks.Type> = Struct.get('marks');

/**
 * Creates a MarkShowerConstructor that will return a MarkShower from `markName` and `option`.
 * Concretely, this markShower will display the text attached to markName in option.markMap using
 * the reversed action of the ValueBasedContextStyler attached to markName in option.markMap
 *
 * @category Constructors
 */
//sA REVOIR
export const get = (self: Type, name: string): Type => {
  const markShowerMap = HashMap.map(self.marks, ({ text, partName }) =>
    pipe(option.styleMap, PPStyleMap.get(partName), (contextStyler) =>
      contextStyler.withContextLast(text),
    ),
  );

  return (markName) =>
    pipe(
      markShowerMap,
      HashMap.get(markName),
      Option.getOrElse(() => PPMarkShower.empty),
    );
};

/**
 * Default MarkMap instance
 *
 * @category Instances
 */

export const utilInspectLike: Type = make({
  name: 'UtilInspectLike',
  marks: HashMap.make(
    ['FunctionNameStartDelimiter', PPMark.make({ text: 'Function: ', partName: 'Message' })],
    ['FunctionNameEndDelimiter', PPMark.make({ text: '', partName: 'Message' })],
    ['MessageStartDelimiter', PPMark.make({ text: '[', partName: 'Message' })],
    ['MessageEndDelimiter', PPMark.make({ text: ']', partName: 'Message' })],
    ['CircularObject', PPMark.make({ text: 'Circular *', partName: 'Message' })],
    ['CircularReferenceStartDelimiter', PPMark.make({ text: '<Ref *', partName: 'Message' })],
    ['CircularReferenceEndDelimiter', PPMark.make({ text: '> ', partName: 'Message' })],
    ['TabIndent', PPMark.make({ text: '  ', partName: 'Indentation' })],
    ['TreeIndentForFirstLineOfInitProps', PPMark.make({ text: '├─ ', partName: 'Indentation' })],
    ['TreeIndentForTailLinesOfInitProps', PPMark.make({ text: '│  ', partName: 'Indentation' })],
    ['TreeIndentForFirstLineOfLastProp', PPMark.make({ text: '└─ ', partName: 'Indentation' })],
    ['TreeIndentForTailLinesOfLastProp', PPMark.make({ text: '   ', partName: 'Indentation' })],
  ),
});
