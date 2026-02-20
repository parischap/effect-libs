import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a realMappedLiterals placeholder, once as a real placeholder.
const template = CVTemplate.make(
  // Separator
  sep.make('Today is '),
  // realMappedLiterals placeholder
  placeholder.realMappedLiterals({
    name: 'weekday',
    keyValuePairs: [
      ['Monday', 1],
      ['Tuesday', 2],
      ['Wednesday', 3],
      ['Thursday', 4],
      ['Friday', 5],
      ['Saturday', 6],
      ['Sunday', 7],
    ],
  }),
  // Separator
  sep.make(', day number '),
  // Field named 'weekday' that must represent an unsigned integer
  placeholder.number({ name: 'weekday', numberBase10Format: CVNumberBase10Format.unsignedInteger }),
  // Separator
  sep.make(' of the week.'),
);

// Let's define a parser. Note that there is only one `weekday` property
// Type: (value: string) => Either.Either<{
//    readonly weekday: number;
// }, MInputError.Type>>
const parser = CVTemplate.toParser(template);

// Let's define a formatter. Note that there is only one `weekday` property
// Type: (value: {
//   readonly weekday: number;
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
console.log(formatter({ weekday: 6 }));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: '#weekday: expected one of [1, 2, 3, 4, 5, 6, 7]. Actual: 10',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(formatter({ weekday: 10 }));
