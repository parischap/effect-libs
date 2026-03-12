/**
 * This module implements a PPStringifier, i.e. an object that can transform an unknown to a
 * PPStringifiedValue
 */

import { pipe } from 'effect';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Predicate from 'effect/Predicate';

import * as PPValue from '../internal/stringification/Value.js';
import * as PPParameters from '../parameters/index.js';
import * as PPMarkShowerConstructor from '../parameters/MarkShowerConstructor.js';
import * as PPPrimitiveFormatter from '../parameters/PrimitiveFormatter.js';
import * as PPStyleMap from '../parameters/StyleMap.js';
import * as PPValueBasedStylerConstructor from '../parameters/ValueBasedStylerConstructor.js';
import * as PPStringifiedValue from './StringifiedValue.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/PPStringifier/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a PPStringifier
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  readonly parameters: PPParameters.Type;
  readonly markShowers: HashMap.HashMap<string, MTypes.OneArgFunction<PPValue.Any, ASText.Type>>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return `${this.parameters.name}Stringifier`;
    };
  }

  /** Class constructor */
  private constructor({ parameters, markShowers }: MTypes.Data<Type>) {
    super();
    this.parameters = parameters;
    this.markShowers = markShowers;
  }

  /** Static constructor */
  static make(parameters: PPParameters.Type): Type {
    return new Type({
      parameters,
      markShowers: HashMap.map(parameters.markMap.marks, (mark) => {
        const styler = PPStyleMap.get(parameters.styleMap, mark.partName);
        return (value: PPValue.Any): ASText.Type => styler(value)(mark.text);
      }),
    });
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
 * Constructor of a PPStringifier
 *
 * @category Constructors
 */
export const make = (parameters: PPParameters.Type): Type => Type.make(parameters);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  that.parameters === self.parameters;

/**
 * Builds a Stringifier from an Option
 *
 * @category Destructors
 */

export const toStringifier = (
  self: Type,
): MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> => {
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(self.parameters);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(self.parameters);

  const constructors = { markShowerConstructor, valueBasedStylerConstructor };

  const primitiveValueTextFormatter = valueBasedStylerConstructor('PrimitiveValue');
  const messageTextFormatter = valueBasedStylerConstructor('Message');

  const circularObjectMarkShower = markShowerConstructor('CircularObject');
  const circularReferenceStartDelimiterMarkShower = markShowerConstructor(
    'CircularReferenceStartDelimiter',
  );
  const circularReferenceEndDelimiterMarkShower = markShowerConstructor(
    'CircularReferenceEndDelimiter',
  );
  const messageStartDelimiterMarkShower = markShowerConstructor('MessageStartDelimiter');
  const messageEndDelimiterMarkShower = markShowerConstructor('MessageEndDelimiter');

  const initializedByPasser = PPByPassers.toSyntheticByPasser(self.parameters.byPassers)(
    constructors,
  );

  const toInitializedNonPrimitiveOption = NonPrimitive.Initialized.fromNonPrimitive(constructors);

  const initializedNonPrimitiveOptionCache = MCache.make({
    lookUp: ({ key }: { readonly key: NonPrimitive.Type }) =>
      Tuple.make(toInitializedNonPrimitiveOption(key), true),
  });

  const initializedNonPrimitiveOptionGetter = MCache.toGetter(initializedNonPrimitiveOptionCache);
  const initializedGeneralNonPrimitiveOption = initializedNonPrimitiveOptionGetter(
    self.parameters.generalNonPrimitiveParameters,
  );

  const functionToNameByPasser = PPByPasser.functionToName.action.call(
    self.parameters,
    constructors,
  );

  let lastCyclicalIndex = 1;
  const cyclicalMap = MutableHashMap.empty<PPValue.NonPrimitive, number>();

  const stringifier: Stringifier.Type = flow(
    PPValue.fromTopValue,
    MTree.unfoldAndFold<
      readonly [
        nonPrimitiveValue: PPValue.NonPrimitive,
        nonPrimitiveOption: NonPrimitive.Initialized.Type,
        allPropertyNumber: number,
      ],
      readonly [stringified: PPStringifiedValue.Type, value: PPValue.Any, isLeaf: boolean],
      PPValue.Any
    >({
      unfold: (seed, cycleSource) =>
        pipe(
          Either.gen(function* () {
            const notByPassed = yield* pipe(
              seed,
              initializedByPasser,
              Either.fromOption(Function.constant(seed)),
              Either.flip,
            );

            const unBypassedNonPrimitive = yield* pipe(
              notByPassed,
              Either.liftPredicate(
                PPValue.isNonPrimitive,
                Function.unsafeCoerce<PPValue.Any, PPValue.Primitive>,
              ),
              Either.mapLeft(
                flow(
                  PPPrimitiveFormatter.format(self.parameters.primitiveFormatter)(self.parameters),
                  primitiveValueTextFormatter(notByPassed),
                  PPStringifiedValue.fromText,
                ),
              ),
            );

            const initializedNonPrimitiveOption = pipe(
              unBypassedNonPrimitive,
              self.parameters.specificNonPrimitiveParameters,
              Option.map(initializedNonPrimitiveOptionGetter),
              Option.getOrElse(() => initializedGeneralNonPrimitiveOption),
            );

            const unBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
              unBypassedNonPrimitive,
              Either.liftPredicate(
                flow(PPValue.depth, Number.lessThan(self.parameters.maxDepth)),
                flow(
                  functionToNameByPasser,
                  Option.getOrElse(
                    pipe(
                      initializedNonPrimitiveOption.id,
                      messageTextFormatter(unBypassedNonPrimitive),
                      ASText.surround(
                        messageStartDelimiterMarkShower(unBypassedNonPrimitive),
                        messageEndDelimiterMarkShower(unBypassedNonPrimitive),
                      ),
                      PPStringifiedValue.fromText,
                      Function.constant,
                    ),
                  ),
                ),
              ),
            );

            const unCyclicalUnBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
              cycleSource,
              Option.map(([cyclicalValue]) =>
                pipe(
                  cyclicalMap,
                  MutableHashMap.get(cyclicalValue),
                  Option.getOrElse(() => {
                    MutableHashMap.set(cyclicalMap, cyclicalValue, lastCyclicalIndex);
                    return lastCyclicalIndex++;
                  }),
                  MString.fromNumber(10),
                  messageTextFormatter(unBypassedNonPrimitiveUnderMaxDepth),
                  ASText.prepend(circularObjectMarkShower(unBypassedNonPrimitiveUnderMaxDepth)),
                  ASText.surround(
                    messageStartDelimiterMarkShower(unBypassedNonPrimitiveUnderMaxDepth),
                    messageEndDelimiterMarkShower(unBypassedNonPrimitiveUnderMaxDepth),
                  ),
                  PPStringifiedValue.fromText,
                ),
              ),
              Either.fromOption(Function.constant(unBypassedNonPrimitiveUnderMaxDepth)),
              Either.flip,
            );

            const properties = pipe(
              initializedNonPrimitiveOption.propertySource,
              MMatch.make,
              MMatch.whenIs(PropertySource.FromProperties, () =>
                pipe(initializedNonPrimitiveOption.maxPrototypeDepth, PPValues.fromProperties),
              ),
              MMatch.whenIs(
                PropertySource.FromValueIterable,
                Function.constant(PPValues.fromValueIterable),
              ),
              MMatch.whenIs(PropertySource.FromKeyValueIterable, () =>
                PPValues.fromKeyValueIterable(stringifier),
              ),
              MMatch.exhaustive,
              Function.apply(unCyclicalUnBypassedNonPrimitiveUnderMaxDepth),
            );

            const sort: MTypes.OneArgFunction<PPValues.Type> = pipe(
              initializedNonPrimitiveOption.propertySortOrder,
              Option.map((order) => Array.sort(order)),
              Option.getOrElse(MFunction.constIdentity),
            );

            const filteredAndSortedProperties = pipe(
              properties,
              initializedNonPrimitiveOption.syntheticPropertyFilter,
              sort,
              MFunction.fIfTrue({
                condition: initializedNonPrimitiveOption.dedupeProperties,
                f: Array.dedupeWith(
                  (self, that) => self.oneLineStringKey === that.oneLineStringKey,
                ),
              }),
              Array.take(initializedNonPrimitiveOption.maxPropertyNumber),
            );

            return Tuple.make(
              Tuple.make(
                unCyclicalUnBypassedNonPrimitiveUnderMaxDepth,
                initializedNonPrimitiveOption,
                properties.length,
              ),
              filteredAndSortedProperties,
            );
          }),
          Either.mapLeft(flow(Tuple.make, Tuple.appendElement(seed), Tuple.appendElement(true))),
        ),
      foldNonLeaf: ([nonPrimitive, initializedNonPrimitiveOption, allPropertyNumber], children) =>
        pipe(
          children,
          Array.map(([stringified, value, isLeaf]) =>
            pipe(
              stringified,
              initializedNonPrimitiveOption.initializedPropertyFormatter({ value, isLeaf }),
            ),
          ),
          initializedNonPrimitiveOption.initializedNonPrimitiveFormatter({
            value: nonPrimitive,
            header: pipe(
              cyclicalMap,
              MutableHashMap.get(nonPrimitive),
              Option.map(
                flow(
                  MString.fromNumber(10),
                  messageTextFormatter(nonPrimitive),
                  ASText.prepend(circularReferenceStartDelimiterMarkShower(nonPrimitive)),
                  ASText.append(circularReferenceEndDelimiterMarkShower(nonPrimitive)),
                ),
              ),
              Option.getOrElse(() => ASText.empty),
              ASText.append(
                pipe(
                  nonPrimitive,
                  initializedNonPrimitiveOption.toHeaderMarkShower({
                    allPropertyNumber,
                    actualPropertyNumber: children.length,
                  }),
                ),
              ),
            ),
          }),
          Tuple.make,
          Tuple.appendElement(nonPrimitive),
          Tuple.appendElement(false),
        ),
      foldLeaf: Function.identity,
    }),
    ([first]) => first,
  );

  return stringifier;
};
