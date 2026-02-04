/**
 * This module implements a `CVTemplate` (see Template.ts) dedicated to parsing and formatting
 * dates. It supports many of the available unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 */

import {
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
  Pipeable,
  Predicate,
  Record,
  Struct,
  Tuple,
} from 'effect';
import * as CVDateTime from './DateTime.js';
import * as CVDateTimeFormatContext from './DateTimeFormatContext.js';
import * as CVReal from './Real.js';
import * as CVTemplate from './Template.js';
import * as CVTemplatePart from './TemplatePart.js';
import * as CVTemplatePartPlaceholder from './TemplatePartPlaceholder.js';
import * as CVTemplateParts from './TemplateParts.js';
import * as CVTemplatePartSeparator from './TemplatePartSeparator.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/DateTimeFormat/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace for a TemplatePart
 *
 * @category Models
 */
export namespace TemplatePart {
  const _tag = moduleTag + 'TemplatePart/';
  /**
   * Type of a TemplatePart
   *
   * @category Models
   */
  export type Type = Placeholder.Type | Separator.Type;

  /**
   * Type guard
   *
   * @category Guards
   */
  export const isPlaceholder = (u: Type): u is Placeholder.Type => Placeholder.has(u);

  /**
   * Type guard
   *
   * @category Guards
   */
  export const isSeparator = (u: Type): u is Separator.Type => Separator.has(u);

  /**
   * Namespace for a TemplatePart that represents a part of a date time
   *
   * @category Models
   */
  export namespace Placeholder {
    const _namespaceTag = _tag + 'Placeholder/';
    const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
    type _TypeId = typeof _TypeId;

    /**
     * Type that represents a Placeholder
     *
     * @category Model
     */
    export interface Type extends MInspectable.Type, Pipeable.Pipeable {
      /** Name of this Placeholder */
      readonly name: CVDateTimeFormatContext.Token;

      /** @internal */
      readonly [_TypeId]: _TypeId;
    }

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
        return this.name;
      },
      ...MInspectable.BaseProto(moduleTag),
      ...MPipeable.BaseProto,
    };

    const _make = (params: MTypes.Data<Type>): Type =>
      MTypes.objectFromDataAndProto(_proto, params);

    /**
     * Placeholder constructor
     *
     * @category Constructors
     */
    export const make = (name: CVDateTimeFormatContext.Token): Type => _make({ name });

    /**
     * Returns the `name` property of `self`
     *
     * @category Destructors
     */
    export const name: MTypes.OneArgFunction<Type, CVDateTimeFormatContext.Token> =
      Struct.get('name');
  }

  /**
   * Namespace for a TemplatePart that represents a Separator
   *
   * @category Models
   */
  export namespace Separator {
    const _namespaceTag = _tag + 'Separator/';
    const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
    type _TypeId = typeof _TypeId;

    /**
     * Type that represents a SeparatorTemplatePart
     *
     * @category Model
     */
    export interface Type extends MInspectable.Type, Pipeable.Pipeable {
      /** The separator */
      readonly value: string;

      /** @internal */
      readonly [_TypeId]: _TypeId;
    }

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
        return this.value;
      },
      ...MInspectable.BaseProto(moduleTag),
      ...MPipeable.BaseProto,
    };

    const _make = (params: MTypes.Data<Type>): Type =>
      MTypes.objectFromDataAndProto(_proto, params);

    /**
     * Placeholder constructor
     *
     * @category Constructors
     */
    export const make = (value: string): Type => _make({ value });

    /**
     * Returns the `value` property of `self`
     *
     * @category Destructors
     */
    export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');

    /**
     * Slash Separator instance
     *
     * @category Instances
     */
    export const slash: Type = make('/');

    /**
     * Backslash Separator instance
     *
     * @category Instances
     */
    export const backslash: Type = make('\\');

    /**
     * Dot Separator instance
     *
     * @category Instances
     */
    export const dot: Type = make('.');

    /**
     * Hyphen Separator instance
     *
     * @category Instances
     */
    export const hyphen: Type = make('-');

    /**
     * Colon Separator instance
     *
     * @category Instances
     */
    export const colon: Type = make(':');

    /**
     * Comma Separator instance
     *
     * @category Instances
     */
    export const comma: Type = make(',');

    /**
     * Space Separator instance
     *
     * @category Instances
     */
    export const space: Type = make(' ');
  }
}

/**
 * Namespace TemplateParts
 *
 * @category Models
 */
export namespace TemplateParts {
  /**
   * Type of an array of TemplatePart's
   *
   * @category Models
   */
  export interface Type extends ReadonlyArray<TemplatePart.Type> {}
}

/**
 * Namespace of a DateTimeFormat Parser
 *
 * @category Models
 */
export namespace Parser {
  /**
   * Type that describes a DateTimeFormat Parser
   *
   * @category Models
   */
  export interface Type extends MTypes.OneArgFunction<
    string,
    Either.Either<CVDateTime.Type, MInputError.Type>
  > {}
}

/**
 * Namespace of a DateTimeFormat Formatter
 *
 * @category Models
 */
export namespace Formatter {
  /**
   * Type that describes a DateTimeFormat Formatter
   *
   * @category Models
   */
  export interface Type extends MTypes.OneArgFunction<
    CVDateTime.Type,
    Either.Either<string, MInputError.Type>
  > {}
}

/**
 * Type that represents a DateTimeFormat.
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
  /** The CVDateTimeFormatContext of this DateTimeFormat */
  readonly context: CVDateTimeFormatContext.Type;

  /** The array of TemplatePart's contituting this DateTimeFormat */
  readonly templateParts: TemplateParts.Type;

  /** @internal */
  readonly _template: CVTemplate.Type<CVTemplateParts.Type<CVReal.Type>>;

  readonly [_TypeId]: _TypeId;
}

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
    _template: template,
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

export const toParser = (self: Type): Parser.Type => {
  return flow(
    CVTemplate.toParser(self._template),
    Either.flatMap((o) => CVDateTime.fromParts(o as CVDateTime.Parts.Type)),
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

export const toFormatter = (self: Type): Formatter.Type => {
  const toParts: Record.ReadonlyRecord<
    string,
    MTypes.OneArgFunction<CVDateTime.Type, number>
  > = pipe(
    self._template.templateParts,
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
  const formatter = CVTemplate.toFormatter(self._template);

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
