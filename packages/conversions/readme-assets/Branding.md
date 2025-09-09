<div align="center">

# Branding

This package implements a few brands which come in handy in many projects such as email, semantic versioning, integer numbers, positive integer numbers, real numbers and positive real numbers. All these brands are also defined as `Schemas`. Please read the [`Effect` documentation about Branding](https://effect.website/docs/code-style/branded-types/) if you are not familiar with this concept

</div>

## 1. Introduction

In this package you will find the following [`Brand`'s](https://effect.website/docs/code-style/branded-types/):

- `CVEmail`: represents a valid email string
- `CVSemVer`: represents a valid semantic versioning string
- `CVReal`: represents a valid floating-point number (+Infinity, Infinity, -Infinity, NaN not allowed). Can be used to represent a temperature, a height from sea-level,...
- `CVPositiveReal`: same as `CVReal` but the number must be positive. Can be used to represent a price, a speed,...
- `CVInteger`: same as `CVReal` but the number must be an integer. Can be used to represent a floor in a lift, a signed quantity...
- `CVPositiveInteger`: same as `CVInteger` but the number must be positive. Can be used to represent an age, a quantity,...

You will also find all the functions to convert from one brand to another. Do not hesitate to take a look at the [API](https://parischap.github.io/effect-libs/docs/conversions) to learn more about what this module offers in terms of branding.

## 2. Usage example

```ts
import { CVEmail } from "@parischap/conversions";

/** Let's try to create a CVEmail from a string that represents a valid email */
// Result: { _id: 'Either', _tag: 'Right', right: 'foo@bar.baz' }
console.log(CVEmail.fromString("foo@bar.baz"));

/** Let's try to create a CVEmail from a string that does not represents a valid email */
// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: [ { message: "'foo' does not represent a email", meta: undefined } ]
// }
console.log(CVEmail.fromString("foo"));

/**
 * Thanks to Typescript type-checking, whenever we use a variable of type CVEmail, we know for sure
 * it represents a valid email. Unless we force a string that does not represent an email into a
 * CVEmail. But the name of the function makes it clear that we are in danger zone and should know
 * what we are doing.
 */

// Result: 'foo'
console.log(CVEmail.unsafeFromString("foo"));
```
