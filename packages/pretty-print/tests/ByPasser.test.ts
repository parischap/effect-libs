import { ASStyle } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import {
  PPByPasser,
  PPMarkShowerConstructor,
  PPOption,
  PPStringifiedValue,
  PPValue,
  PPValueBasedStylerConstructor,
} from '@parischap/pretty-print';
import { Array, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('PPByPasser', () => {
  const utilInspectLike = PPOption.darkModeUtilInspectLike;
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
  const constructors = {
    valueBasedStylerConstructor,
    markShowerConstructor,
  };

  const { empty } = PPByPasser;

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), PPByPasser.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(
          empty,
          PPByPasser.make({
            id: 'Empty',
            action: () => () => Option.none(),
          }),
        );
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(empty, PPByPasser.functionToName);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(empty.toString(), `Empty`);
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(empty.pipe(PPByPasser.id), 'Empty');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPByPasser.has(empty));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPByPasser.has(new Date()));
      });
    });
  });

  describe('functionToName', () => {
    const initializedFunctionToName = PPByPasser.functionToName.call(utilInspectLike, constructors);
    it('Applied to named function', () => {
      function foo(): string {
        return 'foo';
      }
      TestUtils.assertSome(
        pipe(foo, PPValue.fromTopValue, initializedFunctionToName),
        pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText),
      );
    });

    it('Applied to unnamed function', () => {
      TestUtils.assertSome(
        pipe((n: number) => n + 1, PPValue.fromTopValue, initializedFunctionToName),
        pipe('[Function: anonymous]', ASStyle.green, PPStringifiedValue.fromText),
      );
    });

    it('Applied to non-function value', () => {
      TestUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedFunctionToName));
    });
  });

  describe('objectToString', () => {
    const initializedObjectToString = PPByPasser.objectToString.call(utilInspectLike, constructors);
    it('Applied to primitive', () => {
      TestUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedObjectToString));
    });

    it('Applied to object without a .toString method', () => {
      TestUtils.assertNone(pipe({ a: 3 }, PPValue.fromTopValue, initializedObjectToString));
    });

    it('Applied to object with a .toString method', () => {
      TestUtils.assertSome(
        pipe(
          { a: 3, toString: (): string => 'foo\nbar' },
          PPValue.fromTopValue,
          initializedObjectToString,
        ),
        Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar')),
      );
    });

    it('Applied to a date', () => {
      TestUtils.assertSome(pipe(new Date(0), PPValue.fromTopValue, initializedObjectToString));
    });

    it('Applied to an array', () => {
      TestUtils.assertNone(pipe([1, 2], PPValue.fromTopValue, initializedObjectToString));
    });
  });
});
