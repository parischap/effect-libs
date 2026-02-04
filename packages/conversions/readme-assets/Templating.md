<div align="center">

# CVTemplate

An equivalent to the PHP sprintf and sscanf functions with real typing of the placeholders. Although `Effect.Schema` does offer the [`TemplateLiteralParser` API](https://effect.website/docs/schema/basic-usage/#templateliteralparser), the latter does not provide a solution to situations such as fixed length fields (potentially padded), numbers formatted otherwise than in the English format... This module can also be used as a `Schema`.

</div>

## 1. Usage example

```ts
import {
  CVNumberBase10Format,
  CVReal,
  CVSchema,
  CVTemplate,
  CVTemplatePartPlaceholder,
  CVTemplatePartSeparator,
} from '@parischap/conversions';
import { MRegExpString } from '@parischap/effect-lib';
import { pipe, Schema } from 'effect';

// Let's define useful shortcuts
const ph = CVTemplatePartPlaceholder;
const sep = CVTemplatePartSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.real({
    name: 'age',
    numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay),
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Let's define a parser. See how the return type matches the names and types of the placeholders
// Type: (value: string) => Either.Either<{
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
// }, MInputError.Type>
const parser = CVTemplate.toParser(template);

// Let's define a parser that throws for Effect users.
// Type: (value: string) => {
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
// }
const throwingParser = CVTemplate.toThrowingParser(template);

// Let's define a formatter.
// Type: (value: {
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
//   }) => Either.Either<string, MInputError.Type>
const formatter = CVTemplate.toFormatter(template);

// Let's define a formatter that throws for Effect users.
// Type: (value: {
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
//   }) => string, MInputError.Type
const throwingFormatter = CVTemplate.toThrowingFormatter(template);

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected remaining text for separator at position 2 to start with ' is a '. Actual: ''",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('John'));

// Result: { _id: 'Either', _tag: 'Right', right: { name: 'John', age: 47, kind: 'man' } }
console.log(parser('John is a 47-year old man.'));

// Result: { name: 'John', age: 47, kind: 'man' }
console.log(throwingParser('John is a 47-year old man.'));

// Result: { _id: 'Either', _tag: 'Right', right: 'Tom is a 15-year old boy.' }
console.log(
  formatter({
    name: 'Tom',
    age: CVReal.unsafeFromNumber(15),
    kind: 'boy',
  }),
);

// Result: 'Tom is a 15-year old boy.'
console.log(
  throwingFormatter({
    name: 'Tom',
    age: CVReal.unsafeFromNumber(15),
    kind: 'boy',
  }),
);

// Using Schema
const schema = CVSchema.Template(template);

// Type:(i: string) => Either<{
//     readonly name: string;
//     readonly age: CVReal.Type;
//     readonly kind: string;
// }, ParseError>
const decoder = Schema.decodeEither(schema);

// Type: (a: {
//     readonly name: string;
//     readonly age: CVReal.Type;
//     readonly kind: string;
// }) => Either<string, ParseError>
const encoder = Schema.encodeEither(schema);

// Result: { _id: 'Either', _tag: 'Right', right: { name: 'John', age: 47, kind: 'man' } }
console.log(decoder('John is a 47-year old man.'));

// Result: { _id: 'Either', _tag: 'Right', right: 'Tom is a 15-year old boy.' }
console.log(
  encoder({
    name: 'Tom',
    age: CVReal.unsafeFromNumber(15),
    kind: 'boy',
  }),
);
```

## 2. Definitions

A template is a model of a text that has always the same structure. In such a text, there are immutable and mutable parts. Let's take the following two texts as an example:

- text1 = "John is a 47-year old man."
- text2 = "Jehnny is a 5-year old girl."

These two texts obviously share the same structure which is the template:

Placeholder1 is a Placeholder2-year old Placeholder3.

Placeholder1, Placeholder2 and Placeholder3 are the mutable parts of the template. We call them `CVTemplatePartPlaceholder`'s.

" is a ", "-year old " and "." are the immutable parts of the template. We call them `CVTemplateSeperator`'s.

From a text with the above structure, we can extract the values of Placeholder1, Placeholder2, and Placeholder3. In the present case:

- For text1: { Placeholder1 : 'John', Placeholder2 : '47', Placeholder3 : 'man' }
- For text2: { Placeholder1 : 'Jehnny', Placeholder2 : '5', Placeholder3 : 'girl'}

Extracting the values of placeholders from a text according to a template is called parsing. The result of parsing is an object whose properties are named after the name of the placeholders they represent.

Inversely, given a template and the values of the placeholders that compose it (provided as the properties of an object), we can generate a text. This is called formatting. In the present case, with the object:

{ Placeholder1 : 'Tom', Placeholder2 : '15', Placeholder3 : 'boy' }

we will obtain the text: "Tom is a 15-year old boy."

## 3. CVTemplatePartSeparator's

A `CVTemplatePartSeparator` represents the immutable part of a template. Upon parsing, we must check that it is present as is in the text. Upon formatting, it must be inserted as is into the text.

To create a `CVTemplatePartSeparator`, you usually call the `CVTemplatePartSeparator.make` constructor. However, the TemplatePartSeparator.ts module exports a series of predefined `CVTemplatePartSeparator` instances, such as `CVTemplatePartSeparator.slash` and `CVTemplatePartSeparator.space`. You can find the list of all predefined `CVTemplatePartSeparator` instances in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

## 4. CVTemplatePartPlaceholder's

A `CVTemplatePartPlaceholder` represents the mutable part of a template. Each `CVTemplatePartPlaceholder` defines a parser and a formatter:

- the parser takes a text, consumes a part of that text, optionnally converts the consumed part to a value of type T and, if successful, returns a `Right` of that value and of what has not been consumed. In case of failure, it returns a `Left`.
- the formatter takes a value of type T, converts it to a string (if T is not string), checks that the result is coherent and, if so, inserts that string into the text. Otherwise, it returns a `Left`.

There are several predefined Placeholder's:

- `fixedLength`: this Placeholder always reads/writes the same number of characters from/into the text.
- `paddedFixedLength`: same as `fixedLength` but the consumed text is trimmed off of a `fillChar` on the left or right and the written text is padded with a `fillChar` on the left or right.
- `fixedLengthToReal`: same as `fixedLength` but the parser tries to convert the consumed text into a `CVReal` using the passed `CVNumberBase10Format`. The formatter takes a `CVReal` and tries to convert and write it as an n-character string. You can pass a `fillChar` that is trimmed off the consumed text upon parsing and padded to the written text upon formatting.
- `real`: the parser of this Placeholder reads from the text all the characters that it can interpret as a number in the provided `CVNumberBase10Format` and converts the consumed text into a `CVReal`. The formatter takes a `CVReal` and converts it into a string according to the provided `CVNumberBase10Format`.
- `mappedLiterals`: this Placeholder takes as input a map that must define a bijection between a list of strings and a list of values. The parser tries to read from the text one of the strings in the list. Upon success, it returns the corresponding value. The formatter takes a value and tries to find it in the list. Upon success, it writes the corresponding string into the text.
- `realMappedLiterals`: same as `mappedLiterals` but values are assumed to be of type `CVReal` which is the most usual use case.
- `fulfilling`: the parser of this Placeholder reads as much of the text as it can that fulfills the passed regular expression. The formatter only accepts a string that matches the passed regular expression and writes it into the text.
- `anythingBut`: this is a special case of the `fulfilling` `CVTemplatePartPlaceholder`. The parser reads from the text until it meets one of the `forbiddenChars` passed as parameter (the result must be a non-empty string). The formatter will only accept a non-empty string that does not contain any of the forbidden chars and write it to the text.
- `toEnd`: this is another special case of the `fulfilling` `CVTemplatePartPlaceholder`. The parser reads all the remaining text. The formatter accepts any string and writes it. This `CVTemplatePartPlaceholder` should only be used as the last `CVTemplatePart` of a `CVTemplate`.

Each `CVTemplatePartPlaceholder` must be given a name that will be used as the name of the property of the result object of parsing or of the input object of formatting. This name needs not be unique inside a CVTemplate. The same name can appear several times. However, even if there are several `CVTemplatePartPlaceholder`'s with the same name, there will be only one property with that name. When parsing, this implies that all `CVTemplatePartPlaceholder`'s with the same name must yield the same value. When formatting, this implies that the value needs only be provided once and will be shared by all `CVTemplatePartPlaceholder`'s with that name.

If none of these `CVTemplatePartPlaceholder` instances suits you, you can define you own with the `make` constructor. You will find detailed explanations of the predefined `CVTemplatePartPlaceholder` instances and of the make constructor in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

## 5. A more complex example

```ts
import {
  CVNumberBase10Format,
  CVReal,
  CVTemplate,
  CVTemplatePartPlaceholder,
  CVTemplatePartSeparator,
} from '@parischap/conversions';

// Let's define useful shortcuts
const placeholder = CVTemplatePartPlaceholder;
const sep = CVTemplatePartSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a realMappedLiterals placeholder, once as a real placeholder.
const template = CVTemplate.make(
  // Separator
  sep.make('Today is '),
  // realMappedLiterals placeHolder
  placeholder.realMappedLiterals({
    name: 'weekday',
    keyValuePairs: [
      ['Monday', CVReal.unsafeFromNumber(1)],
      ['Tuesday', CVReal.unsafeFromNumber(2)],
      ['Wednesday', CVReal.unsafeFromNumber(3)],
      ['Thursday', CVReal.unsafeFromNumber(4)],
      ['Friday', CVReal.unsafeFromNumber(5)],
      ['Saturday', CVReal.unsafeFromNumber(6)],
      ['Sunday', CVReal.unsafeFromNumber(7)],
    ],
  }),
  // Separator
  sep.make(', day number '),
  // Field named 'weekday' that must represent an integer
  placeholder.real({
    name: 'weekday',
    numberBase10Format: CVNumberBase10Format.integer,
  }),
  // Separator
  sep.make(' of the week.'),
);

// Let's define a parser. Note that there is only one `weekday` property
// Type: (value: string) => Either.Either<{
//    readonly weekday: CVReal.Type;
// }, MInputError.Type>>
const parser = CVTemplate.toParser(template);

// Let's define a formatter. Note that there is only one `weekday` property
// Type: (value: {
//   readonly weekday: CVReal.Type;
//   }) => Either.Either<string, MInputError.Type>
const formatter = CVTemplate.toFormatter(template);

// Result: { _id: 'Either', _tag: 'Right', right: { weekday: 2 } }
console.log(parser('Today is Tuesday, day number 2 of the week.'));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "#weekday is present more than once in template and receives differing values '4' and '2'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('Today is Thursday, day number 2 of the week.'));

// Result: { _id: 'Either', _tag: 'Right', right: 'Today is Saturday, day number 6 of the week.' }
console.log(formatter({ weekday: CVReal.unsafeFromNumber(6) }));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: '#weekday: expected one of [1, 2, 3, 4, 5, 6, 7]. Actual: 10',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(formatter({ weekday: CVReal.unsafeFromNumber(10) }));
```

## 6. Debugging

`CVTemplate` objects implement a `.toString()` method that displays a synthetic description of the template followed by the description of each contained `CVTemplatePartPlaceholder`.

For instance:

```ts
import {
  CVNumberBase10Format,
  CVTemplate,
  CVTemplatePartPlaceholder,
  CVTemplatePartSeparator,
} from '@parischap/conversions';
import { MRegExpString } from '@parischap/effect-lib';
import { pipe } from 'effect';

// Let's define useful shortcuts
const ph = CVTemplatePartPlaceholder;
const sep = CVTemplatePartSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.real({
    name: 'age',
    numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay),
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Result:
// #name is a #age-year old #kind.

// #name: a non-empty string containing non of the following characters: [ \s ].
// #age: unsigned integer.
// #kind: a non-empty string containing non of the following characters: [ . ]
console.log(template);
```
