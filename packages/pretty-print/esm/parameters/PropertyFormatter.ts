/**
 * This module implements a type that takes care of the stringification of the properties of a
 * non-primitive value. From the stringified representation of the value of a property which it
 * receives, it must return the stringified representation of the whole property (key and value).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import type * as PPOption from './Option.js';

import { flow, pipe } from 'effect';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as Array from 'effect/Array';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';
import * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/PropertyFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a PropertyFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
  /**
   * Namespace of an initialized PropertyFormatter used as an action
   *
   * @category Models
   */
  export namespace Initialized {
    /**
     * Type of the action. The action takes as input the Value (see Value.ts) being currently
     * printed, a boolean that indicates if the value is a leaf (i.e. it could be stringified
     * without stringifying each of its properties) and the stringified representation of that value
     * (see StringifiedValue.ts) . Based on these two parameters, it must return a stringified
     * representation of the whole property.
     *
     * @category Models
     */
    export interface Type {
      ({
        value,
        isLeaf,
      }: {
        readonly value: PPValue.Any;
        readonly isLeaf: boolean;
      }): MTypes.OneArgFunction<PPStringifiedValue.Type>;
    }
  }

  /**
   * Type of the action. The action takes as input the current non-primitive formatting option, a
   * ValueBasedStylerConstructor (see ValueBasedStylerConstructor.ts), and a MarkShowerConstructor
   * (see MarkShowerConstructor.ts). Based on these parameters, it must return an Initialized
   * Action.
   *
   * @category Models
   */
  export interface Type {
    (
      option: PPOption.NonPrimitive.Type,
      {
        valueBasedStylerConstructor,
        markShowerConstructor,
      }: {
        readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
        readonly markShowerConstructor: PPMarkShowerConstructor.Type;
      },
    ): Initialized.Type;
  }
}

/**
 * Type that represents a PropertyFormatter.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PropertyFormatter instance. Useful for equality and debugging */
  readonly id: string;

  /** Action of this PropertyFormatter */
  readonly action: Action.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  private constructor({ id, action }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.action = action;
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
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * PropertyFormatter equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/**
 * Returns the `id` property of `self`
 *
 * @category Getters
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `action` property of `self`
 *
 * @category Getters
 */
export const action: MTypes.OneArgFunction<Type, Action.Type> = Struct.get('action');

/**
 * Applies `self`'s action with the given non-primitive option and styling constructors.
 *
 * @category Formatting
 */
export const apply =
  (self: Type) =>
  (option: PPOption.NonPrimitive.Type) =>
  ({
    valueBasedStylerConstructor,
    markShowerConstructor,
  }: {
    readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
    readonly markShowerConstructor: PPMarkShowerConstructor.Type;
  }): Action.Initialized.Type =>
    self.action(option, { valueBasedStylerConstructor, markShowerConstructor });

/**
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @category Instances
 */
export const valueOnly: Type = make({
  id: 'ValueOnly',
  action: (_option, _constructors) => MFunction.constIdentity,
});

/* if onSameLine=false and isLeaf=false , the lines of the value are appended to the lines of the key and no keyValueSeparator is used. In all other cases, the last line of the key and the first line of the value are merged and separated by the keyValueSeparator. */
const _keyAndValueAction =
  ({
    onSameLine,
    dontShowLeafValue,
  }: {
    readonly onSameLine: boolean;
    readonly dontShowLeafValue: boolean;
  }): Action.Type =>
  (option, { valueBasedStylerConstructor }) => {
    const propertyKeyTextFormatter = valueBasedStylerConstructor('PropertyKey');
    const prototypeDelimitersTextFormatter = valueBasedStylerConstructor('PrototypeDelimiters');
    const KeyValueSeparatorTextFormatter = valueBasedStylerConstructor('KeyValueSeparator');

    return ({ value, isLeaf }) => {
      const { stringKey } = value;
      const { protoDepth } = value;

      if (MTypes.isSingleton(stringKey) && String.isEmpty(stringKey[0])) return Function.identity;
      const inContextPropertyKeyTextFormatter = propertyKeyTextFormatter(value);
      const inContextPrototypeDelimitersTextFormatter = prototypeDelimitersTextFormatter(value);

      const keyValueSeparator = pipe(
        option.keyValueSeparatorMark,
        KeyValueSeparatorTextFormatter(value),
      );

      const key: PPStringifiedValue.Type = pipe(
        stringKey,
        Array.map((line, _i) => inContextPropertyKeyTextFormatter(line)),
        MFunction.fIfTrue({
          condition: protoDepth > 0,
          f: flow(
            PPStringifiedValue.prependToFirstLine(
              pipe(
                option.prototypeStartDelimiterMark,
                inContextPrototypeDelimitersTextFormatter,
                ASText.repeat(protoDepth),
              ),
            ),
            PPStringifiedValue.appendToLastLine(
              pipe(
                option.prototypeEndDelimiterMark,
                inContextPrototypeDelimitersTextFormatter,
                ASText.repeat(protoDepth),
              ),
            ),
          ),
        }),
      );

      return (stringifiedValue) => {
        if (!onSameLine && !isLeaf) return pipe(key, Array.appendAll(stringifiedValue));

        const firstLine = Array.headNonEmpty(stringifiedValue);
        const showValue = !isLeaf || !dontShowLeafValue;

        return pipe(
          key,
          Array.initNonEmpty,
          Array.append(
            pipe(
              key,
              // cannot be an empty string
              Array.lastNonEmpty,
              MFunction.fIfTrue({
                condition: showValue && ASText.isNotEmpty(firstLine),
                f: flow(ASText.append(keyValueSeparator), ASText.append(firstLine)),
              }),
            ),
          ),
          MFunction.fIfTrue({
            condition: showValue,
            f: Array.appendAll(Array.tailNonEmpty(stringifiedValue)),
          }),
        );
      };
    };
  };

/**
 * PropertyFormatter instance that prints the key and value of a property (similar to the usual way
 * a record is printed). A mark can be prepended or appended to the key to show if the property
 * comes from the object itself or from one of its prototypes.
 *
 * @category Instances
 */
export const keyAndValue: Type = make({
  id: 'KeyAndValue',
  action: _keyAndValueAction({ onSameLine: true, dontShowLeafValue: false }),
});

/**
 * PropertyFormatter instance that :
 *
 * - For a leaf: does the same as keyAndValue
 * - For a non-leaf: prints the key and value on separate lines without any key/value separator
 *
 * @category Instances
 */
export const treeify: Type = make({
  id: 'Treeify',
  action: _keyAndValueAction({ onSameLine: false, dontShowLeafValue: false }),
});

/**
 * PropertyFormatter instance that :
 *
 * - For a leaf: prints only the key
 * - For a non-leaf: prints the key and value on separate lines without any key/value separator
 *
 * @category Instances
 */
export const treeifyHideLeafValues: Type = make({
  id: 'Treeify',
  action: _keyAndValueAction({ onSameLine: false, dontShowLeafValue: true }),
});
