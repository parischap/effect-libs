import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MInputError from '@parischap/effect-lib/MInputError';

import { describe, it } from 'vitest';

describe('MInputError', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MInputError.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('assertValue', () => {
    it('Not passing number without name', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertValue({ expected: 5 })(10),
        'Expected value to be: 5. Actual: 10',
      );
    });

    it('Not passing without name', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertValue({ expected: 'foo' })('bar'),
        "Expected value to be: 'foo'. Actual: 'bar'",
      );
    });

    it('Not passing with name', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertValue({ expected: 5, name: "'age'" })(10),
        "Expected 'age' to be: 5. Actual: 10",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(MInputError.assertValue({ expected: 5 })(5), 5);
    });
  });

  describe('assertLength', () => {
    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertLength({ expected: 5, name: "'name'" })('foo'),
        "Expected length of 'name' to be: 5. Actual: 3",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(MInputError.assertLength({ expected: 3 })('foo'), 'foo');
    });
  });

  describe('assertMaxLength', () => {
    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertMaxLength({ expected: 2, name: "'name'" })('foo'),
        "Expected length of 'name' to be at most(included): 2. Actual: 3",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(MInputError.assertMaxLength({ expected: 3 })('foo'), 'foo');
    });
  });

  describe('assertInRange', () => {
    it('Offset shifts boundaries', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: false,
          maxIncluded: false,
          offset: 1,
          name: "'age'",
        })(3),
        "Expected 'age' to be between 4 (excluded) and 6 (excluded). Actual: 4",
      );
    });

    it('Value below minIncluded lower bound', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: true,
          maxIncluded: false,
          offset: 0,
          name: "'age'",
        })(2),
        "Expected 'age' to be between 3 (included) and 5 (excluded). Actual: 2",
      );
    });

    it('Value at maxExcluded upper bound', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: false,
          maxIncluded: false,
          offset: 0,
          name: "'age'",
        })(5),
        "Expected 'age' to be between 3 (excluded) and 5 (excluded). Actual: 5",
      );
    });

    it('Value above maxIncluded upper bound', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: false,
          maxIncluded: true,
          offset: 0,
          name: "'age'",
        })(6),
        "Expected 'age' to be between 3 (excluded) and 5 (included). Actual: 6",
      );
    });

    it('Value within exclusive range', () => {
      TestUtils.assertSuccess(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: false,
          maxIncluded: false,
          offset: 0,
          name: "'age'",
        })(4),
        4,
      );
    });

    it('Value at inclusive lower bound', () => {
      TestUtils.assertSuccess(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: true,
          maxIncluded: false,
          offset: 0,
          name: "'age'",
        })(3),
        3,
      );
    });

    it('Value at inclusive upper bound', () => {
      TestUtils.assertSuccess(
        MInputError.assertInRange({
          min: 3,
          max: 5,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'age'",
        })(5),
        5,
      );
    });
  });

  describe('assertStartsWith', () => {
    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertStartsWith({ startString: 'foo', name: "'text'" })('baz'),
        "Expected 'text' to start with 'foo'. Actual: 'baz'",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(
        MInputError.assertStartsWith({ startString: 'foo' })('foo and baz'),
        'foo and baz',
      );
    });
  });

  describe('assertMatches', () => {
    const assertContainsOneDigit = MInputError.assertMatches({
      regExp: /\d/,
      regExpDescriptor: 'a string with a digit',
      name: "'text'",
    });

    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        assertContainsOneDigit('foo'),
        "Expected 'text' to be a string with a digit. Actual: 'foo'",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(assertContainsOneDigit('fo4o'), 'fo4o');
    });
  });

  describe('match', () => {
    const matchOneDigit = MInputError.match({
      regExp: /\d/,
      regExpDescriptor: 'a string with a digit',
      name: "'text'",
    });

    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        matchOneDigit('foo'),
        "Expected 'text' to be a string with a digit. Actual: 'foo'",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(matchOneDigit('fo4o'), '4');
    });
  });

  describe('assertEmpty', () => {
    it('Not passing', () => {
      TestUtils.assertFailureMessage(
        MInputError.assertEmpty({ name: "'text'" })('baz'),
        "Expected 'text' to be empty. Actual: 'baz'",
      );
    });

    it('Passing', () => {
      TestUtils.assertSuccess(MInputError.assertEmpty()(''), '');
    });
  });
});
