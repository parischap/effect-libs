import * as Schema from 'effect/Schema';

import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MSchema from '@parischap/effect-lib/MSchema';
import * as MString from '@parischap/effect-lib/MString';
import * as MTemplate from '@parischap/effect-lib/MTemplate';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

// Let's define useful shortcuts
const ph = MTemplatePlaceholder;
const sep = MTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = MTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.number({
    name: 'age',
    numberBase10Format: MNumberBase10Format.unsignedInteger,
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Let's define a parse function. See how the return type matches the names and types of the
// placeholders
// Type: (value: string) => Result.Result<{
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }, MInputError.Type>
const parse = MString.templateParse(template);

// Let's define a parse function that throws for non-`effect` users.
// Type: (value: string) => {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }
const parseOrThrow = MString.templateParseOrThrow(template);

// Let's define a format function.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => Result.Result<string, MInputError.Type>
const format = MString.templateFormat(template);

// Let's define a formatter that throws for `effect` users.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => string, MInputError.Type
const formatOrThrow = MString.templateFormatOrThrow(template);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected remaining text for separator at position 2 to start with ' is a '. Actual: ''",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parse('John'));

// Result: { _id: 'Result', _tag: 'Success', success: { name: 'John', age: 47, kind: 'man' } }
console.log(parse('John is a 47-year old man.'));

// Result: { name: 'John', age: 47, kind: 'man' }
console.log(parseOrThrow('John is a 47-year old man.'));

// Result: { _id: 'Result', _tag: 'Success', success: 'Tom is a 15-year old boy.' }
console.log(
  format({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);

// Result: 'Tom is a 15-year old boy.'
console.log(
  formatOrThrow({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);

// Using Schema
const schema = MSchema.Template(template);

// Type:(i: string) => Exit.Exit<{
//     readonly name: string;
//     readonly age: number;
//     readonly kind: string;
// }, Schema.SchemaError>
const decoder = Schema.decodeExit(schema);

// Type: (a: {
//     readonly name: string;
//     readonly age: number;
//     readonly kind: string;
// }) => Exit.Exit<string, Schema.SchemaError>
const encoder = Schema.encodeExit(schema);

// Result: { _id: 'Exit', _tag: 'Success', value: { name: 'John', age: 47, kind: 'man' } }
console.log(decoder('John is a 47-year old man.'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'Tom is a 15-year old boy.' }
console.log(
  encoder({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);
