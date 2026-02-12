/**
 * This module implements a Stringifier, i.e. a function that transforms an unknown to a
 * PPStringifiedValue
 */

import { MTypes } from '@parischap/effect-lib';
import * as PPStringifiedValue from './StringifiedValue.js';

/**
 * Type of a PPStringifier
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> {}

/**
 * Builds a Stringifier from an Option
 *
 * @category Destructors
 */

export const toStringifier = (self: Type): Stringifier.Type => {
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(self);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(self);

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

  const initializedByPasser = PPByPassers.toSyntheticByPasser(self.byPassers).call(
    self,
    constructors,
  );

  const toInitializedNonPrimitiveOption = NonPrimitive.Initialized.fromNonPrimitive(constructors);

  const initializedNonPrimitiveOptionCache = MCache.make({
    lookUp: ({ key }: { readonly key: NonPrimitive.Type }) =>
      Tuple.make(toInitializedNonPrimitiveOption(key), true),
  });

  const initializedNonPrimitiveOptionGetter = MCache.toGetter(initializedNonPrimitiveOptionCache);
  const initializedGeneralNonPrimitiveOption = initializedNonPrimitiveOptionGetter(
    self.generalNonPrimitiveParameters,
  );

  const functionToNameByPasser = PPByPasser.functionToName.call(self, constructors);

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
                  self.primitiveFormatter,
                  primitiveValueTextFormatter(notByPassed),
                  PPStringifiedValue.fromText,
                ),
              ),
            );

            const initializedNonPrimitiveOption = pipe(
              unBypassedNonPrimitive,
              self.specificNonPrimitiveParameters,
              Option.map(initializedNonPrimitiveOptionGetter),
              Option.getOrElse(() => initializedGeneralNonPrimitiveOption),
            );

            const unBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
              unBypassedNonPrimitive,
              Either.liftPredicate(
                flow(PPValue.depth, Number.lessThan(self.maxDepth)),
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
              Option.getOrElse(() => Function.identity),
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
