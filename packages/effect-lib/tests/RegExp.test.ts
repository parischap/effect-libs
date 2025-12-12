import * as TestUtils from '@parischap/configs/TestUtils';
import { MRegExp } from '@parischap/effect-lib';
import { pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('MRegExp', () => {
  const regExp = /af(o)o(bar)?a/;

  describe('match', () => {
    it('Matching', () => {
      TestUtils.assertSome(pipe(regExp, MRegExp.match('afooa')), 'afooa');
      TestUtils.assertSome(pipe(regExp, MRegExp.match('afoobara')), 'afoobara');
    });

    it('Non matching', () => {
      TestUtils.assertNone(pipe(regExp, MRegExp.match('afoob')));
    });
  });

  describe('matchAndGroups', () => {
    it('Matching', () => {
      TestUtils.assertSome(
        pipe(regExp, MRegExp.matchAndGroups('afooa', 2)),
        Tuple.make('afooa', Tuple.make('o', '')),
      );
    });

    it('Non matching', () => {
      TestUtils.assertNone(MRegExp.match('afoob')(regExp));
    });
  });

  describe('capturedGroups', () => {
    it('Matching', () => {
      TestUtils.assertSome(pipe(regExp, MRegExp.capturedGroups('afooa', 2)), Tuple.make('o', ''));
    });
  });
});
