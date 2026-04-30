/**
 * This module implements a `PPStringifier`, i.e. an object built from a `PPParameters` instance
 * that converts any JavaScript value into a `PPStringifiedValue`. The stringification pipeline
 * handles primitive values, non-primitive values (objects, arrays, maps, sets, functions…), depth
 * limiting, bypass shortcuts, and circular-reference detection.
 */

import { pipe, flow } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import type * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as MArray from '@parischap/effect-lib/MArray';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MRegExp from '@parischap/effect-lib/MRegExp';
import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTree from '@parischap/effect-lib/MTree';
import * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPParameters from '../Parameters/Parameters.js';
import type * as PPPartName from '../Parameters/PartName.js';

import * as PPResolvedNonPrimitiveParameters from '../internal/Parameters/ResolvedNonPrimitiveParameters.js';
import * as PPValue from '../internal/stringification/Value.js';
import * as PPValues from '../internal/stringification/Values.js';
import * as PPByPasser from '../Parameters/ByPasser.js';
import * as PPNonPrimitiveFormatter from '../Parameters/NonPrimitiveFormatter.js';
import * as PPPrimitiveFormatter from '../Parameters/PrimitiveFormatter.js';
import * as PPPropertyFilter from '../Parameters/PropertyFilter.js';
import * as PPPropertyFormatter from '../Parameters/PropertyFormatter.js';
import * as PPPropertyNumberDisplayOption from '../Parameters/PropertyNumberDisplayOption.js';
import * as PPStyleMap from '../Parameters/StyleMap.js';
import * as PPStringifiedValue from './StringifiedValue.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/stringification/Stringifier/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a `PPStringifier`
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of `this` `PPStringifier`. Derived from the `id` of the `PPParameters` used to build it */
  readonly id: string;

  /**
   * Function that converts any JavaScript value into a `PPStringifiedValue`. Handles the full
   * stringification pipeline: primitive formatting, bypass shortcuts, depth limiting, circular-
   * reference detection, property extraction, filtering, sorting, and final assembly.
   */
  readonly stringify: MTypes.OneArgFunction<unknown, PPStringifiedValue.Type>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  constructor(parameters: PPParameters.Type) {
    super();
    const { nonPrimitiveParametersArray, styleMap } = parameters;
    const fromPartNameContextStyler = (partName: PPPartName.Type) =>
      pipe(styleMap, PPStyleMap.get(partName), ASContextStyler.style);

    const primitiveValueContextStyler = fromPartNameContextStyler('PrimitiveValue');
    const tagContextStyler = fromPartNameContextStyler('Tag');
    const byPassedContextStyler = fromPartNameContextStyler('ByPassed');

    this.id = `${parameters.id}Stringifier`;
    this.stringify = (value) => {
      // Last index used to reference a cyclical non-primitive value
      let lastCyclicalIndex = 0;

      interface NonLeaf {
        /** The non-primitive seed from which this non-leaf was created */
        readonly seed: PPValue.NonPrimitive;
        /**
         * The merged, fully-resolved `NonPrimitiveParameters` fields applicable to `seed` (see
         * `PPResolvedNonPrimitiveParameters.fromApplicableNonPrimitiveParameters`)
         */
        readonly applicableNonPrimitiveParameters: PPResolvedNonPrimitiveParameters.Type;
        /** The number of direct and indirect properties of `seed` before filtering and deduping */
        readonly allPropertyNumber: number;
        /**
         * True if the `NonPrimitiveParameters` applicable to `seed` has `hideAutoGeneratedKeys` set
         * to `true` and all the properties of `seed` (after filtering, deduping, and ceiling with
         * `maxPropertyNumber`) have generated keys
         */
        readonly hideAutoGeneratedKeys: boolean;
        /** A styler that styles a string with the `Tag` style (as defined in `styleMap`) */
        readonly tagStyler: ASStyle.Type;
        // Optionally contains the index used to reference that non-primitive value in case of circularity
        cyclicalRef: Option.Option<number>;
      }

      interface Leaf {
        /** The seed from which this leaf was created */
        readonly seed: PPValue.Any;
        /** The representation of the seed */
        readonly stringified: PPStringifiedValue.Type;
      }

      const internalStringify: Type['stringify'] = flow(
        PPValue.fromTopValue as MTypes.OneArgFunction<unknown, PPValue.Any>,
        MTree.unfoldAndFold<NonLeaf, Leaf, PPValue.Any, Leaf & { readonly isLeaf: boolean }>({
          unfold: (seed, cycleSource) =>
            Result.mapError(
              Result.gen(function* () {
                // Stringify the value if it's a primitive
                const nonPrimitive = yield* pipe(
                  seed as PPValue.Primitive | PPValue.NonPrimitive,
                  MMatch.make,
                  MMatch.when(
                    PPValue.isPrimitive,
                    flow(
                      PPPrimitiveFormatter.action(parameters.primitiveFormatter),
                      primitiveValueContextStyler(seed),
                      PPStringifiedValue.fromText,
                      Result.fail,
                    ),
                  ),
                  MMatch.orElse(Result.succeed),
                );

                // Merge every PPNonPrimitiveParameters applicable to this non-primitive value
                const applicableNonPrimitiveParameters =
                  PPResolvedNonPrimitiveParameters.fromApplicableNonPrimitiveParameters({
                    nonPrimitive: nonPrimitive.content,
                    nonPrimitiveParametersArray,
                  });

                const byPassedStyler = byPassedContextStyler(nonPrimitive);
                // Stringify this non-primitive value if it must be bypassed
                const unByPassed = yield* pipe(
                  { nonPrimitive, parameters, applicableNonPrimitiveParameters },
                  PPByPasser.action(applicableNonPrimitiveParameters.byPasser),
                  Option.map(
                    flow(
                      String.split(MRegExp.lineBreak),
                      Array.map((line) => byPassedStyler(line)),
                    ),
                  ),
                  Result.fromOption(Function.constant(nonPrimitive)),
                  Result.flip,
                );

                // Stringify this non-primitive value if it lies beyond parameters.maxDepth
                const unBypassedNonPrimitiveUnderMaxDepth = yield* Result.liftPredicate(
                  unByPassed,
                  flow(PPValue.depth, Number.isLessThan(parameters.maxDepth)),
                  flow(
                    PPValue.content,
                    parameters.name,
                    MString.prepend(parameters.openingTagMark),
                    MString.append(parameters.closingTagMark),
                    byPassedStyler,
                    PPStringifiedValue.fromText,
                  ),
                );

                const tagStyler = tagContextStyler(unBypassedNonPrimitiveUnderMaxDepth);
                // Show circular reference tags if this value has already been displayed
                const unCyclicalUnBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
                  cycleSource,
                  Option.map((nonLeaf) =>
                    pipe(
                      nonLeaf.cyclicalRef,
                      Option.getOrElse(() => {
                        nonLeaf.cyclicalRef = Option.some(++lastCyclicalIndex);
                        return lastCyclicalIndex;
                      }),
                      MString.fromNumber(10),
                      MString.prepend(parameters.circularReferenceTag),
                      tagStyler,
                      ASText.surround(
                        tagStyler(parameters.openingTagMark),
                        tagStyler(parameters.closingTagMark),
                      ),
                      PPStringifiedValue.fromText,
                    ),
                  ),
                  Result.fromOption(Function.constant(unBypassedNonPrimitiveUnderMaxDepth)),
                  Result.flip,
                );

                const properties = Array.appendAll(
                  PPValues.fromNonPrimitiveKeysAndValues({
                    nonPrimitive: unCyclicalUnBypassedNonPrimitiveUnderMaxDepth,
                    maxPrototypeDepth: applicableNonPrimitiveParameters.maxPrototypeDepth,
                  }),
                  applicableNonPrimitiveParameters.extractIterableElements
                    ? PPValues.fromNonPrimitiveIterable({
                        nonPrimitive: unCyclicalUnBypassedNonPrimitiveUnderMaxDepth,
                        stringifier: internalStringify,
                      })
                    : Array.empty(),
                );

                const filteredAndSortedProperties = pipe(
                  properties,
                  PPPropertyFilter.action(applicableNonPrimitiveParameters.propertyFilter),
                  PPValues.sort(applicableNonPrimitiveParameters.propertySortOrder),
                  MFunction.fIfTrue({
                    condition: applicableNonPrimitiveParameters.dedupeProperties,
                    f: Array.dedupeWith(
                      (self, that) => self.oneLineStringKey === that.oneLineStringKey,
                    ),
                  }),
                  Array.take(applicableNonPrimitiveParameters.maxPropertyNumber),
                );

                const hideAutoGeneratedKeys =
                  applicableNonPrimitiveParameters.hideAutoGeneratedKeys &&
                  Array.every(filteredAndSortedProperties, PPValue.hasGeneratedKey);

                return Tuple.make(
                  {
                    seed: unCyclicalUnBypassedNonPrimitiveUnderMaxDepth,
                    applicableNonPrimitiveParameters,
                    allPropertyNumber: properties.length,
                    tagStyler,
                    hideAutoGeneratedKeys,
                    cyclicalRef: Option.none<number>(),
                  },
                  filteredAndSortedProperties,
                );
              }),
              flow(MStruct.make('stringified'), MStruct.prepend({ seed })),
            ),
          foldNonLeaf: (
            {
              seed,
              applicableNonPrimitiveParameters,
              allPropertyNumber,
              hideAutoGeneratedKeys,
              tagStyler,
              cyclicalRef,
            },
            children,
          ) => {
            const header = () => {
              const prependCyclicalRef: MTypes.OneArgFunction<ReadonlyArray<string>> = pipe(
                cyclicalRef,
                Option.map(
                  flow(
                    MString.fromNumber(10),
                    MString.prepend(parameters.circularAnchorOpeningMark),
                    MString.append(parameters.circularAnchorClosingMark),
                    (ref) => Array.append(ref),
                  ),
                ),
                Option.getOrElse(() => Function.identity),
              );

              return pipe(
                applicableNonPrimitiveParameters.propertyNumberDisplayOption,
                MMatch.make,
                MMatch.whenIs(PPPropertyNumberDisplayOption.Type.None, () => []),
                MMatch.whenIs(PPPropertyNumberDisplayOption.Type.All, () => [allPropertyNumber]),
                MMatch.whenIs(PPPropertyNumberDisplayOption.Type.Actual, () => [children.length]),
                MMatch.whenIs(PPPropertyNumberDisplayOption.Type.AllAndActual, () => [
                  allPropertyNumber,
                  children.length,
                ]),
                MMatch.whenIs(PPPropertyNumberDisplayOption.Type.AllAndActualIfDifferent, () => {
                  const addActualIfDifferent: MTypes.OneArgFunction<ReadonlyArray<number>> = pipe(
                    children.length,
                    Result.liftPredicate(
                      MPredicate.strictEquals(allPropertyNumber),
                      (actualPropertyNumber) => Array.append(actualPropertyNumber),
                    ),
                    Result.map(() => Function.identity),
                    Result.merge,
                  );
                  return pipe(allPropertyNumber, Array.of, addActualIfDifferent);
                }),
                MMatch.exhaustive,
                Array.map(MString.fromNumber(10)),
                Array.join(parameters.propertyNumberSeparatorMark),
                MString.surroundIfNotEmpty({
                  prefix: parameters.propertyNumberOpeningMark,
                  suffix: parameters.propertyNumberClosingMark,
                }),
                MFunction.fIfTrue({
                  condition: applicableNonPrimitiveParameters.showName,
                  f: MString.prepend(parameters.name(seed.content)),
                }),
                Array.make,
                prependCyclicalRef,
                MArray.removeEmptyAndJoin(parameters.headerSeparatorMark),
                tagStyler,
              );
            };

            // Don't show the properties if `maxPrototypeDepth <= 0` and either iteration is disabled or the value is not iterable: there can be no properties in that case. This is the case for functions for which we don't want to see an empty property block `{}`
            const stringified =
              applicableNonPrimitiveParameters.maxPrototypeDepth > 0 ||
              (applicableNonPrimitiveParameters.extractIterableElements &&
                MTypes.isIterable(seed.content))
                ? pipe(
                    children,
                    Array.map(
                      flow(
                        Struct.renameKeys({
                          seed: 'property',
                          stringified: 'stringifiedPropValue',
                        }),
                        MStruct.append({ parameters, hideKey: hideAutoGeneratedKeys }),
                        PPPropertyFormatter.action(
                          applicableNonPrimitiveParameters.propertyFormatter,
                        ),
                      ),
                    ),
                    MStruct.make('stringifiedProperties'),
                    MStruct.append({
                      nonPrimitive: seed,
                      header,
                      parameters,
                      applicableNonPrimitiveParameters,
                    }),
                    PPNonPrimitiveFormatter.action(
                      applicableNonPrimitiveParameters.nonPrimitiveFormatter,
                    ),
                  )
                : PPStringifiedValue.fromText(header());

            return {
              stringified,
              seed,
              isLeaf: false,
            };
          },
          foldLeaf: MStruct.enrichWith({ isLeaf: Function.constTrue }),
          seedEquivalence: PPValue.equivalence,
        }),
        Struct.get('stringified'),
      );
      return internalStringify(value);
    };
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
 * Constructs a `PPStringifier` from a `PPParameters` instance
 *
 * @category Constructors
 */
export const make = (parameters: PPParameters.Type): Type => new Type(parameters);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;
