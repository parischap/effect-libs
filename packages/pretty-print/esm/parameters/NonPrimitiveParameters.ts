/**
 * This module implements the pretty-printing parameters specific to non-primitive values. In a
 * `PPParameters`, there is a default `PPNonPrimitiveParameters` which is used for all non-primitive
 * values for which a more specific `PPNonPrimitiveParameters` has not been defined
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */
import * as ASText from '@parischap/ansi-styles/ASText'
import * as MData from '@parischap/effect-lib/MData'
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MString from '@parischap/effect-lib/MString'
import * as MStruct from '@parischap/effect-lib/MStruct'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Struct from 'effect/Struct'
import * as Tuple from 'effect/Tuple'

import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as Predicate from 'effect/Predicate'
import * as PPMarkShowerConstructor from '../internal/MarkShowerConstructor.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPPropertyFilters from './PropertyFilters.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPPropertyNumberDisplayOption from './PropertyNumberDisplayOption.js';
import * as PPPropertySource from './PropertySource.js';
import * as PPValueOrder from './ValueOrder.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/NonPrimitiveParameters/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPNonPrimitiveParameters
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /**
   * Id
   *
   * Name of the type of non-primitive value that `this` represents. This name is:
   *
   * - Used for equality and debugging
   * - Displayed in case `maxDepth` is superseded surrounded by the MessageStartDelimiter and
   *   MessageEndDelimiter marks. For instance: [Array]
   * - Displayed in front of the representation of the non-primitive value even if `maxDepth` is not
   *   superseded if `showName` is `true` (see below).
   */
  readonly name: string;

  /**
   * If true, the name will be shown just before the non-primitive value representation seperated
   * from it by the `NonPrimitiveValueNameSeparator` mark. For instance: `Map { 'a' => 1, 'b' => 2
   * }`
   */
  readonly showName: boolean;

  /**
   * Options regarding the display of the property number of a non-primitive value. If not `None`,
   * the property number will be suffixed to the id in between the `PropertyNumberStartDelimiter`
   * and `PropertyNumberEndDelimiter` marks. For `AllAndActual` and `AllAndActualIfDifferent`, the
   * `PropertyNumberSeparator` mark is used to seperate the two property numbers. For instance:
   * `Map(2) { 'a' => 1, 'b' => 2 }` with `Actual` or `Map(5,2) { 'a' => 1, 'b' => 2 }` with
   * `AllAndActual`
   */
  readonly propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type;

  /** Key/value separator mark for that type of non-primitive value. For instance ': ' for an array */
  readonly keyValueSeparatorMark: string;

  /**
   * Mark shown before the representation of a non-primitive value when it is displayed on a single
   * line. For instance '{ ' for a record
   */
  readonly singleLineStartDelimiterMark: string;

  /**
   * Mark shown after the representation of a non-primitive value when it is displayed on a single
   * line. For instance ' }' for a record
   */
  readonly singleLineEndDelimiterMark: string;

  /**
   * Mark shown before the representation of a non-primitive value when it is displayed on multiple
   * lines. For instance '{' for a record
   */
  readonly multiLineStartDelimiterMark: string;

  /**
   * Mark shown after the representation of a non-primitive value when it is displayed on multiple
   * lines. For instance '}' for a record
   */
  readonly multiLineEndDelimiterMark: string;

  /**
   * Mark repeated before the key of the property of a non-primitive value to indicate the depth of
   * that key in the prototypal chain. For instance '@'. `@` means that the key is on the direct
   * prototype of the non-primitive value and '@@' means that the key is on the prototype of the
   * prototype of the non-primitive value
   */
  readonly prototypeStartDelimiterMark: string;

  /**
   * Mark repeated after the key of the property of a non-primitive value to indicate the depth of
   * that key in the prototypal chain. For instance '@'. `@` means that the key is on the direct
   * prototype of the non-primitive value and '@@' means that the key is on the prototype of the
   * prototype of the non-primitive value
   */
  readonly prototypeEndDelimiterMark: string;
  /**
   * Mark shown in between the properties of a non-primitive value when it is displayed on a single
   * line. For instance ', ' for a record
   */
  readonly singleLineInBetweenPropertySeparatorMark: string;

  /**
   * Mark shown in between the properties of a non-primitive value when it is displayed on multiple
   * lines. For instance ',' for a record
   */
  readonly multiLineInBetweenPropertySeparatorMark: string;

  /**
   * Mark displayed after the name of that type of non-primitive value when the name is displayed.
   * For instance ' '
   */
  readonly nameSeparatorMark: string;

  /**
   * Separator used between the property numbers displayed for that type of non-primitive value
   * (when property numbers are displayed, see `propertyNumberDisplayOption`). For instance ','
   */
  readonly propertyNumberSeparatorMark: string;

  /**
   * Mark shown before the property numbers displayed for that type of non-primitive value (when
   * property numbers are displayed, see `propertyNumberDisplayOption`). For instance '('
   */
  readonly propertyNumberStartDelimiterMark: string;

  /**
   * Mark shown after the property numbers displayed for that type of non-primitive value (when
   * property numbers are displayed, see `propertyNumberDisplayOption`). For instance ')'
   */
  readonly propertyNumberEndDelimiterMark: string;

  /**
   * Specifies the source of properties for that type of non-primitive values. See PropertySource.ts
   * for more details
   */
  readonly propertySource: PPPropertySource.Type;

  /**
   * Indicates the level in the prototypal chain of a non-primitive value down to which properties
   * are shown. This value is only used when propertySource is `FromProperties`. maxPrototypeDepth
   * <= 0 means that only the own properties of a non-primitive value are shown. maxPrototypeDepth =
   * 1 means that only the own properties of a non-primitive value and that of its direct prototype
   * are shown...
   */
  readonly maxPrototypeDepth: number;

  /**
   * Array of `PPPropertyFilter` instances applied successively just after retrieving the properties
   * of a non-primitive value from the selected source (see PropertyFilter.ts)
   */
  readonly propertyFilters: PPPropertyFilters.Type;

  /**
   * Order to use to sort the properties of that type of non-primitive values just after application
   * of the propertyFilters. If `none` is passed, properties are not sorted
   */
  readonly propertySortOrder: Option.Option<PPValueOrder.Type>;

  /**
   * Non-primitive values can have several properties with the same key. For instance, the same key
   * can appear in an object and one or several of its prototypes. This option allows you to decide
   * if you want to keep all the properties with the same key. If true, only the first occurrence of
   * each property with the same key is kept. Sorting happens before deduping, so you can decide
   * which property will be first by choosing your propertySortOrder carefully (e.g. you may use
   * `PropertyOrder.byPrototypalDepth`. If false, all occurrences of the same property are kept.
   */
  readonly dedupeProperties: boolean;

  /**
   * Maximal number of properties to keep for non-primitive values. Pass +Infinity to show all
   * properties. Keeps the `maxPropertyNumber` first properties after filtering, sorting and
   * deduping.
   */
  readonly maxPropertyNumber: number;

  /**
   * `PPPropertyFormatter` instance which allows you to specify how to format properties of
   * non-primitive values (see PropertyFormatter.ts)
   */
  readonly propertyFormatter: PPPropertyFormatter.Type;

  /**
   * `PPNonPrimitiveFormatter` instance: allows you to specify how to print a non-primitive value
   * from its stringified properties (see NonPrimitiveFormatter.ts)
   */
  readonly nonPrimitiveFormatter: PPNonPrimitiveFormatter.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({
    name,
    showName,
    propertyNumberDisplayOption,
    keyValueSeparatorMark,
    singleLineStartDelimiterMark,
    singleLineEndDelimiterMark,
    multiLineStartDelimiterMark,
    multiLineEndDelimiterMark,
    prototypeStartDelimiterMark,
    prototypeEndDelimiterMark,
    singleLineInBetweenPropertySeparatorMark,
    multiLineInBetweenPropertySeparatorMark,
    nameSeparatorMark,
    propertyNumberSeparatorMark,
    propertyNumberStartDelimiterMark,
    propertyNumberEndDelimiterMark,
    propertySource,
    maxPrototypeDepth,
    propertyFilters,
    propertySortOrder,
    dedupeProperties,
    maxPropertyNumber,
    propertyFormatter,
    nonPrimitiveFormatter,
  }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.showName = showName;
    this.propertyNumberDisplayOption = propertyNumberDisplayOption;
    this.keyValueSeparatorMark = keyValueSeparatorMark;
    this.singleLineStartDelimiterMark = singleLineStartDelimiterMark;
    this.singleLineEndDelimiterMark = singleLineEndDelimiterMark;
    this.multiLineStartDelimiterMark = multiLineStartDelimiterMark;
    this.multiLineEndDelimiterMark = multiLineEndDelimiterMark;
    this.prototypeStartDelimiterMark = prototypeStartDelimiterMark;
    this.prototypeEndDelimiterMark = prototypeEndDelimiterMark;
    this.singleLineInBetweenPropertySeparatorMark = singleLineInBetweenPropertySeparatorMark;
    this.multiLineInBetweenPropertySeparatorMark = multiLineInBetweenPropertySeparatorMark;
    this.nameSeparatorMark = nameSeparatorMark;
    this.propertyNumberSeparatorMark = propertyNumberSeparatorMark;
    this.propertyNumberStartDelimiterMark = propertyNumberStartDelimiterMark;
    this.propertyNumberEndDelimiterMark = propertyNumberEndDelimiterMark;
    this.propertySource = propertySource;
    this.maxPrototypeDepth = maxPrototypeDepth;
    this.propertyFilters = propertyFilters;
    this.propertySortOrder = propertySortOrder;
    this.dedupeProperties = dedupeProperties;
    this.maxPropertyNumber = maxPropertyNumber;
    this.propertyFormatter = propertyFormatter;
    this.nonPrimitiveFormatter = nonPrimitiveFormatter;
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
 * Constructor of a PPNonPrimitiveParameters
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
 * Default `PPNonPrimitiveParameters` instance
 *
 * @category Instances
 */
export const record: Type = make({
  name: 'Object',
  showName: false,
  propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.None,
  keyValueSeparatorMark: ': ',
  singleLineStartDelimiterMark: '{ ',
  singleLineEndDelimiterMark: ' }',
  multiLineStartDelimiterMark: '{',
  multiLineEndDelimiterMark: '}',
  prototypeStartDelimiterMark: '',
  prototypeEndDelimiterMark: '@',
  singleLineInBetweenPropertySeparatorMark: ', ',
  multiLineInBetweenPropertySeparatorMark: ',',
  nameSeparatorMark: ' ',
  propertyNumberSeparatorMark: ',',
  propertyNumberStartDelimiterMark: '(',
  propertyNumberEndDelimiterMark: ')',
  propertySource: PPPropertySource.Type.FromProperties,
  maxPrototypeDepth: 0,
  propertyFilters: PPPropertyFilters.utilInspectLike,
  propertySortOrder: Option.none(),
  dedupeProperties: false,
  maxPropertyNumber: 100,
  propertyFormatter: PPPropertyFormatter.keyAndValue,
  nonPrimitiveFormatter: PPNonPrimitiveFormatter.splitOnTotalLengthMaker(80),
});

/**
 * `PPNonPrimitiveParameters` instance for arrays
 *
 * @category Instances
 */
export const array: Type = pipe(
  record,
  MStruct.append({
    name: 'Array',
    propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.AllAndActualIfDifferent,
    singleLineStartDelimiterMark: '[ ',
    singleLineEndDelimiterMark: ' ]',
    multiLineStartDelimiterMark: '[',
    multiLineEndDelimiterMark: ']',
    propertySource: PPPropertySource.Type.FromValueIterable,
    propertyFilters: PPPropertyFilters.empty,
    propertyFormatter: PPPropertyFormatter.valueOnly,
  }),
  make,
);

/**
 * Constructor that generates a `PPNonPrimitiveParameters` instance for maps
 *
 * @category Constructors
 */
export const maps = (name: string): Type =>
  pipe(
    record,
    MStruct.append({
      name,
      showName: true,
      propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.AllAndActualIfDifferent,
      keyValueSeparatorMark: ' => ',
      propertySource: PPPropertySource.Type.FromKeyValueIterable,
      propertyFilters: PPPropertyFilters.empty,
      propertyFormatter: PPPropertyFormatter.keyAndValue,
    }),
    make,
  );

/**
 * Constructor that generates a `PPNonPrimitiveParameters` instance for sets and arrays other than
 * Array
 *
 * @category Constructors
 */
export const setsAndArrays = (name: string): Type =>
  pipe(
    record,
    MStruct.append({
      name,
      showName: true,
      propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.AllAndActualIfDifferent,
      propertySource: PPPropertySource.Type.FromValueIterable,
      propertyFilters: PPPropertyFilters.empty,
      propertyFormatter: PPPropertyFormatter.valueOnly,
    }),
    make,
  );

/**
 * Namespace of an initialized NonPrimitive Option
 *
 * @category Models
 */
export namespace Initialized {
  /**
   * Type of an InitializedNonPrimitiveOption
   *
   * @category Models
   */
  export interface Type extends MTypes.Data<NonPrimitive.Type> {
    readonly syntheticPropertyFilter: PPPropertyFilter.Action.Type;
    readonly initializedPropertyFormatter: PPPropertyFormatter.Action.Initialized.Type;
    readonly initializedNonPrimitiveFormatter: PPNonPrimitiveFormatter.Action.Initialized.Type;
    readonly toHeaderMarkShower: ({
      allPropertyNumber,
      actualPropertyNumber,
    }: {
      readonly allPropertyNumber: number;
      readonly actualPropertyNumber: number;
    }) => PPMarkShower.Type;
  }

  /**
   * Builds an Initialized from a NonPrimitive
   *
   * @category Constructors
   */
  export const fromNonPrimitive = (params: {
    readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
    readonly markShowerConstructor: PPMarkShowerConstructor.Type;
  }): MTypes.OneArgFunction<NonPrimitive.Type, Type> => {
    const { valueBasedStylerConstructor } = params;
    const nonPrimitiveValueIdTextFormatter = valueBasedStylerConstructor('NonPrimitiveValueName');
    const nonPrimitiveValueIdSeparatorTextFormatter = valueBasedStylerConstructor(
      'NonPrimitiveValueIdSeparator',
    );
    const propertyNumberDelimitersTextFormatter = valueBasedStylerConstructor(
      'PropertyNumberDelimiters',
    );
    const propertyNumberSeparatorTextFormatter =
      valueBasedStylerConstructor('PropertyNumberSeparator');
    const PropertyNumbersTextFormatter = valueBasedStylerConstructor('PropertyNumbers');

    return flow(
      MStruct.enrichWith({
        syntheticPropertyFilter: (nonPrimitiveOption): PPPropertyFilter.Action.Type =>
          PPPropertyFilters.toSyntheticPropertyFilter(nonPrimitiveOption.propertyFilters),
        initializedPropertyFormatter: (nonPrimitiveOption) =>
          nonPrimitiveOption.propertyFormatter(params),
        initializedNonPrimitiveFormatter: (nonPrimitiveOption) =>
          nonPrimitiveOption.nonPrimitiveFormatter(params),
        toHeaderMarkShower: (nonPrimitiveOption): Type['toHeaderMarkShower'] => {
          const emptyText = Function.constant(ASText.empty);

          const { propertyNumberDisplayOption } = nonPrimitiveOption;
          const isNone = propertyNumberDisplayOption === PropertyNumberDisplayOption.None;
          const isAll = propertyNumberDisplayOption === PropertyNumberDisplayOption.All;
          const isActual = propertyNumberDisplayOption === PropertyNumberDisplayOption.Actual;
          const isAllAndActual =
            propertyNumberDisplayOption === PropertyNumberDisplayOption.AllAndActual;
          const isAllAndActualIfDifferent =
            propertyNumberDisplayOption === PropertyNumberDisplayOption.AllAndActualIfDifferent;
          const { showId } = nonPrimitiveOption;

          const [propertyNumberStartDelimiter, propertyNumberEndDelimiter] =
            isNone ?
              Tuple.make(emptyText, emptyText)
            : Tuple.make(
                propertyNumberDelimitersTextFormatter.withContextLast(
                  nonPrimitiveOption.propertyNumberStartDelimiterMark,
                ),
                propertyNumberDelimitersTextFormatter.withContextLast(
                  nonPrimitiveOption.propertyNumberEndDelimiterMark,
                ),
              );

          const propertyNumberSeparator =
            isAllAndActual || isAllAndActualIfDifferent ?
              propertyNumberSeparatorTextFormatter.withContextLast(
                nonPrimitiveOption.propertyNumberSeparatorMark,
              )
            : emptyText;

          const idSeparator =
            showId || !isNone ?
              nonPrimitiveValueIdSeparatorTextFormatter.withContextLast(
                nonPrimitiveOption.idSeparatorMark,
              )
            : emptyText;

          const id =
            showId ?
              nonPrimitiveValueIdTextFormatter.withContextLast(nonPrimitiveOption.id)
            : emptyText;

          return ({ allPropertyNumber, actualPropertyNumber }) =>
            (value) => {
              const showAllAndActual =
                isAllAndActual
                || (isAllAndActualIfDifferent && allPropertyNumber !== actualPropertyNumber);

              const styledTotalPropertyNumber =
                isAll || showAllAndActual ?
                  pipe(
                    allPropertyNumber,
                    MString.fromNumber(10),
                    PropertyNumbersTextFormatter.withContextLast,
                    Function.apply(value),
                  )
                : ASText.empty;

              const styledActualPropertyNumber =
                isActual || showAllAndActual ?
                  pipe(
                    actualPropertyNumber,
                    MString.fromNumber(10),
                    PropertyNumbersTextFormatter.withContextLast,
                    Function.apply(value),
                  )
                : ASText.empty;

              const [
                inContextPropertyNumberStartDelimiter,
                inContextPropertyNumberSeparator,
                inContextPropertyNumberEndDelimiter,
                inContextIdSeparator,
              ] =
                isAllAndActualIfDifferent && allPropertyNumber === actualPropertyNumber ?
                  [
                    ASText.empty,
                    ASText.empty,
                    ASText.empty,
                    showId ? idSeparator(value) : ASText.empty,
                  ]
                : [
                    propertyNumberStartDelimiter(value),
                    propertyNumberSeparator(value),
                    propertyNumberEndDelimiter(value),
                    idSeparator(value),
                  ];

              return ASText.concat(
                id(value),
                inContextPropertyNumberStartDelimiter,
                styledTotalPropertyNumber,
                inContextPropertyNumberSeparator,
                styledActualPropertyNumber,
                inContextPropertyNumberEndDelimiter,
                inContextIdSeparator,
              );
            };
        },
      }),
    );
  };
}
