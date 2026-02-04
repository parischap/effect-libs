/**
 * This module implements a `CVTemplatePartPlaceholder` type which is one of the constituents of
 * `CVTemplate`'s (see Template.ts and TemplatePart.ts)
 *
 * Each `CVTemplatePartPlaceholder` defines a parser and a formatter:
 *
 * - The parser takes a text, consumes a part of that text, optionnally converts the consumed part to
 *   a value of type T and, if successful, returns a `Right` of that value and of what has not been
 *   consumed. In case of failure, it returns a `Left`.
 * - The formatter takes a value of type T, converts it to a string (if T is not string), checks that
 *   the result is coherent and, if so, returns a `Right` of that string. Otherwise, it returns a
 *   `Left`
 */

import {
  MDataBase,
  MInputError,
  MRegExp,
  MRegExpString,
  MString,
  MStruct,
  MTuple,
  MTypes,
} from '@parischap/effect-lib';

import {
  Array,
  Either,
  flow,
  Function,
  HashMap,
  pipe,
  Schema,
  String,
  Struct,
  Tuple,
} from 'effect';

import * as CVNumberBase10Format from '../NumberBase10Format.js';
import * as CVReal from '../Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/TemplatePart/Placeholder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Parser
 *
 * @category Models
 */
export namespace Parser {
  /**
   * Type that describes a Parser
   *
   * @category Models
   */
  export interface Type<out T> extends MTypes.OneArgFunction<
    string,
    Either.Either<readonly [consumed: T, leftOver: string], MInputError.Type>
  > {}
}

/**
 * Namespace of a Formatter
 *
 * @category Models
 */
export namespace Formatter {
  /**
   * Type that describes a Formatter
   *
   * @category Models
   */
  export interface Type<in T> extends MTypes.OneArgFunction<
    T,
    Either.Either<string, MInputError.Type>
  > {}
}

/**
 * Type that represents a
 *
 * @category Models
 */
export class Type<out N extends string, in out T> extends MDataBase.Class {
  /** Name of this TemplatePartPlaceholder */
  readonly name: N;

  /** Label of this TemplatePartPlaceholder(usually the name prefixed with '#') */
  readonly label: string;

  /** Descriptor of this TemplatePartPlaceholder (used for debugging purposes) */
  readonly description: string;

  /** Parser of this TemplatePartPlaceholder */
  readonly parser: Parser.Type<T>;

  /** Formatter of this TemplatePartPlaceholder */
  readonly formatter: Formatter.Type<T>;

  /** Schema instance that represents type T */
  readonly tSchemaInstance: Schema.Schema<T, T>;

