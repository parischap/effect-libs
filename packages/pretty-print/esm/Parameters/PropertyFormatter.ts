/**
 * This module implements a type that takes care of the stringification of the properties of a non-
 * primitive value. From the stringified representation of the value of a property which it
 * receives, it must return the stringified representation of the whole property (key and value).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPValue from '../internal/stringification/Value.js';
import type * as PPParameters from './Parameters.js';
import type * as PPPartName from './PartName.js';

import * as PPStringifiedValue from '../stringification/StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/PropertyFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const defaultParams = {
  prototypePrefixMark: '',
  prototypeSuffixMark: '@',
  keyValueSeparatorMark: ': ',
};

/**
 * Type that represents a PropertyFormatter.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PPPropertyFormatter instance. Useful for equality and debugging */
  readonly id: string;
  /**
   * Action of this PPPropertyFormatter. The action takes as input:
   *
   * - `property`: the property being stringified,
   * - `stringifiedPropValue`: the stringified representation of the value of that property,
   * - `isLeaf`: a boolean that indicates if the property is a leaf (useful to hide leaves when
   *   treeifying),
   * - `hideKey` : a boolean that indicates if the key must be displayed (useful for iterables like
   *   arrays for which keys have been generated automatically by auto-incrementation and are
   *   usually not displayed)
   * - `parameters` : the parameters passed by the user to build the `PPStringifier`.
   *
   * It returns a stringified representation of the whole property.
   */

  readonly action: ({
    property,
    stringifiedPropValue,
    isLeaf,
    hideKey,
    parameters,
  }: {
    readonly property: PPValue.Any;
    readonly stringifiedPropValue: PPStringifiedValue.Type;
    readonly isLeaf: boolean;
    readonly hideKey: boolean;
    readonly parameters: PPParameters.Type;
  }) => PPStringifiedValue.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  public constructor({ id, action }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.action = action;
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
export const make = (params: MTypes.Data<Type>): Type => new Type(params);

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
export const action: MTypes.OneArgFunction<Type, Type['action']> = Struct.get('action');

/**
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @category Instances
 */
export const valueOnly: Type = make({
  id: 'ValueOnly',
  action: ({ stringifiedPropValue }) => stringifiedPropValue,
});

/**
 * For leaves, the last line of the key and the first line of the value are merged and separated by
 * the keyValueSeparator (however, the separator is not displayed if either the key or the value is
 * empty). The same happens for non-leaves, except if `nonLeafValueOnSameLine` is false. In that
 * case, the lines of the value are appended to the lines of the key and no keyValueSeparator is
 * used
 */
const keyAndValueAction =
  ({
    nonLeafValueOnSameLine,
    hideLeafValue,
    keyValueSeparatorMark,
    prototypePrefixMark,
    prototypeSuffixMark,
  }: {
    readonly nonLeafValueOnSameLine: boolean;
    readonly hideLeafValue: boolean;
    readonly keyValueSeparatorMark: string;
    readonly prototypePrefixMark: string;
    readonly prototypeSuffixMark: string;
  }): Type['action'] =>
  ({ property, stringifiedPropValue, isLeaf, hideKey, parameters }) => {
    const hideNodeValue = isLeaf && hideLeafValue;
    const finalStringifiedPropValue = hideNodeValue
      ? PPStringifiedValue.empty
      : stringifiedPropValue;

    if (hideKey) return finalStringifiedPropValue;

    const { styleMap } = parameters;
    const fromPartNameStyler = (partName: PPPartName.Type) =>
      pipe(styleMap, PPStyleMap.get(partName), ASContextStyler.style, Function.apply(property));

    const propertyKeyStyler = fromPartNameStyler('PropertyKey');
    //console.log(property.stringKey, isLeaf, hideLeaf);
    const stringifiedPropKey = Array.map(property.stringKey, (stringKeyLine) =>
      propertyKeyStyler(stringKeyLine),
    );

    const prototypeMarksStyler = fromPartNameStyler('PrototypeMarks');
    const prototypePrefix = prototypeMarksStyler(prototypePrefixMark);
    const prototypeSuffix = prototypeMarksStyler(prototypeSuffixMark);
    const { protoDepth } = property;

    const stringifiedPropKeyWithProtoMarks: PPStringifiedValue.Type = pipe(
      stringifiedPropKey,
      MFunction.fIfTrue({
        condition: protoDepth > 0,
        f: flow(
          PPStringifiedValue.prependToFirstLine(pipe(prototypePrefix, ASText.repeat(protoDepth))),
          PPStringifiedValue.appendToLastLine(pipe(prototypeSuffix, ASText.repeat(protoDepth))),
        ),
      }),
    );

    if (PPStringifiedValue.isEmpty(stringifiedPropKeyWithProtoMarks))
      return finalStringifiedPropValue;

    if (hideNodeValue) return stringifiedPropKeyWithProtoMarks;

    if (!isLeaf && !nonLeafValueOnSameLine)
      return pipe(
        stringifiedPropKeyWithProtoMarks,
        PPStringifiedValue.concat(finalStringifiedPropValue),
      );

    // At this stage, we know the key and value are both non empty. So the `keyValueSeparator` must be displayed
    const keyValueSeparator = pipe(keyValueSeparatorMark, fromPartNameStyler('KeyValueSeparator'));

    return pipe(
      stringifiedPropKeyWithProtoMarks,
      PPStringifiedValue.initLines,
      PPStringifiedValue.addLineAfter(
        pipe(
          stringifiedPropKeyWithProtoMarks,
          PPStringifiedValue.lastLine,
          ASText.append(keyValueSeparator),
          ASText.append(PPStringifiedValue.firstLine(finalStringifiedPropValue)),
        ),
      ),
      PPStringifiedValue.concat(PPStringifiedValue.tailLines(finalStringifiedPropValue)),
    );
  };

/**
 * Constructor that builds a `PPPropertyFormatter` instance that prints the key and value of a
 * property on the same line, separated by `keyValueSeparatorMark` (similar to the usual way a
 * record is printed). `prototypePrefixMark` is prepended and `prototypeSuffixMark` is appended to
 * property keys as many times as the depth of the property in the prototypal chain (useful to
 * visually distinguish inherited properties).
 *
 * @category Constructors
 */
export const keyAndValue = ({
  keyValueSeparatorMark,
  prototypePrefixMark,
  prototypeSuffixMark,
}: {
  /** Mark used to visually separate the key and the value of a property */
  readonly keyValueSeparatorMark: string;
  /** Prefix used to show the depth of a property in the prototypal chain of a non-primitive value */
  readonly prototypePrefixMark: string;
  /** Suffix used to show the depth of a property in the prototypal chain of a non-primitive value */
  readonly prototypeSuffixMark: string;
}): Type =>
  make({
    id: `KeyAndValueWith/${keyValueSeparatorMark}/${prototypePrefixMark}/${prototypeSuffixMark}/Marks`,
    action: keyAndValueAction({
      keyValueSeparatorMark,
      prototypePrefixMark,
      prototypeSuffixMark,
      nonLeafValueOnSameLine: true,
      hideLeafValue: false,
    }),
  });

/**
 * Constructor that builds a `PPPropertyFormatter` instance for tree-style output:
 *
 * - For a leaf property: prints key and value on the same line, separated by `keyValueSeparatorMark`
 *   (same as `keyAndValue`).
 * - For a non-leaf property: prints the key on its own line and the formatted sub-tree on the
 *   following lines, with no separator.
 *
 * @category Constructors
 */
export const treeify = ({
  keyValueSeparatorMark,
  prototypePrefixMark,
  prototypeSuffixMark,
}: {
  readonly keyValueSeparatorMark: string;
  readonly prototypePrefixMark: string;
  readonly prototypeSuffixMark: string;
}): Type =>
  make({
    id: `TreeifyWith/${keyValueSeparatorMark}/${prototypePrefixMark}/${prototypeSuffixMark}/Marks`,
    action: keyAndValueAction({
      keyValueSeparatorMark,
      prototypePrefixMark,
      prototypeSuffixMark,
      nonLeafValueOnSameLine: false,
      hideLeafValue: false,
    }),
  });

/**
 * Constructor that builds a `PPPropertyFormatter` instance for tree-style output with hidden
 * leaves: - For a leaf property: prints only the key (the value is hidden). - For a non-leaf
 * property: prints the key on its own line and the formatted sub-tree on the following lines, with
 * no separator.
 *
 * @category Constructors
 */
export const treeifyHideLeaves = ({
  keyValueSeparatorMark,
  prototypePrefixMark,
  prototypeSuffixMark,
}: {
  readonly keyValueSeparatorMark: string;
  readonly prototypePrefixMark: string;
  readonly prototypeSuffixMark: string;
}): Type =>
  make({
    id: `TreeifyHideLeavesWith/${keyValueSeparatorMark}/${prototypePrefixMark}/${prototypeSuffixMark}/Marks`,
    action: keyAndValueAction({
      keyValueSeparatorMark,
      prototypePrefixMark,
      prototypeSuffixMark,
      nonLeafValueOnSameLine: false,
      hideLeafValue: true,
    }),
  });

/**
 * PropertyFormatter instance that formats a non-primitive value in the way `util.inspect` does for
 * records. Property key and value are separated by `: ` (if the key is shown, which is usually not
 * the case for arrays). `@` is suffixed to all property keys as many times as the depth of the
 * property in the prototypal chain
 *
 * @category Instances
 */
export const utilInspectLikeArrayAndRecord = keyAndValue({
  ...defaultParams,
});

/**
 * PropertyFormatter instance that formats a non-primitive value in the way `util.inspect` does for
 * maps and sets. Property key and value are separated by ` => ` (if the key is shown, which is
 * usually not the case for sets). `@` is suffixed to all property keys as many times as the depth
 * of the property in the prototypal chain
 *
 * @category Instances
 */
export const utilInspectLikeIterable = keyAndValue({
  ...defaultParams,
  keyValueSeparatorMark: ' => ',
});

/**
 * PropertyFormatter instance that treeifies a non-primitive value (and shows the leaves)
 *
 * @category Instances
 */
export const usualTreeify = treeify({
  ...defaultParams,
});

/**
 * PropertyFormatter instance that treeifies a non-primitive value (and hides the leaves)
 *
 * @category Instances
 */
export const usualTreeifyHideLeaves = treeifyHideLeaves({
  ...defaultParams,
});
