/**
 * This module implements a `CVTemplate` (see Template.ts) dedicated to parsing and formatting
 * dates. It supports many of the available unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 */

import {
  MData,
  MInputError,
  MInspectable,
  MMatch,
  MPipeable,
  MString,
  MTypes,
} from '@parischap/effect-lib';
import {
  Array,
  Either,
  flow,
  Function,
  HashMap,
  Option,
  pipe,
  Predicate,
  Record,
  Struct,
  Tuple,
} from 'effect';
import * as CVDateTime from '../../DateTime/index.js';
import * as CVTemplateParts from '../../internal/formatting/TemplateParts.js';
import * as CVReal from '../../primitive/Real.js';
import * as CVTemplate from '../Template.js';
import * as CVTemplatePart from '../TemplatePart/index.js';
import * as CVTemplatePartPlaceholder from '../TemplatePart/Placeholder/index.js';
import * as CVTemplatePartSeparator from '../TemplatePart/Separator.js';
import * as CVDateTimeFormatContext from './DateTimeFormatContext.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/DateTimeFormat/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVDateTimeFormat
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** The CVDateTimeFormatContext of this DateTimeFormat */
  readonly context: CVDateTimeFormatContext.Type;

  /** The array of TemplatePart's contituting this DateTimeFormat */
  readonly templateParts: CVTemplateParts.Type;

  // template built from `templateParts`
  readonly template: CVTemplate.Type<CVTemplateParts.Type<CVReal.Type>>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return '';
    };
  }

  /** Class constructor */
  private constructor({ context, templateParts, template }: MTypes.Data<Type>) {
    super();
    this.context = context;
    this.templateParts = templateParts;
    this.template = template;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a CVDateTimeFormat
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Prototype */
const _proto: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  [MInspectable.IdSymbol](this: Type) {
    return pipe(
      this.templateParts,
      Array.map((p) => p.toString()),
      Array.join(''),
      MString.prepend("'"),
      MString.append(`' in '${this.context.name}' context`),
    );
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(_proto, params);

/**
 * Builds a DateTimeFormat from a Context `context` and an array of TemplatePart's `templateParts`
 *
 * @category Constructors
 */
export const make = ({
  context,
  templateParts,
}: {
  readonly context: CVDateTimeFormatContext.Type;
  readonly templateParts: ReadonlyArray<TemplatePart.Type>;
}): Type => {
  const getter = (
    name: CVDateTimeFormatContext.Token,
  ): CVTemplatePartPlaceholder.Type<string, CVReal.Type> =>
    pipe(
      context.tokenMap,
      HashMap.get(name),
      Option.getOrThrowWith(
        () => new Error(`Abnormal error: no TemplatePart was defined with name '${name}'`),
      ),
    );

  const template: CVTemplate.Type<CVTemplateParts.Type<CVReal.Type>> = pipe(
    templateParts,
    Array.map(
      flow(
        MMatch.make,
        MMatch.when(TemplatePart.isPlaceholder, flow(TemplatePart.Placeholder.name, getter)),
        MMatch.when(TemplatePart.isSeparator, ({ value }) => CVTemplatePartSeparator.make(value)),
        MMatch.exhaustive,
      ),
    ),
    Function.tupled(CVTemplate.make),
  );

  return _make({
    context,
    templateParts: templateParts,
    template: template,
  });
};

/**
 * Returns the `context` property of `self`
 *
 * @category Destructors
 */
export const context: MTypes.OneArgFunction<Type, CVDateTimeFormatContext.Type> =
  Struct.get('context');

/**
 * Returns the `templateParts` property of `self`
 *
 * @category Destructors
 */
export const templateParts: MTypes.OneArgFunction<Type, TemplateParts.Type> =
  Struct.get('templateParts');

/**
 * Returns a function that parses a text into a DateTime according to 'self'. See DateTime.fromParts
 * for more information on default values and errors.
 *
 * @category Parsing
 */

export const toParser = (
  self: Type,
): MTypes.OneArgFunction<string, Either.Either<CVDateTime.Type, MInputError.Type>> => {
  return flow(
    CVTemplate.toParser(self.template),
    Either.flatMap((o) => CVDateTime.fromParts(o as DateTimeParts)),
  );
};

/**
 * Same as toParser but the returned parser returns directly a CVDateTime or throws in case of
 * failure
 *
 * @category Parsing
 */
export const toThrowingParser: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, CVDateTime.Type>
> = flow(toParser, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * Returns a function that formats a DateTime according to 'self'.
 *
 * @category Formatting
 */

export const toFormatter = (
  self: Type,
): MTypes.OneArgFunction<CVDateTime.Type, Either.Either<string, MInputError.Type>> => {
  const toParts: Record.ReadonlyRecord<
    string,
    MTypes.OneArgFunction<CVDateTime.Type, number>
  > = pipe(
    self.template.templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(CVTemplatePart.isSeparator, () => Option.none()),
        MMatch.when(
          CVTemplatePart.isPlaceholder,
          flow(
            CVTemplatePartPlaceholder.name,
            MMatch.make,
            flow(
              MMatch.whenIs(
                'year',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getYear), Option.some),
              ),
              MMatch.whenIs(
                'ordinalDay',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getOrdinalDay), Option.some),
              ),
              MMatch.whenIs(
                'month',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonth), Option.some),
              ),
              MMatch.whenIs(
                'monthDay',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonthDay), Option.some),
              ),
              MMatch.whenIs(
                'isoYear',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoYear), Option.some),
              ),
              MMatch.whenIs(
                'isoWeek',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoWeek), Option.some),
              ),
              MMatch.whenIs(
                'weekday',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getWeekday), Option.some),
              ),
              MMatch.whenIs(
                'hour23',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour23), Option.some),
              ),
              MMatch.whenIs(
                'hour11',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour11), Option.some),
              ),
            ),
            flow(
              MMatch.whenIs(
                'meridiem',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMeridiem), Option.some),
              ),
              MMatch.whenIs(
                'minute',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMinute), Option.some),
              ),
              MMatch.whenIs(
                'second',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getSecond), Option.some),
              ),
              MMatch.whenIs(
                'millisecond',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMillisecond), Option.some),
              ),
              MMatch.whenIs(
                'zoneHour',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneHour), Option.some),
              ),
              MMatch.whenIs(
                'zoneMinute',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneMinute), Option.some),
              ),
              MMatch.whenIs(
                'zoneSecond',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneSecond), Option.some),
              ),
            ),
            MMatch.orElse(() => Option.none()),
          ),
        ),
        MMatch.exhaustive,
      ) as MTypes.OneArgFunction<
        CVTemplatePart.Type<string, CVReal.Type>,
        Option.Option<readonly [string, MTypes.OneArgFunction<CVDateTime.Type, number>]>
      >,
    ),
    Record.fromEntries,
  );
  const formatter = CVTemplate.toFormatter(self.template);

  return (d) => pipe(toParts, Record.map(Function.apply(d)), formatter);
};

/**
 * Same as toFormatter but the returned formatter returns directly a string or throws in case of
 * error
 *
 * @category Formatting
 */
export const toThrowingFormatter: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<CVDateTime.Type, string>
> = flow(toFormatter, Function.compose(Either.getOrThrowWith(Function.identity)));
