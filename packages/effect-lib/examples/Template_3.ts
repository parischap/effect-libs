import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
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

// Result:
// #name is a #age-year old #kind.

// #name: a non-empty string containing non of the following characters: [ \s ].
// #age: unsigned integer.
// #kind: a non-empty string containing non of the following characters: [ . ]
console.log(template);
