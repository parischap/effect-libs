/* eslint-disable functional/no-expression-statements */
import { CVEmail } from '@parischap/conversions';

/** Let's try to create a CVEmail from a string that represents a valid email */
// Result: { _id: 'Either', _tag: 'Right', right: 'foo@bar.baz' }
console.log(CVEmail.fromString('foo@bar.baz'));

/** Let's try to create a CVEmail from a string that does not represents a valid email */
// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: [ { message: "'foo' does not represent a email", meta: undefined } ]
// }
console.log(CVEmail.fromString('foo'));

/**
 * Thanks to Typescript type-checking, whenever we use a variable of type CVEmail, we know for sure
 * it represents a valid email. Unless we force a string that does not represent an email into a
 * CVEmail. But the name of the function makes it clear that we are in danger zone and should know
 * what we are doing.
 */

// Result: 'foo'
console.log(CVEmail.unsafeFromString('foo'));
