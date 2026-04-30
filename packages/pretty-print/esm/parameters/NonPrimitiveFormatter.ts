/**
 * This module implements a type that assembles the stringified representation of a non-primitive
 * value from the already-stringified representations of its properties. It is responsible for
 * decisions such as: adding opening/closing marks (brackets, braces), choosing between single-line
 * and multi-line output, and applying tree-style indentation.
 *
 * Use the `make` function to define custom instances if the pre-built ones do not suit your needs.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MTuple from '@parischap/effect-lib/MTuple';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPResolvedNonPrimitiveParameters from '../internal/Parameters/ResolvedNonPrimitiveParameters.js';
import type * as PPValue from '../internal/stringification/Value.js';
import type * as PPParameters from './Parameters.js';
import type * as PPPartName from './PartName.js';

import * as PPStringifiedProperties from '../internal/stringification/StringifiedProperties.js';
import * as PPStringifiedValue from '../stringification/StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/NonPrimitiveFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const defaultParams = {
  limit: 80,
  inBetweenPropertySeparatorMark: ',',
  singleLineSpacingMark: ' ',
  tabMark: '  ',
};

/**
 * Type that represents a NonPrimitiveFormatter.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this NonPrimitiveFormatter instance. Useful for equality and debugging */
  readonly id: string;

  /**
   * Action of this `PPNonPrimitiveFormatter`. Takes as input:
   *
   * - `nonPrimitive`: the non-primitive value being stringified (used as context for styling),
   * - `parameters`: the `PPParameters` instance passed to the `PPStringifier`,
   * - `applicableNonPrimitiveParameters`: the merged, fully-resolved `PPNonPrimitiveParameters`
   *   fields applicable to `nonPrimitive` (see
   *   `PPResolvedNonPrimitiveParameters.fromApplicableNonPrimitiveParameters`),
   * - `header`: a lazy `ASText` header placed before the properties (usually the value's name and
   *   property count, e.g. `Map(2) `),
   * - `stringifiedProperties`: the already-stringified representation of each property.
   *
   * Returns the complete stringified representation of the non-primitive value.
   */
  readonly action: MTypes.OneArgFunction<
    {
      readonly nonPrimitive: PPValue.NonPrimitive;
      readonly parameters: PPParameters.Type;
      readonly applicableNonPrimitiveParameters: PPResolvedNonPrimitiveParameters.Type;
      readonly header: Function.LazyArg<ASText.Type>;
      readonly stringifiedProperties: PPStringifiedProperties.Type;
    },
    PPStringifiedValue.Type
  >;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  constructor({ id, action }: MTypes.Data<Type>) {
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
export const action: MTypes.OneArgFunction<Type, Type['action']> = Struct.get('action');

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that always prints non-primitive
 * values on a single line, surrounding properties with the opening/closing marks and separating
 * them with `inBetweenPropertySeparatorMark`.
 *
 * @category Constructors
 */
export const singleLine = ({
  inBetweenPropertySeparatorMark,
  nonPrimitiveValueOpeningMark,
  nonPrimitiveValueClosingMark,
  singleLineSpacingMark,
}: {
  /** Mark used to visually separate the properties of a non-primitive value */
  readonly inBetweenPropertySeparatorMark: string;
  /** Opening mark of a non-primitive value */
  readonly nonPrimitiveValueOpeningMark: string;
  /** Closing mark of a non-primitive value */
  readonly nonPrimitiveValueClosingMark: string;
  /**
   * Mark added after the nonPrimitiveValueOpeningMark, after each inBetweenPropertySeparatorMark,
   * and before the nonPrimitiveValueClosingMark when the non-primitive value is not empty and is
   * displayed on a single line
   */
  readonly singleLineSpacingMark: string;
}): Type =>
  make({
    id: `SingleLineWith/${inBetweenPropertySeparatorMark}/${nonPrimitiveValueOpeningMark}/\
${nonPrimitiveValueClosingMark}/${singleLineSpacingMark}/Mark`,
    action: ({ nonPrimitive, header, stringifiedProperties, parameters }) => {
      const { styleMap } = parameters;
      const fromPartNameStyler = (partName: PPPartName.Type) =>
        pipe(
          styleMap,
          PPStyleMap.get(partName),
          ASContextStyler.style,
          Function.apply(nonPrimitive),
        );

      const nonPrimitiveValueMarksStyler = fromPartNameStyler('NonPrimitiveValueMarks');

      const InBetweenPropertySeparator = pipe(
        inBetweenPropertySeparatorMark,
        MString.append(singleLineSpacingMark),
        fromPartNameStyler('InBetweenPropertySeparator'),
      );

      const nonPrimitiveValueMarksSpacing = nonPrimitiveValueMarksStyler(singleLineSpacingMark);

      return pipe(
        stringifiedProperties,
        PPStringifiedValue.fromJoinedStringifiedProperties,
        ASText.join(InBetweenPropertySeparator),
        ASText.surroundIfNotEmpty(nonPrimitiveValueMarksSpacing, nonPrimitiveValueMarksSpacing),
        ASText.surround(
          nonPrimitiveValueMarksStyler(nonPrimitiveValueOpeningMark),
          nonPrimitiveValueMarksStyler(nonPrimitiveValueClosingMark),
        ),
        Array.make,
        Array.prepend(header()),
        ASText.removeEmptyAndJoin(pipe(parameters.headerSeparatorMark, fromPartNameStyler('Tag'))),
        PPStringifiedValue.fromText,
      );
    },
  });

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that always prints non-primitive
 * values on multiple lines with `tabMark` as indentation prefix for each property line.
 *
 * @category Constructors
 */
export const tabify = ({
  inBetweenPropertySeparatorMark,
  nonPrimitiveValueOpeningMark,
  nonPrimitiveValueClosingMark,
  tabMark,
}: {
  /** Mark used to separate visually the properties of a non-primitive value on multiple lines */
  readonly inBetweenPropertySeparatorMark: string;
  /** Opening mark of a non-primitive value */
  readonly nonPrimitiveValueOpeningMark: string;
  /** Closing mark of a non-primitive value */
  readonly nonPrimitiveValueClosingMark: string;
  /** Mark used for tab indentation */
  readonly tabMark: string;
}): Type =>
  make({
    id: `TabifyWith/${inBetweenPropertySeparatorMark}/${nonPrimitiveValueOpeningMark}/\
${nonPrimitiveValueClosingMark}/${tabMark}/Mark`,
    action: ({ nonPrimitive, header, stringifiedProperties, parameters }) => {
      const { styleMap } = parameters;
      const fromPartNameStyler = (partName: PPPartName.Type) =>
        pipe(
          styleMap,
          PPStyleMap.get(partName),
          ASContextStyler.style,
          Function.apply(nonPrimitive),
        );

      const inBetweenPropertySeparator = pipe(
        inBetweenPropertySeparatorMark,
        fromPartNameStyler('InBetweenPropertySeparator'),
      );

      const nonPrimitiveValueMarksStyler = fromPartNameStyler('NonPrimitiveValueMarks');
      const nonPrimitiveValueOpening = pipe(
        nonPrimitiveValueOpeningMark,
        nonPrimitiveValueMarksStyler,
        Array.make,
        Array.prepend(header()),
        ASText.removeEmptyAndJoin(pipe(parameters.headerSeparatorMark, fromPartNameStyler('Tag'))),
      );
      const nonPrimitiveValueClosing = nonPrimitiveValueMarksStyler(nonPrimitiveValueClosingMark);
      const tab = pipe(tabMark, fromPartNameStyler('Tab'));

      return pipe(
        stringifiedProperties,
        PPStringifiedProperties.addMarkInBetween(inBetweenPropertySeparator),
        PPStringifiedProperties.tabify(tab),
        PPStringifiedProperties.prependProperty(nonPrimitiveValueOpening),
        PPStringifiedProperties.appendProperty(nonPrimitiveValueClosing),
        PPStringifiedValue.fromFlattenedStringifiedProperties,
      );
    },
  });

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that prints non-primitive values in
 * a tree-like fashion using the four provided indentation marks. The header and value marks are not
 * printed.
 *
 * @category Constructors
 */
export const treeify = ({
  treeIndentForFirstLineOfInitPropsMark,
  treeIndentForTailLinesOfInitPropsMark,
  treeIndentForFirstLineOfLastPropMark,
  treeIndentForTailLinesOfLastPropMark,
}: {
  /** Mark prepended to the first line of all properties except the last */
  readonly treeIndentForFirstLineOfInitPropsMark: string;
  /** Mark prepended to all lines but the first of all properties except the last */
  readonly treeIndentForTailLinesOfInitPropsMark: string;
  /** Mark prepended to the first line of the last property */
  readonly treeIndentForFirstLineOfLastPropMark: string;
  /** Mark prepended to all lines but the first of the last property */
  readonly treeIndentForTailLinesOfLastPropMark: string;
}): Type =>
  make({
    id: `TreeifyWith/${treeIndentForFirstLineOfInitPropsMark}/${treeIndentForTailLinesOfInitPropsMark}/\
${treeIndentForFirstLineOfLastPropMark}/${treeIndentForTailLinesOfLastPropMark}/Mark`,
    action: ({ nonPrimitive, stringifiedProperties, parameters }) => {
      const { styleMap } = parameters;
      const indentationStyler = pipe(
        styleMap,
        PPStyleMap.get('Tab'),
        ASContextStyler.style,
        Function.apply(nonPrimitive),
      );

      return pipe(
        stringifiedProperties,
        PPStringifiedProperties.treeify({
          treeIndentForFirstLineOfInitProps: indentationStyler(
            treeIndentForFirstLineOfInitPropsMark,
          ),
          treeIndentForTailLinesOfInitProps: indentationStyler(
            treeIndentForTailLinesOfInitPropsMark,
          ),
          treeIndentForFirstLineOfLastProp: indentationStyler(treeIndentForFirstLineOfLastPropMark),
          treeIndentForTailLinesOfLastProp: indentationStyler(treeIndentForTailLinesOfLastPropMark),
        }),
        PPStringifiedValue.fromFlattenedStringifiedProperties,
      );
    },
  });

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that prints a non-primitive value
 * on a single line if the number of its displayed properties (after filtering and deduping) is less
 * than or equal to `limit`. Falls back to `tabify` otherwise.
 *
 * @category Constructors
 */
export const splitOnConstituentNumber = ({
  limit,
  inBetweenPropertySeparatorMark,
  nonPrimitiveValueOpeningMark,
  nonPrimitiveValueClosingMark,
  singleLineSpacingMark,
  tabMark,
}: {
  /** Limit under which the non-primitive value is printed on a single line */
  readonly limit: number;
  /** Mark used to visually separate the properties of a non-primitive value */
  readonly inBetweenPropertySeparatorMark: string;
  /** Opening mark of a non-primitive value */
  readonly nonPrimitiveValueOpeningMark: string;
  /** Closing mark of a non-primitive value */
  readonly nonPrimitiveValueClosingMark: string;
  /**
   * Mark added after the nonPrimitiveValueOpeningMark, after each inBetweenPropertySeparatorMark,
   * and before the nonPrimitiveValueClosingMark when the non-primitive value is not empty and is
   * displayed on a single line
   */
  readonly singleLineSpacingMark: string;
  /** Mark used for tab indentation */
  readonly tabMark: string;
}): Type => {
  const singleLineFormatter = singleLine({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    singleLineSpacingMark,
  });
  const multiLineFormatter = tabify({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    tabMark,
  });
  return make({
    id: pipe(
      limit,
      MString.fromNumber(10),
      MString.prepend('SplitWhenConstituentNumberExceeds'),
      MString.append(`With/${inBetweenPropertySeparatorMark}/${nonPrimitiveValueOpeningMark}/\
${nonPrimitiveValueClosingMark}/${singleLineSpacingMark}/${tabMark}/Marks`),
    ),
    action: flow(
      MMatch.make,
      MMatch.when(
        flow(Struct.get('stringifiedProperties'), Array.length, Number.isLessThanOrEqualTo(limit)),
        singleLineFormatter.action,
      ),
      MMatch.orElse(multiLineFormatter.action),
    ),
  });
};

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that prints a non-primitive value
 * on a single line if its total display length (including header, separators and delimiters) is
 * less than or equal to `limit`. Falls back to `tabify` otherwise.
 *
 * @category Constructors
 */
export const splitOnTotalLength = ({
  limit,
  inBetweenPropertySeparatorMark,
  nonPrimitiveValueOpeningMark,
  nonPrimitiveValueClosingMark,
  singleLineSpacingMark,
  tabMark,
}: {
  /** Limit under which the non-primitive value is printed on a single line */
  readonly limit: number;
  /** Mark used to visually separate the properties of a non-primitive value */
  readonly inBetweenPropertySeparatorMark: string;
  /** Opening mark of a non-primitive value */
  readonly nonPrimitiveValueOpeningMark: string;
  /** Closing mark of a non-primitive value */
  readonly nonPrimitiveValueClosingMark: string;
  /**
   * Mark added after the nonPrimitiveValueOpeningMark, after each inBetweenPropertySeparatorMark,
   * and before the nonPrimitiveValueClosingMark when the non-primitive value is not empty and is
   * displayed on a single line
   */
  readonly singleLineSpacingMark: string;
  /** Mark used for tab indentation */
  readonly tabMark: string;
}): Type => {
  const singleLineFormatter = singleLine({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    singleLineSpacingMark,
  });
  const multiLineFormatter = tabify({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    tabMark,
  });
  const inBetweenSepLength = inBetweenPropertySeparatorMark.length + singleLineSpacingMark.length;
  const marksLength =
    nonPrimitiveValueOpeningMark.length +
    singleLineSpacingMark.length +
    nonPrimitiveValueClosingMark.length +
    singleLineSpacingMark.length;
  const marksLengthWhenEmpty =
    nonPrimitiveValueOpeningMark.length + nonPrimitiveValueClosingMark.length;
  return make({
    id: pipe(
      limit,
      MString.fromNumber(10),
      MString.prepend('SplitWhenTotalLengthExceeds'),
      MString.append(`With/${inBetweenPropertySeparatorMark}/${nonPrimitiveValueOpeningMark}/\
${nonPrimitiveValueClosingMark}/${singleLineSpacingMark}/${tabMark}/Marks`),
    ),
    action: flow(
      MMatch.make,
      MMatch.when(
        ({ header, stringifiedProperties }) =>
          pipe(
            stringifiedProperties,
            MTuple.replicate(2),
            Tuple.evolve(
              Tuple.make(
                flow(PPStringifiedProperties.toLength, Number.sum(ASText.toLength(header()))),
                Array.match({
                  onEmpty: Function.constant(marksLengthWhenEmpty),
                  onNonEmpty: flow(
                    Array.length,
                    Number.decrement,
                    Number.multiply(inBetweenSepLength),
                    Number.sum(marksLength),
                  ),
                }),
              ),
            ),
            Number.sumAll,
            Number.isLessThanOrEqualTo(limit),
          ),
        singleLineFormatter.action,
      ),
      MMatch.orElse(multiLineFormatter.action),
    ),
  });
};

/**
 * Constructor that returns a `PPNonPrimitiveFormatter` instance that prints a non-primitive value
 * on a single line if the length of the longest property to print (excluding formatting characters
 * and object marks) is less than or equal to `limit`. Falls back to `tabify` otherwise.
 *
 * @category Constructors
 */
export const splitOnLongestPropLength = ({
  limit,
  inBetweenPropertySeparatorMark,
  nonPrimitiveValueOpeningMark,
  nonPrimitiveValueClosingMark,
  singleLineSpacingMark,
  tabMark,
}: {
  /** Limit under which the non-primitive value is printed on a single line */
  readonly limit: number;
  /** Mark used to visually separate the properties of a non-primitive value */
  readonly inBetweenPropertySeparatorMark: string;
  /** Opening mark of a non-primitive value */
  readonly nonPrimitiveValueOpeningMark: string;
  /** Closing mark of a non-primitive value */
  readonly nonPrimitiveValueClosingMark: string;
  /**
   * Mark added after the nonPrimitiveValueOpeningMark, after each inBetweenPropertySeparatorMark,
   * and before the nonPrimitiveValueClosingMark when the non-primitive value is not empty and is
   * displayed on a single line
   */
  readonly singleLineSpacingMark: string;
  /** Mark used for tab indentation */
  readonly tabMark: string;
}): Type => {
  const singleLineFormatter = singleLine({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    singleLineSpacingMark,
  });
  const multiLineFormatter = tabify({
    inBetweenPropertySeparatorMark,
    nonPrimitiveValueOpeningMark,
    nonPrimitiveValueClosingMark,
    tabMark,
  });
  return make({
    id: pipe(
      limit,
      MString.fromNumber(10),
      MString.prepend('SplitWhenLongestPropLengthExceeds'),
      MString.append(`With/${inBetweenPropertySeparatorMark}/${nonPrimitiveValueOpeningMark}/\
${nonPrimitiveValueClosingMark}/${singleLineSpacingMark}/${tabMark}/Marks`),
    ),
    action: flow(
      MMatch.make,
      MMatch.when(
        flow(
          Struct.get('stringifiedProperties'),
          Array.map(PPStringifiedValue.toLength),
          Array.match({
            onEmpty: Function.constant(0),
            onNonEmpty: Array.max(Order.Number),
          }),
          Number.isLessThanOrEqualTo(limit),
        ),
        singleLineFormatter.action,
      ),
      MMatch.orElse(multiLineFormatter.action),
    ),
  });
};

/**
 * NonPrimitiveFormatter instance that formats a non-primitive value in the way util.inspect does
 * for records. Properties are separated by `,` and surrounded by `{`, `}`. Records are split on
 * several lines if the length of the object on a single line would exceed 80 characters. Uses two
 * spaces as tab if the record is printed on several lines
 *
 * @category Instances
 */
export const utilInspectLikeRecord = splitOnTotalLength({
  ...defaultParams,
  nonPrimitiveValueOpeningMark: '{',
  nonPrimitiveValueClosingMark: '}',
});

/**
 * NonPrimitiveFormatter instance that formats a non-primitive value in the way util.inspect does
 * for arrays. Properties are separated by `,` and surrounded by `[`, `]`. Arrays are split on
 * several lines if the length of the object on a single line would exceed 80 characters. Uses two
 * spaces as tab if the record is printed on several lines
 *
 * @category Instances
 */
export const utilInspectLikeArray = splitOnTotalLength({
  ...defaultParams,
  nonPrimitiveValueOpeningMark: '[',
  nonPrimitiveValueClosingMark: ']',
});

/**
 * NonPrimitiveFormatter instance that treeifies a non-primitive value: no header, no value marks,
 * no inBetweenProperty separator. Tabs are replaced by lines.
 *
 * @category Instances
 */
export const usualTreeify = treeify({
  treeIndentForFirstLineOfInitPropsMark: '├─ ',
  treeIndentForTailLinesOfInitPropsMark: '│  ',
  treeIndentForFirstLineOfLastPropMark: '└─ ',
  treeIndentForTailLinesOfLastPropMark: '   ',
});
