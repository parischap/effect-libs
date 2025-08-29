/* eslint-disable functional/no-expression-statements */
import {
	CVNumberBase10Format,
	CVReal,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator
} from '@parischap/conversions';

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's put in an object parameters that are common to all tags
const params = {
	// Padding character used on the left of fixed-length templateparts
	fillChar: '0',
	// NumberBase10 format used by all tags
	numberBase10Format: CVNumberBase10Format.integer
};

// Let's define a date template that will look like: 'dd/MM/yyyy MM'
// Note that the MM CVTemplatePart.Placeholder appears twice, once as a real and once as a fixedLengthToReal
const template = CVTemplate.make(
	// 2-character field named 'dd' that must represent an integer left-padded with '0'
	placeholder.fixedLengthToReal({ ...params, name: 'dd', length: 2 }),
	// Separator
	sep.slash,
	// 2-character field named 'MM' that must represent an integer left-padded with '0'
	placeholder.fixedLengthToReal({ ...params, name: 'MM', length: 2 }),
	// Separator
	sep.slash,
	// 2-character field named 'MM' that must represent an integer left-padded with '0'
	placeholder.fixedLengthToReal({ ...params, name: 'yyyy', length: 4 }),
	// Separator
	sep.space,
	// Field named 'MM' that must represent an integer
	placeholder.real({ ...params, name: 'MM' })
);

// Let's define a parser. Note that there is only one MM property
// Type: (value: string) => Either.Either<{
//    readonly dd: CVReal.Type;
//    readonly MM: CVReal.Type;
//    readonly yyyy: CVReal.Type;
// }, MInputError.Type>>
const parser = CVTemplate.toParser(template);

// Let's define a formatter
// Type: (value: {
//   readonly dd: CVReal.Type;
//   readonly MM: CVReal.Type;
//   readonly yyyy: CVReal.Type;
//   }) => Either.Either<string, MInputError.Type>
const formatter = CVTemplate.toFormatter(template);

// Result: { _id: 'Either', _tag: 'Right', right: { dd: 5, MM: 1, yyyy: 2025 } }
console.log(parser('05/01/2025 1'));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "'MM' templatepart is present more than once in template and receives differing values '12' and '1'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('05/12/2025 1'));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected remaining text for separator at position 2 to start with '/'. Actual: '|01|2025 1'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('05|01|2025 1'));

// Result: { _id: 'Either', _tag: 'Right', right: '05/12/2025 12' }
console.log(
	formatter({
		dd: CVReal.unsafeFromNumber(5),
		MM: CVReal.unsafeFromNumber(12),
		yyyy: CVReal.unsafeFromNumber(2025)
	})
);

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//    message: "Expected length of 'dd' templatepart to be: 2. Actual: 3",
//    _tag: '@parischap/effect-lib/InputError/'
//  }
// }
console.log(
	formatter({
		dd: CVReal.unsafeFromNumber(115),
		MM: CVReal.unsafeFromNumber(12),
		yyyy: CVReal.unsafeFromNumber(2025)
	})
);
