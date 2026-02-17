import * as ASStyle from '@parischap/ansi-styles/ASStyle'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPByPasser from '@parischap/pretty-print/PPByPasser'
import * as PPByPassers from '@parischap/pretty-print/PPByPassers'
import * as PPMarkShowerConstructor from '@parischap/pretty-print/PPMarkShowerConstructor'
import * as PPOption from '@parischap/pretty-print/PPOption'
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue'
import * as PPValue from '@parischap/pretty-print/PPValue'
import * as PPValueBasedStylerConstructor from '@parischap/pretty-print/PPValueBasedStylerConstructor'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import { describe, it } from 'vitest';

describe('ByPassers', () => {
  const utilInspectLike = PPOption.darkModeUtilInspectLike;
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
  const constructors = {
    valueBasedStylerConstructor,
    markShowerConstructor,
  };

  const byPassers: PPByPassers.Type = Array.make(
    PPByPasser.functionToName,
    PPByPasser.objectToString,
  );

  describe('initializedSyntheticByPasser', () => {
    const initializedSyntheticByPasser = PPByPassers.toSyntheticByPasser(byPassers).call(
      utilInspectLike,
      constructors,
    );

    it('Applied to named function', () => {
      function foo(): string {
        return 'foo';
      }
      TestUtils.assertSome(
        pipe(foo, PPValue.fromTopValue, initializedSyntheticByPasser),
        pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText),
      );
    });

    it('Applied to object with a .toString method', () => {
      TestUtils.assertSome(
        pipe(
          { a: 3, toString: (): string => 'foo\nbar' },
          PPValue.fromTopValue,
          initializedSyntheticByPasser,
        ),
        Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar')),
      );
    });

    it('Applied to primitive', () => {
      TestUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedSyntheticByPasser));
    });
  });
});
