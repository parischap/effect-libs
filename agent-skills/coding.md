<!-- LTeX: language=en-US -->

## Specific naming conventions applied in internal packages only

Functions in our programs should not throw. However, there are functions that only error when passed a bad input value. There are two ways of dealing with such functions:

1. Return an error when bad input values are passed.
2. Indicate in the function `JSDocs` that certain values must be avoided and throw in case bad input value is passed all the same.

Issue with 1. is that it can lead to managing errors that will never happen. For instance, the `Number.divide` function only works when divisor is non-zero. It returns an Option to reflect the possibility of failure. If program always uses this function carefully with non-zero divisors, useless `Option`'s have to be managed over and over again. This is burdensome (e.g. in tests).

Two versions of such functions must be created (for cases 1. and 2.). The second one has same name as first one with `OrThrow` suffix.

A third, distinct category is prefixed `unsafe*` instead: it performs no input validation and never throws, but returns a meaningless result (e.g. `NaN`, `±Infinity`, `undefined`) when passed a bad input value. Its safe counterpart, when one exists, keeps the plain base name and returns an `Option`.
