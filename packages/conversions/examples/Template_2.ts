import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateFormatter from '@parischap/conversions/CVTemplateFormatter';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a numberMappedLiterals placeholder, once as a number placeholder.
const template = CVTemplate.make(
  // Separator
  sep.make('Today is '),
  // numberMappedLiterals placeholder
  placeholder.numberMappedLiterals({
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

// Let's define a parser
const parser = CVTemplateParser.fromTemplate(template);

// Let's define a parse function. Note that there is only one `weekday` property
// Type: (value: string) => Result.Result<{
//    readonly weekday: number;
// }, MInputError.Type>>
const parse = CVTemplateParser.parse(parser);

// Let's define a formatter
const formatter = CVTemplateFormatter.fromTemplate(template);

// Let's define a format function. Note that there is only one `weekday` property
// Type: (value: {
//   readonly weekday: number;
//   }) => Result.Result<string, MInputError.Type>
const format = CVTemplateFormatter.format(formatter);

// Result: { _id: 'Result', _tag: 'Success', success: { weekday: 2 } }
console.log(parse('Today is Tuesday, day number 2 of the week.'));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "#weekday is present more than once in template and receives differing values '4' and '2'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parse('Today is Thursday, day number 2 of the week.'));

// Result: { _id: 'Result', _tag: 'Success', success: 'Today is Saturday, day number 6 of the week.' }
console.log(format({ weekday: 6 }));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: '#weekday: expected one of [1, 2, 3, 4, 5, 6, 7]. Actual: 10',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(format({ weekday: 10 }));
