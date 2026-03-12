/**
 * This module implements a type that takes care of the formatting of non-primitive values. From the
 * stringified representation of the properties of a non-primitive value which it receives, it must
 * return the stringified representation of the whole non-primitive value. It can take care of
 * aspects like adding specific array/object marks, printing on a single or multiple lines,
 * indentation when printing on multiple lines, ...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import type * as PPOption from './Option.js';

import { flow, pipe } from 'effect';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MTuple from '@parischap/effect-lib/MTuple';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as Array from 'effect/Array';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import * as PPStringifiedProperties from './StringifiedProperties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';
import * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/NonPrimitiveFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a NonPrimitiveFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
  /**
   * Namespace of an initialized NonPrimitiveFormatter used as an action
   *
   * @category Models
   */
  export namespace Initialized {
    /**
     * Type of the action of a NonPrimitiveFormatter. The action takes as input the Value being
     * currently printed (see Value.ts), a header to be displayed in front of the stringified
     * properties (usually the id of the non primitive value and the number of displayed properties)
     * and an array of the stringified properties (see StringifiedProperties.ts) of that value.
     * Based on these parameters, it must return a stringified representation of the whole record.
     */
    export interface Type {
      ({
        value,
        header,
      }: {
        readonly value: PPValue.NonPrimitive;
        readonly header: ASText.Type;
      }): (children: PPStringifiedProperties.Type) => PPStringifiedValue.Type;
    }
  }

  /**
   * Type of the action of a NonPrimitiveFormatter. The action takes as input the current
   * non-primitive formatting option, a ValueBasedStylerConstructor (see
   * ValueBasedStylerConstructor.ts), and a MarkShowerConstructor (see MarkShowerConstructor.ts).
   * Based on these parameters, it must return an Initialized Action.
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
 * Type that represents a NonPrimitiveFormatter.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this NonPrimitiveFormatter instance. Useful for equality and debugging */
  readonly id: string;

  /** Action of this NonPrimitiveFormatter */
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
 * Equivalence
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
 * NonPrimitiveFormatter instance that will always print non-primitive values on a single line
 *
 * @category Instances
 */
export const singleLine: Type = make({
  id: 'SingleLine',
  action: (option, { valueBasedStylerConstructor }) => {
    const inBetweenPropertySeparatorTextFormatter = valueBasedStylerConstructor(
      'InBetweenPropertySeparator',
    );
    const nonPrimitiveValueDelimitersTextFormatter = valueBasedStylerConstructor(
      'NonPrimitiveValueDelimiters',
    );

    return ({ value, header }) => {
      const inBetweenPropertySeparator = pipe(
        option.singleLineInBetweenPropertySeparatorMark,
        inBetweenPropertySeparatorTextFormatter(value),
      );
      const inContextNonPrimitiveValueDelimitersTextFormatter =
        nonPrimitiveValueDelimitersTextFormatter(value);

      return Array.match({
        onEmpty: pipe(
          option.multiLineStartDelimiterMark + option.multiLineEndDelimiterMark,
          inContextNonPrimitiveValueDelimitersTextFormatter,
          ASText.prepend(header),
          PPStringifiedValue.fromText,
          Function.constant,
        ),
        onNonEmpty: flow(
          PPStringifiedProperties.addMarkInBetween(inBetweenPropertySeparator),
          PPStringifiedProperties.prependProperty(
            pipe(
              option.singleLineStartDelimiterMark,
              inContextNonPrimitiveValueDelimitersTextFormatter,
              ASText.prepend(header),
            ),
          ),
          PPStringifiedProperties.appendProperty(
            inContextNonPrimitiveValueDelimitersTextFormatter(option.singleLineEndDelimiterMark),
          ),
          PPStringifiedValue.fromStringifiedProperties,
          PPStringifiedValue.toSingleLine,
        ),
      });
    };
  },
});

/**
 * NonPrimitiveFormatter instance that will always print non-primitive values on multiple lines with
 * a tab indentation
 *
 * @category Instances
 */
export const tabify: Type = make({
  id: 'Tabify',
  action: (option, { valueBasedStylerConstructor, markShowerConstructor }) => {
    const inBetweenPropertySeparatorTextFormatter = valueBasedStylerConstructor(
      'InBetweenPropertySeparator',
    );
    const nonPrimitiveValueDelimitersTextFormatter = valueBasedStylerConstructor(
      'NonPrimitiveValueDelimiters',
    );
    const tabIndentMarkShower = markShowerConstructor('TabIndent');

    return ({ value, header }) => {
      const inBetweenPropertySeparator = pipe(
        option.multiLineInBetweenPropertySeparatorMark,
        inBetweenPropertySeparatorTextFormatter(value),
      );
      const inContextNonPrimitiveValueDelimitersTextFormatter =
        nonPrimitiveValueDelimitersTextFormatter(value);
      const startDelimiterMarkAndHeader = pipe(
        option.multiLineStartDelimiterMark,
        inContextNonPrimitiveValueDelimitersTextFormatter,
        ASText.prepend(header),
      );
      const endDelimiterMark = inContextNonPrimitiveValueDelimitersTextFormatter(
        option.multiLineEndDelimiterMark,
      );
      const tab = tabIndentMarkShower(value);
      return flow(
        PPStringifiedProperties.addMarkInBetween(inBetweenPropertySeparator),
        PPStringifiedProperties.tabify(tab),
        PPStringifiedProperties.prependProperty(startDelimiterMarkAndHeader),
        PPStringifiedProperties.appendProperty(endDelimiterMark),
        PPStringifiedValue.fromStringifiedProperties,
      );
    };
  },
});