  /** Returns the `id` of `this` */
  [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<N, T>) {
      return getLabelledDescription(this);
    };
  }

  /** Class constructor */
  private constructor({
    name,
    label,
    description,
    parser,
    formatter,
    tSchemaInstance,
  }: MTypes.Data<Type<N, T>>) {
    super();
    this.name = name;
    this.label = label;
    this.description = description;
    this.parser = parser;
    this.formatter = formatter;
    this.tSchemaInstance = tSchemaInstance;
  }

  /** Static constructor */
  static make<N extends string, T>(params: MTypes.Data<Type<N, T>>): Type<N, T> {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _make = <N extends string, T>(params: MTypes.Data<Type<N, T>>): Type<N, T> =>
  Type.make(params);

/**
 * Type that represents a `CVTemplatePartPlaceholder` from and to any type
 *
 * @category Models
 */
export interface Any extends Type<string, any> {}

/**
 * Utility type that extracts the Name type of a `CVTemplatePartPlaceholder`
 *
 * @category Utility types
 */
export type ExtractName<P extends Any> = P extends Type<infer N, infer _> ? N : never;

/**
 * Utility type that extracts the output type of a `CVTemplatePartPlaceholder`
 *
 * @category Utility types
 */
export type ExtractType<P extends Any> = P extends Type<string, infer T> ? T : never;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make: <const N extends string, T>(
  params: Omit<MTypes.Data<Type<N, T>>, 'label'>,
) => Type<N, T> = flow(
  MStruct.enrichWith({ label: ({ name }) => MString.prepend('#')(name) }),
  _make,
);

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: <const N extends string, T>(self: Type<N, T>) => N = Struct.get('name');

/**
 * Returns the `label` property of `self`
 *
 * @category Destructors
 */
export const label: <const N extends string, T>(self: Type<N, T>) => string = Struct.get('label');

/**
 * Returns the `description` property of `self`
 *
 * @category Destructors
 */
export const description: <const N extends string, T>(self: Type<N, T>) => string =
  Struct.get('description');

/**
 * Returns the `parser` property of `self`
 *
 * @category Destructors
 */
export const parser: <const N extends string, T>(self: Type<N, T>) => Parser.Type<T> =
  Struct.get('parser');

/**
 * Returns the `formatter` property of `self`
 *
 * @category Destructors
 */
export const formatter: <const N extends string, T>(self: Type<N, T>) => Formatter.Type<T> =
  Struct.get('formatter');

/**
 * Returns the `tSchemaInstance` property of `self`
 *
 * @category Destructors
 */
export const tSchemaInstance: <const N extends string, T>(self: Type<N, T>) => Schema.Schema<T, T> =
  Struct.get('tSchemaInstance');

/**
 * Returns a description of `self`, e.g. "#dd: 2-character string left-padded with '0' to unsigned
 * integer."
 *
 * @category Destructors
 */
export const getLabelledDescription = <N extends string, T>(self: Type<N, T>) =>
  `${self.label}: ${self.description}`;

/**
 * Returns a copy of `self` where a postParser function is executed after the parser of `self` and a
 * preFormatter function is executed before the formatter of `self`
 *
 * @category Destructors
 */
export const modify: {
  <T>({
    descriptorMapper,
    postParser,
    preFormatter,
  }: {
    readonly descriptorMapper: MTypes.OneArgFunction<string>;
    readonly postParser: MTypes.OneArgFunction<T, Either.Either<T, MInputError.Type>>;
    readonly preFormatter: MTypes.OneArgFunction<T, Either.Either<T, MInputError.Type>>;
  }): <const N extends string>(self: Type<N, T>) => Type<N, T>;
  <T, T1>({
    descriptorMapper,
    postParser,
    preFormatter,
    t1SchemaInstance,
  }: {
    readonly descriptorMapper: MTypes.OneArgFunction<string>;
    readonly postParser: MTypes.OneArgFunction<T, Either.Either<T1, MInputError.Type>>;
    readonly preFormatter: MTypes.OneArgFunction<T1, Either.Either<T, MInputError.Type>>;
    readonly t1SchemaInstance: Schema.Schema<T1, T1>;
  }): <const N extends string>(self: Type<N, T>) => Type<N, T1>;
} =
  <T, T1>({
    descriptorMapper,
    postParser,
    preFormatter,
    t1SchemaInstance,
  }: {
    readonly descriptorMapper: MTypes.OneArgFunction<string>;
    readonly postParser: MTypes.OneArgFunction<T, Either.Either<T1, MInputError.Type>>;
    readonly preFormatter: MTypes.OneArgFunction<T1, Either.Either<T, MInputError.Type>>;
    readonly t1SchemaInstance?: Schema.Schema<T1, T1>;
  }) =>
  <const N extends string>(self: Type<N, T>): Type<N, T1> =>
    make({
      name: self.name,
      description: descriptorMapper(self.description),
      parser: function (this: Type<N, T1>, text) {
        return Either.flatMap(
          self.parser.call(this, text),
          flow(
            Tuple.mapBoth({
              onFirst: (t) => postParser.call(this, t),
              onSecond: Either.right,
            }),
            Either.all,
          ),
        );
      },
      formatter: function (this: Type<N, T1>, t1) {
        return pipe(
          preFormatter.call(this, t1),
          Either.flatMap((t) => self.formatter.call(this, t)),
        );
      },
      tSchemaInstance:
        t1SchemaInstance === undefined ?
          (self.tSchemaInstance as unknown as Schema.Schema<T1, T1>)
        : t1SchemaInstance,
    });

/**
 * Builds a `CVTemplatePartPlaceholder` instance that parses/formats exactly `length` characters
 * from a string. `length` must be a strictly positive integer.
 *
 * @category Constructors
 */
export const fixedLength = <const N extends string>({
  name,
  length,
}: {
  readonly name: N;
  readonly length: number;
}): Type<N, string> => {
  return make({
    name,
    description: `${MString.fromNumber(10)(length)}-character string`,
    parser: function (this: Type<N, string>, text) {
      return pipe(
        text,
        MString.splitAt(length),
        Tuple.mapBoth({
          onFirst: MInputError.assertLength({ expected: length, name: this.label }),
          onSecond: Either.right,
        }),
        Either.all,
      );
    },
    formatter: function (this: Type<N, string>, value) {
      return MInputError.assertLength({ expected: length, name: this.label })(value);
    },
    tSchemaInstance: Schema.String,
  });
};

/**
 * Same as `fixedLength` but the consumed text is trimmed off of a `fillChar` at `fillPosition` and
 * the written text is padded with a `fillChar` at `fillPosition`. `fillChar` should be a
 * one-character string. `length` must be a strictly positive integer. See the meaning of
 * `disallowEmptyString` in `MString.trim`
 *
 * @category Constructors
 */
export const paddedFixedLength = <const N extends string>(params: {
  readonly name: N;
  readonly length: number;
  readonly fillChar: string;
  readonly fillPosition: MString.FillPosition;
  readonly disallowEmptyString: boolean;
}): Type<N, string> => {
  const trimmer = flow(MString.trim(params), Either.right);
  const padder = flow(MString.pad(params), Either.right);

  return pipe(
    fixedLength(params),
    modify({
      descriptorMapper: MString.append(
        ` ${MString.FillPosition.toString(params.fillPosition)}-padded with '${params.fillChar}'`,
      ),
      postParser: trimmer,
      preFormatter: padder,
    }),
  );
};

/**
 * Same as `fixedLength` but the parser tries to convert the consumed text into a `CVReal` using the
 * passed `CVNumberBase10Format`. The formatter takes a `CVReal` and tries to convert and write it
 * as an n-character string. If the number to parse/format is less than `length` characters,
 * `fillChar` is trimmed/padded between the sign and the number so that the length condition is
 * respected. `fillChar` must be a one-character string (but no error is triggered if you do not
 * respect that condition)
 *
 * @category Constructors
 */

export const fixedLengthToReal = <const N extends string>(params: {
  readonly name: N;
  readonly length: number;
  readonly fillChar: string;
  readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
  const { numberBase10Format, fillChar } = params;
  const numberParser = function (this: Type<N, CVReal.Type>, input: string) {
    return pipe(
      input,
      CVNumberBase10Format.toRealParser(numberBase10Format, fillChar),
      Either.fromOption(
        () =>
          new MInputError.Type({
            message: `${this.label}: value '${input}' cannot be converted to a(n) ${CVNumberBase10Format.toDescription(numberBase10Format)}`,
          }),
      ),
    );
  };

  const numberFormatter = flow(
    CVNumberBase10Format.toNumberFormatter(
      numberBase10Format,
      pipe(fillChar, String.repeat(params.length)),
    ),
    Either.right,
  );

  return pipe(
    fixedLength(params),
    modify({
      descriptorMapper: MString.append(
        ` left-padded with '${fillChar}' to ${CVNumberBase10Format.toDescription(numberBase10Format)}`,
      ),
      postParser: numberParser,
      preFormatter: numberFormatter,
      t1SchemaInstance: CVReal.SchemaFromSelf,
    }),
  );
};

/**
 * Builds a `CVTemplatePartPlaceholder` whose parser reads from the text all the characters that it
 * can interpret as a number in the provided `numberBase10Format` and converts the consumed text
 * into a `CVReal`. The formatter takes a `CVReal` and converts it into a string according to the
 * provided `numberBase10Format`.
 *
 * @category Constructors
 */
export const real = <const N extends string>({
  name,
  numberBase10Format,
}: {
  readonly name: N;
  readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
  const numberParser = CVNumberBase10Format.toRealExtractor(numberBase10Format);
  const numberFormatter = CVNumberBase10Format.toNumberFormatter(numberBase10Format);
  const flippedTakeRightBut = Function.flip(MString.takeRightBut);

  return make({
    name,
    description: CVNumberBase10Format.toDescription(numberBase10Format),
    parser: function (this: Type<N, CVReal.Type>, text) {
      return pipe(
        text,
        numberParser,
        Either.fromOption(
          () =>
            new MInputError.Type({
              message: `${this.label} contains '${text}' from the start of which a(n) ${CVNumberBase10Format.toDescription(numberBase10Format)} could not be extracted`,
            }),
        ),
        Either.map(Tuple.mapSecond(flow(String.length, flippedTakeRightBut(text)))),
      );
    },
    formatter: flow(numberFormatter, Either.right),
    tSchemaInstance: CVReal.SchemaFromSelf,
  });
};

/**
 * Builds a `CVTemplatePartPlaceholder` instance that works as a map:
 *
 * The parser expects one of the keys of `keyValuePairs` and will return the associated value. The
 * formatter expects one of the values of `keyValuePairs` and will return the associated key.
 *
 * `keyValuePairs` should define a bijection (each key and each value must be present only once). It
 * is best if the type of the values defines a toString method. Value equality is checked with The
 * Effect Equal.equals function.
 *
 * `schemaInstance` is a `Schema` instance that transforms a value of type T into a value of type T.
 * It is an optional parameter. You need only provide it if you intend to use a `CVTemplate` built
 * from this `CVTemplatePartPlaceholder` within the `Effect.Schema` module. In that case, you can
 * build such a `Schema` with the `Schema.declare` function (if you don't provide it, the `Schema`
 * will return an error)
 *
 * @category Constructors
 */
export const mappedLiterals = <const N extends string, T>({
  name,
  keyValuePairs,
  schemaInstance = Schema.declare((_input: unknown): _input is T => false),
}: {
  readonly name: N;
  readonly keyValuePairs: ReadonlyArray<readonly [string, T]>;
  readonly schemaInstance?: Schema.Schema<T, T>;
}): Type<N, T> => {
  const keys = pipe(
    keyValuePairs,
    Array.map(Tuple.getFirst),
    Array.join(', '),
    MString.prepend('['),
    MString.append(']'),
  );
  const values = pipe(
    keyValuePairs,
    Array.map(flow(Tuple.getSecond, MString.fromUnknown)),
    Array.join(', '),
    MString.prepend('['),
    MString.append(']'),
  );
  const valueNameMap = pipe(keyValuePairs, Array.map(Tuple.swap), HashMap.fromIterable);

  const isTheStartOf = Function.flip(String.startsWith);
  const flippedTakeRightBut = Function.flip(MString.takeRightBut);

  return make({
    name,
    description: `from ${keys} to ${values}`,
    parser: function (this: Type<N, T>, text) {
      return pipe(
        keyValuePairs,
        Array.findFirst(flow(Tuple.getFirst, isTheStartOf(text))),
        Either.fromOption(
          () =>
            new MInputError.Type({
              message: `Expected remaining text for ${this.label} to start with one of ${keys}. Actual: '${text}'`,
            }),
        ),
        Either.map(
          MTuple.makeBothBy({
            toFirst: Tuple.getSecond,
            toSecond: flow(Tuple.getFirst, String.length, flippedTakeRightBut(text)),
          }),
        ),
      );
    },
    formatter: function (this: Type<N, T>, value) {
      return pipe(
        valueNameMap,
        HashMap.get(value),
        Either.fromOption(
          () =>
            new MInputError.Type({
              message: `${this.label}: expected one of ${values}. Actual: ${MString.fromUnknown(value)}`,
            }),
        ),
      );
    },
    tSchemaInstance: schemaInstance,
  });
};

/**
 * Same as `mappedLiterals` but `T` is assumed to be `CVReal` which should be the most usual use
 * case
 *
 * @category Constructors
 */
export const realMappedLiterals = <const N extends string>(params: {
  readonly name: N;
  readonly keyValuePairs: ReadonlyArray<readonly [string, CVReal.Type]>;
}): Type<N, CVReal.Type> => mappedLiterals({ ...params, schemaInstance: CVReal.SchemaFromSelf });

/**
 * Builds a `CVTemplatePartPlaceholder` whose parser reads as much of the text as it can that
 * fulfills the passed regular expression. The formatter only accepts a string that matches the
 * passed regular expression and writes it into the text. `regExp` must start with the ^ character.
 * Otherwise, the parser and formatter will not work properly.
 *
 * @category Constructors
 */
export const fulfilling = <const N extends string>({
  name,
  regExp,
  regExpDescriptor,
}: {
  readonly name: N;
  readonly regExp: RegExp;
  readonly regExpDescriptor: string;
}): Type<N, string> => {
  const flippedTakeRightBut = Function.flip(MString.takeRightBut);

  const match = (label: string) =>
    MInputError.match({
      regExp,
      regExpDescriptor,
      name: label,
    });

  return make({
    name,
    description: regExpDescriptor,
    parser: function (this: Type<N, string>, text) {
      return pipe(
        text,
        match(this.label),
        Either.map(
          MTuple.makeBothBy({
            toFirst: Function.identity,
            toSecond: flow(String.length, flippedTakeRightBut(text)),
          }),
        ),
      );
    },
    formatter: function (this: Type<N, string>, text) {
      return pipe(
        text,
        match(this.label),
        Either.filterOrLeft(
          MString.hasLength(text.length),
          () =>
            new MInputError.Type({
              message: `${this.label}: expected ${regExpDescriptor}. Actual: '${text}'`,
            }),
        ),
      );
    },
    tSchemaInstance: Schema.String,
  });
};

/**
 * This `CVTemplatePartPlaceholder` instance is a special case of the `fulfilling`
 * `CVTemplatePartPlaceholder` instance. The parser of this Placeholder reads from the text until it
 * meets one of the `forbiddenChars` passed as parameter (the result must be a non-empty string).
 * The formatter only accepts a non-empty string that does not contain any of the forbidden chars
 * and write it to the text. `forbiddenChars` should be an array of 1-character strings (will not
 * throw otherwise but strange behaviors can be expected)
 *
 * @category Constructors
 */
export const anythingBut = <const N extends string>({
  name,
  forbiddenChars,
}: {
  readonly name: N;
  readonly forbiddenChars: MTypes.OverOne<string>;
}): Type<N, string> => {
  // Do not use JSON.stringify because it doubles backslashes
  const forbiddenCharsAsString = `['${forbiddenChars.join("', '")}']`;
  return fulfilling({
    name,
    regExp: pipe(
      forbiddenChars,
      MRegExpString.notInRange,
      MRegExpString.oneOrMore,
      MRegExpString.atStart,
      MRegExp.fromRegExpString(),
    ),
    regExpDescriptor: `a non-empty string containing non of the following characters: ${forbiddenCharsAsString}`,
  });
};

/**
 * This `CVTemplatePartPlaceholder` instance is another special case of the `fulfilling`
 * `CVTemplatePartPlaceholder` instance. The parser of this `CVTemplatePartPlaceholder` reads all
 * the remaining text. The formatter accepts any string and writes it. This
 * `CVTemplatePartPlaceholder` should only be used as the last `CVTemplatePart` of a `CVTemplate`.
 *
 * @category Constructors
 */
export const toEnd = <const N extends string>(name: N): Type<N, string> =>
  fulfilling({
    name,
    regExp: /^.*/,
    regExpDescriptor: 'a string',
  });
