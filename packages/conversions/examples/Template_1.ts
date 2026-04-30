import * as Schema from 'effect/Schema';

import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVSchema from '@parischap/conversions/CVSchema';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateFormatter from '@parischap/conversions/CVTemplateFormatter';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';

// Let's define useful shortcuts
const ph = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.number({
    name: 'age',
    numberBase10Format: CVNumberBase10Format.unsignedInteger,
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Let's define a parser
const parser = CVTemplateParser.fromTemplate(template);

// And now a parse function. See how the return type matches the names and types of the placeholders
// Type: (value: string) => Result.Result<{
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }, MInputError.Type>
const parse = CVTemplateParser.parse(parser);

// Let's define a parse function that throws for non Effect users.
// Type: (value: string) => {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }
const parseOrThrow = CVTemplateParser.parseOrThrow(parser);

// Let's define a formatter
const formatter = CVTemplateFormatter.fromTemplate(template);

// Let's define a format function.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => Result.Result<string, MInputError.Type>
const format = CVTemplateFormatter.format(formatter);

// Let's define a formatter that throws for Effect users.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => string, MInputError.Type
const formatOrThrow = CVTemplateFormatter.formatOrThrow(formatter);

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
const schema = CVSchema.Template(template);

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
