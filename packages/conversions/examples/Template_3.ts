/* eslint-disable functional/no-expression-statements */
import {
	CVNumberBase10Format,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator
} from '@parischap/conversions';
import { MRegExpString } from '@parischap/effect-lib';
import { pipe } from 'effect';

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

// Result:
// #name is a #age-year old #kind.

// #name: a non-empty string containing non of the following characters: [ \s ].
// #age: unsigned integer.
// #kind: a non-empty string containing non of the following characters: [ . ]
console.log(template);
