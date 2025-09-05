/* eslint-disable functional/no-expression-statements */
import {
	CVNumberBase10Format,
	CVReal,
	CVSchema,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator
} from '@parischap/conversions';
import { MRegExpString } from '@parischap/effect-lib';
import { pipe, Schema } from 'effect';

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
	ph.real({
		name: 'age',
		numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay)
	}),
	// Immutable text
	sep.make('-year old '),
	// field named 'kind' that must be a non-empty string containing no dot character
	ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
	// Immutable text
	sep.dot
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
		kind: 'boy'
	})
);

// Result: 'Tom is a 15-year old boy.'
console.log(
	throwingFormatter({
		name: 'Tom',
		age: CVReal.unsafeFromNumber(15),
		kind: 'boy'
	})
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
		kind: 'boy'
	})
);
