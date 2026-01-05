import {
  CVNumberBase10Format,
  CVReal,
  CVTemplate,
  CVTemplatePlaceholder,
  CVTemplateSeparator,
} from "@parischap/conversions";

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a realMappedLiterals placeholder, once as a real placeholder.
const template = CVTemplate.make(
  // Separator
  sep.make("Today is "),
  // realMappedLiterals placeHolder
  placeholder.realMappedLiterals({
    name: "weekday",
    keyValuePairs: [
      ["Monday", CVReal.unsafeFromNumber(1)],
      ["Tuesday", CVReal.unsafeFromNumber(2)],
      ["Wednesday", CVReal.unsafeFromNumber(3)],
      ["Thursday", CVReal.unsafeFromNumber(4)],
      ["Friday", CVReal.unsafeFromNumber(5)],
      ["Saturday", CVReal.unsafeFromNumber(6)],
      ["Sunday", CVReal.unsafeFromNumber(7)],
    ],
  }),
  // Separator
  sep.make(", day number "),
  // Field named 'weekday' that must represent an integer
  placeholder.real({ name: "weekday", numberBase10Format: CVNumberBase10Format.integer }),
  // Separator
  sep.make(" of the week."),
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
console.log(parser("Today is Tuesday, day number 2 of the week."));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "#weekday is present more than once in template and receives differing values '4' and '2'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser("Today is Thursday, day number 2 of the week."));

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