/**
 * NonPrimitiveFormatter instance that will always print non-primitive values in a tree-like fashion
 *
 * @category Instances
 */
export const treeify: Type = make({
  id: 'Treeify',
  action: (_option, { markShowerConstructor }) => {
    const treeIndentForFirstLineOfInitPropsMarkShower = markShowerConstructor(
      'TreeIndentForFirstLineOfInitProps',
    );
    const treeIndentForTailLinesOfInitPropsMarkShower = markShowerConstructor(
      'TreeIndentForTailLinesOfInitProps',
    );
    const treeIndentForFirstLineOfLastPropMarkShower = markShowerConstructor(
      'TreeIndentForFirstLineOfLastProp',
    );
    const treeIndentForTailLinesOfLastPropMarkShower = markShowerConstructor(
      'TreeIndentForTailLinesOfLastProp',
    );

    return ({ value }) =>
      flow(
        PPStringifiedProperties.treeify({
          treeIndentForFirstLineOfInitProps: treeIndentForFirstLineOfInitPropsMarkShower(value),
          treeIndentForTailLinesOfInitProps: treeIndentForTailLinesOfInitPropsMarkShower(value),
          treeIndentForFirstLineOfLastProp: treeIndentForFirstLineOfLastPropMarkShower(value),
          treeIndentForTailLinesOfLastProp: treeIndentForTailLinesOfLastPropMarkShower(value),
        }),
        PPStringifiedValue.fromStringifiedProperties,
      );
  },
});

/**
 * NonPrimitiveFormatter instance maker that will print non-primitive values on a single line if the
 * actual number of their constituents (after filtering,...) is less than or equal to `limit`.
 *
 * @category Constructors
 */
export const splitOnConstituentNumberMaker = (limit: number): Type =>
  make({
    id: pipe(limit, MString.fromNumber(10), MString.prepend('SplitWhenConstituentNumberExceeds')),
    action: (option, params) => {
      const initializedSingleLine = apply(singleLine)(option)(params);
      const initilizedTabify = apply(tabify)(option)(params);
      return ({ value, header }) =>
        flow(
          MMatch.make,
          MMatch.when(
            flow(Array.length, Number.lessThanOrEqualTo(limit)),
            initializedSingleLine({ value, header }),
          ),
          MMatch.orElse(initilizedTabify({ value, header })),
        );
    },
  });

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters) is less than or equal to `limit`. Calls `tabify` otherwise
 *
 * @category Constructors
 */
export const splitOnTotalLengthMaker = (limit: number): Type =>
  make({
    id: pipe(limit, MString.fromNumber(10), MString.prepend('SplitWhenTotalLengthExceeds')),
    action: (option, params) => {
      const initializedSingleLine = apply(singleLine)(option)(params);
      const initilizedTabify = apply(tabify)(option)(params);
      const inBetweenSepLength = option.singleLineInBetweenPropertySeparatorMark.length;
      const delimitersLength =
        option.singleLineStartDelimiterMark.length + option.singleLineEndDelimiterMark.length;
      const delimitersLengthWhenEmpty =
        option.multiLineStartDelimiterMark.length + option.multiLineEndDelimiterMark.length;
      return ({ value, header }) =>
        flow(
          MMatch.make,
          MMatch.when(
            flow(
              MTuple.makeBothBy({
                toFirst: PPStringifiedProperties.toLength,
                toSecond: Array.match({
                  onEmpty: () => ASText.toLength(header) + delimitersLengthWhenEmpty,
                  onNonEmpty: flow(
                    Array.length,
                    Number.decrement,
                    Number.multiply(inBetweenSepLength),
                    Number.sum(delimitersLength),
                    Number.sum(ASText.toLength(header)),
                  ),
                }),
              }),
              Number.sumAll,
              Number.lessThanOrEqualTo(limit),
            ),
            initializedSingleLine({ value, header }),
          ),
          MMatch.orElse(initilizedTabify({ value, header })),
        );
    },
  });

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters and object marks) is less than or equal to `limit`. Calls `tabify` otherwise
 *
 * @category Constructors
 */
export const splitOnLongestPropLengthMaker = (limit: number): Type =>
  make({
    id: pipe(limit, MString.fromNumber(10), MString.prepend('SplitWhenLongestPropLengthExceeds')),
    action: (option, params) => {
      const initializedSingleLine = apply(singleLine)(option)(params);
      const initilizedTabify = apply(tabify)(option)(params);
      return ({ value, header }) =>
        flow(
          MMatch.make,
          MMatch.when(
            flow(PPStringifiedProperties.toLongestPropLength, Number.lessThanOrEqualTo(limit)),
            initializedSingleLine({ value, header }),
          ),
          MMatch.orElse(initilizedTabify({ value, header })),
        );
    },
  });
