import { pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Option from 'effect/Option';
import * as String from 'effect/String';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MString from '@parischap/effect-lib/MString';
import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';
import * as MStringSearchResult from '@parischap/effect-lib/MStringSearchResult';

import { assert, describe, it } from '@effect/vitest';

describe('MString', () => {
  describe('fromPrimitive', () => {
    it('null', () => {
      assert.strictEqual(MString.fromPrimitive(null), 'null');
    });

    it('undefined', () => {
      assert.strictEqual(MString.fromPrimitive(undefined), 'undefined');
    });

    it('Finite integer', () => {
      assert.strictEqual(MString.fromPrimitive(5), '5');
    });

    it('Infinity', () => {
      assert.strictEqual(MString.fromPrimitive(Infinity), 'Infinity');
    });

    it('+Infinity', () => {
      assert.strictEqual(MString.fromPrimitive(Infinity), 'Infinity');
    });

    it('-Infinity', () => {
      assert.strictEqual(MString.fromPrimitive(-Infinity), '-Infinity');
    });

    it('NaN', () => {
      assert.strictEqual(MString.fromPrimitive(Number.NaN), 'NaN');
    });

    it('Irrational number', () => {
      assert.strictEqual(MString.fromPrimitive(16 / 3), '5.333333333333333');
    });

    it('Very small number', () => {
      assert.strictEqual(MString.fromPrimitive(1e-8), '0.00000001');
    });

    it('Very large integer', () => {
      assert.strictEqual(MString.fromPrimitive(1e22), '10000000000000000000000');
    });
  });

  describe('fromUnknown', () => {
    it('Primitive value', () => {
      assert.strictEqual(MString.fromUnknown(null), 'null');
    });

    it('Non-primitive value', () => {
      assert.strictEqual(
        MString.fromUnknown({ a: 1, b: true }),
        `{
  "a": 1,
  "b": true
}`,
      );
    });
  });

  describe('search', () => {
    it('string in empty string', () => {
      TestUtils.assertNone(MString.search('foo', 4)(''));
    });

    it('string in string containing one occurence', () => {
      TestUtils.assertSome(
        MString.search('foo', 4)('the foo is bar'),
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      );
    });

    it('string in string containing two occurences with startIndex=4', () => {
      TestUtils.assertSome(
        MString.search('foo', 4)('the foo is foo'),
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      );
    });

    it('string in string containing two occurences with startIndex=5', () => {
      TestUtils.assertSome(
        MString.search('foo', 5)('the foo is foo'),
        MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
      );
    });

    it('RegExp in empty string', () => {
      TestUtils.assertNone(MString.search(/f.o/, 4)(''));
    });

    it('RegExp in string containing one occurence', () => {
      TestUtils.assertSome(
        MString.search(/f.o/, 4)('the foo is bar'),
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      );
    });

    it('RegExp in string containing two occurences with startIndex=4', () => {
      TestUtils.assertSome(
        MString.search(/f.o/, 4)('the foo is foo'),
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      );
    });

    it('RegExp in string containing two occurences with startIndex=5', () => {
      TestUtils.assertSome(
        MString.search(/f.o/, 5)('the foo is foo'),
        MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
      );
    });
  });

  describe('searchAll', () => {
    it('string in empty string', () => {
      assert.isTrue(pipe('', MString.searchAll('foo'), Array.isArrayEmpty));
    });

    it('string in string containing two occurences', () => {
      TestUtils.assertEquals(
        MString.searchAll('foo')('the foo is foo'),
        Array.make(
          MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
          MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
        ),
      );
    });

    it('RegExp in empty string', () => {
      assert.isTrue(pipe('', MString.searchAll(/f.o/), Array.isArrayEmpty));
    });

    it('RegExp in string containing two occurences', () => {
      TestUtils.assertEquals(
        MString.searchAll(/f.o/)('the foo is fuo'),
        Array.make(
          MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
          MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'fuo' }),
        ),
      );
    });
  });

  describe('searchRight', () => {
    it('string in empty string', () => {
      TestUtils.assertNone(pipe('', MString.searchRight('foo')));
    });

    it('string in string containing one occurence', () => {
      TestUtils.assertSome(
        MString.searchRight('foo')('the bar is foo'),
        MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
      );
    });

    it('string in string containing two occurences', () => {
      TestUtils.assertSome(
        MString.searchRight('foo')('the foo is foo'),
        MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
      );
    });

    it('RegExp in empty string', () => {
      TestUtils.assertNone(MString.searchRight(/f.o/)(''));
    });

    it('RegExp in string containing one occurence', () => {
      TestUtils.assertSome(
        MString.searchRight(/f.o/)('the foo is bar'),
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      );
    });

    it('RegExp in string containing two occurences', () => {
      TestUtils.assertSome(
        MString.searchRight(/f.o/)('the foo is foo'),
        MStringSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }),
      );
    });
  });

  describe('takeTo', () => {
    it('string in empty string', () => {
      assert.isTrue(pipe('', MString.takeTo('foo'), String.isEmpty));
    });

    it('RegExp in non-empty string', () => {
      assert.strictEqual(MString.takeTo(/bar/)('the bar is foo'), 'the ');
    });

    it('string with regexp special characters in non-empty string', () => {
      assert.strictEqual(MString.takeTo('.')('foo.bar.baz'), 'foo');
    });
  });

  describe('takeRightFrom', () => {
    it('string in empty string', () => {
      assert.isTrue(pipe('', MString.takeRightFrom('is'), String.isEmpty));
    });

    it('RegExp in non-empty string', () => {
      assert.strictEqual(MString.takeRightFrom(/is/)('the bar is foo'), ' foo');
    });
  });

  describe('takeBut', () => {
    it('Index within bounds', () => {
      assert.strictEqual(MString.takeBut(3)('foo is'), 'foo');
    });

    it('Negative index', () => {
      assert.strictEqual(MString.takeBut(-5)('foo is'), 'foo is');
    });

    it('Too big index', () => {
      assert.strictEqual(MString.takeBut(10)('foo is'), '');
    });
  });

  describe('takeRightBut', () => {
    it('Index within bounds', () => {
      assert.strictEqual(MString.takeRightBut(4)('foo is'), 'is');
    });

    it('Negative index', () => {
      assert.strictEqual(MString.takeRightBut(-1)('foo is'), 'foo is');
    });

    it('Too big index', () => {
      assert.strictEqual(MString.takeRightBut(10)('foo is'), '');
    });
  });

  describe('trimStart', () => {
    it('Empty string', () => {
      assert.isTrue(pipe('', MString.trimStart('0'), String.isEmpty));
    });

    it('Non-empty string with the character to remove not at the start', () => {
      assert.strictEqual(MString.trimStart('0')('12034000'), '12034000');
    });

    it('Non-empty string with the character to remove at the start', () => {
      assert.strictEqual(MString.trimStart('0')('0012034000'), '12034000');
    });
  });

  describe('trimEnd', () => {
    it('Empty string', () => {
      assert.isTrue(pipe('', MString.trimEnd('0'), String.isEmpty));
    });

    it('Non-empty string with the character to remove not at the end', () => {
      assert.strictEqual(MString.trimEnd('0')('00012034'), '00012034');
    });

    it('Non-empty string with the character to remove at the end', () => {
      assert.strictEqual(MString.trimEnd('0')('0001203400'), '00012034');
    });
  });

  describe('pad', () => {
    it('Left padding', () => {
      assert.strictEqual(
        pipe(
          'a',
          MString.pad({ length: 3, fillChar: 'b', fillPosition: MStringFillPosition.Type.Left }),
        ),
        'bba',
      );
    });

    it('Right padding less than length characters', () => {
      assert.strictEqual(
        pipe(
          'aa',
          MString.pad({ length: 3, fillChar: 'b', fillPosition: MStringFillPosition.Type.Right }),
        ),
        'aab',
      );
    });

    it('Right padding strictly more than length characters', () => {
      assert.strictEqual(
        pipe(
          'abcd',
          MString.pad({ length: 3, fillChar: 'b', fillPosition: MStringFillPosition.Type.Right }),
        ),
        'abcd',
      );
    });
  });

  describe('trim', () => {
    it('Left trimming', () => {
      assert.strictEqual(
        pipe(
          'bba',
          MString.trim({
            fillChar: 'b',
            fillPosition: MStringFillPosition.Type.Left,
          }),
        ),
        'a',
      );
    });

    it('Right trimming', () => {
      assert.strictEqual(
        pipe(
          'aab',
          MString.trim({
            fillChar: 'b',
            fillPosition: MStringFillPosition.Type.Right,
          }),
        ),
        'aa',
      );
    });
  });

  describe('stripLeftOption', () => {
    it('Empty string', () => {
      TestUtils.assertNone(MString.stripLeftOption('foo')(''));
    });

    it('Non-empty string with matching start', () => {
      TestUtils.assertSome(MString.stripLeftOption('foo ')('foo is'), 'is');
    });

    it('Non-empty string with non matching start', () => {
      TestUtils.assertNone(MString.stripLeftOption('foo ')('bar is'));
    });
  });

  describe('stripLeft', () => {
    it('Empty string', () => {
      assert.isTrue(pipe('', MString.stripLeft('foo'), String.isEmpty));
    });

    it('Non-empty string with matching start', () => {
      assert.strictEqual(MString.stripLeft('foo ')('foo is'), 'is');
    });

    it('Non-empty string with non matching start', () => {
      assert.strictEqual(MString.stripLeft('foo ')('bar is'), 'bar is');
    });
  });

  describe('stripRightOption', () => {
    it('Empty string', () => {
      TestUtils.assertNone(MString.stripRightOption('foo')(''));
    });

    it('Non-empty string with matching end', () => {
      TestUtils.assertSome(MString.stripRightOption(' foo')('foo is foo'), 'foo is');
    });

    it('Non-empty string with non matching start', () => {
      TestUtils.assertNone(MString.stripRightOption(' foo')('foo is bar'));
    });
  });

  describe('stripRight', () => {
    it('Empty string', () => {
      assert.isTrue(pipe('', MString.stripRight('foo'), String.isEmpty));
    });

    it('Non-empty string with matching end', () => {
      assert.strictEqual(MString.stripRight(' foo')('foo is foo'), 'foo is');
    });

    it('Non-empty string with non matching end', () => {
      assert.strictEqual(MString.stripRight(' foo')('foo is bar'), 'foo is bar');
    });
  });

  describe('count', () => {
    it('string in empty string', () => {
      assert.strictEqual(MString.count('foo')(''), 0);
    });

    it('RegExp in non-empty string', () => {
      assert.strictEqual(MString.count(/f.o/)('foo is fuo'), 2);
    });
  });

  describe('replaceBetween', () => {
    it('Empty string', () => {
      assert.strictEqual(MString.replaceBetween('foo', 5, 2)(''), 'foo');
    });

    it('Replacement in non-empty string', () => {
      assert.strictEqual(
        MString.replaceBetween('himself', 8, 11)('foo saw bar and baz'),
        'foo saw himself and baz',
      );
    });

    it('Insertion in non-empty string', () => {
      assert.strictEqual(
        MString.replaceBetween('bar and ', 8, 8)('foo saw baz'),
        'foo saw bar and baz',
      );
    });

    it('Replacement in non-empty string with unorthodox arguments', () => {
      assert.strictEqual(
        MString.replaceBetween('baz. baz', 8, 3)('foo saw bar'),
        'foo saw baz. baz saw bar',
      );
    });
  });

  describe('match', () => {
    const stringMatcher = MString.match(/afoo(?:bar)?a/);
    const numberGlobalMatcher = MString.match(/\d/g);

    it('Without global flag', () => {
      TestUtils.assertSome(MString.match(/\d/)('Numbers between 1 and 9'), '1');
    });

    it('Returns first match regardless of global flag', () => {
      TestUtils.assertSome(numberGlobalMatcher('Numbers between 1 and 9'), '1');
    });

    it('Resets lastIndex before each call', () => {
      TestUtils.assertSome(numberGlobalMatcher('Numbers between 1 and 9'), '1');
    });

    it('Matching without optional group', () => {
      TestUtils.assertSome(pipe('afooa', stringMatcher), 'afooa');
    });

    it('Matching with optional group', () => {
      TestUtils.assertSome(pipe('afoobara', stringMatcher), 'afoobara');
    });

    it('Non matching', () => {
      TestUtils.assertNone(pipe('afoob', stringMatcher));
    });
  });

  describe('matches', () => {
    const containsDigit = MString.matches(/\d/);
    it('Matching', () => {
      assert.isTrue(containsDigit('a9b'));
    });

    it('Non matching', () => {
      assert.isFalse(containsDigit('a'));
    });
  });

  describe('matchWithCapturingGroups', () => {
    const matcher = MString.matchWithCapturingGroups(/afo(?<first>o)(?<second>bar)?a/, [
      'first',
      'second',
    ]);

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        Option.Option.Value<ReturnType<typeof matcher>>,
        { match: string; groups: { first: string; second: string } }
      >(),
    );

    it('Matching', () => {
      TestUtils.assertSome(matcher('afooa3'), {
        match: 'afooa',
        groups: { first: 'o', second: '' },
      });
    });

    it('Non matching', () => {
      TestUtils.assertNone(matcher('afoob'));
    });
  });

  describe('splitAt', () => {
    it('Split within bounds', () => {
      assert.deepStrictEqual(MString.splitAt(6)('beforeafter'), ['before', 'after']);
    });

    it('Split before string start', () => {
      assert.deepStrictEqual(MString.splitAt(-5)('beforeafter'), ['', 'beforeafter']);
    });

    it('Split after string end', () => {
      assert.deepStrictEqual(MString.splitAt(15)('beforeafter'), ['beforeafter', '']);
    });
  });

  describe('splitAtFromRight', () => {
    it('Split within bounds', () => {
      assert.deepStrictEqual(MString.splitAtFromRight(5)('beforeafter'), ['before', 'after']);
    });

    it('Split before string start', () => {
      assert.deepStrictEqual(MString.splitAtFromRight(-5)('beforeafter'), ['beforeafter', '']);
    });

    it('Split after string end', () => {
      assert.deepStrictEqual(MString.splitAtFromRight(15)('beforeafter'), ['', 'beforeafter']);
    });
  });

  describe('splitEquallyRestAtStart', () => {
    it('Empty string', () => assert.deepStrictEqual(MString.splitEquallyRestAtStart(3)(''), ['']));

    it('Short string', () =>
      assert.deepStrictEqual(MString.splitEquallyRestAtStart(3)('11'), ['11']));

    it('Non-empty string without rest', () =>
      assert.deepStrictEqual(MString.splitEquallyRestAtStart(3)('foobarbaz'), [
        'foo',
        'bar',
        'baz',
      ]));

    it('Non-empty string with rest', () =>
      assert.deepStrictEqual(MString.splitEquallyRestAtStart(3)('afoobarbaz'), [
        'a',
        'foo',
        'bar',
        'baz',
      ]));
  });

  describe('splitEquallyRestAtEnd', () => {
    it('Empty string', () => assert.deepStrictEqual(MString.splitEquallyRestAtEnd(3)(''), ['']));

    it('Non-empty string without rest', () =>
      assert.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaz'), ['foo', 'bar', 'baz']));

    it('Non-empty string with rest', () =>
      assert.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaza'), [
        'foo',
        'bar',
        'baz',
        'a',
      ]));
  });

  describe('tabify', () => {
    const simpleTabify = MString.tabify('aa', 3);
    it('Empty string', () => {
      assert.strictEqual(simpleTabify(''), 'aaaaaa');
    });
    it('One-line string', () => {
      assert.strictEqual(simpleTabify('foo'), 'aaaaaafoo');
    });
    it('Two-line string', () => {
      assert.strictEqual(simpleTabify('foo\r\nfoo1'), 'aaaaaafoo\r\naaaaaafoo1');
    });
  });

  describe('isMultiLine', () => {
    it('Matching - Windows', () => {
      assert.isTrue(MString.isMultiLine('foo\r\nbar'));
    });
    it('Matching - Mac Os before X', () => {
      assert.isTrue(MString.isMultiLine('foo\rbar'));
    });
    it('Matching - UNIX, Mac Os X', () => {
      assert.isTrue(MString.isMultiLine('foo\nbar'));
    });
    it('Not matching - foo', () => {
      assert.isFalse(MString.isMultiLine('foo'));
    });
  });

  describe('hasLength', () => {
    it('Simple string', () => {
      assert.isTrue(MString.hasLength(3)('foo'));
    });
  });

  it('removeNCharsEveryMCharsFromRight', () => {
    assert.strictEqual(
      MString.removeNCharsEveryMCharsFromRight({ n: 2, m: 3 })('1aafooaabaraabaz'),
      '1foobarbaz',
    );
  });

  describe('isDigit', () => {
    it('Empty string', () => {
      assert.isFalse(MString.isDigit(''));
    });

    it('Multi-character string', () => {
      assert.isFalse(MString.isDigit('1A'));
    });

    it('Non-digit character', () => {
      assert.isFalse(MString.isDigit('A'));
    });

    it('Digit 1', () => {
      assert.isTrue(MString.isDigit('1'));
    });

    it('Digit 5', () => {
      assert.isTrue(MString.isDigit('5'));
    });

    it('Digit 9', () => {
      assert.isTrue(MString.isDigit('9'));
    });
  });

  describe('fromNonNullablePrimitive', () => {
    it('Number', () => {
      assert.strictEqual(MString.fromNonNullablePrimitive(5), '5');
    });

    it('Boolean', () => {
      assert.strictEqual(MString.fromNonNullablePrimitive(true), 'true');
    });

    it('BigInt', () => {
      assert.strictEqual(MString.fromNonNullablePrimitive(5n), '5');
    });
  });

  describe('fromNumber', () => {
    it('Base-10 number without scientific notation', () => {
      assert.strictEqual(MString.fromNumber(10)(1e-8), '0.00000001');
    });

    it('Non-base-10 radix', () => {
      assert.strictEqual(MString.fromNumber(16)(255), 'ff');
    });
  });

  describe('append', () => {
    it('Appends string to another string', () => {
      assert.strictEqual(pipe('foo', MString.append('bar')), 'foobar');
    });
  });

  describe('appendIfNotEmpty', () => {
    it('Appends string to a non-empty string', () => {
      assert.strictEqual(pipe('foo', MString.appendIfNotEmpty('bar')), 'foobar');
    });

    it('Returns empty string when self is empty', () => {
      assert.isTrue(pipe('', MString.appendIfNotEmpty('bar'), String.isEmpty));
    });
  });

  describe('prepend', () => {
    it('Prepends string to another string', () => {
      assert.strictEqual(pipe('foo', MString.prepend('bar')), 'barfoo');
    });
  });

  describe('prependIfNotEmpty', () => {
    it('Prepends string to a non-empty string', () => {
      assert.strictEqual(pipe('foo', MString.prependIfNotEmpty('bar')), 'barfoo');
    });

    it('Returns empty string when self is empty', () => {
      assert.isTrue(pipe('', MString.prependIfNotEmpty('bar'), String.isEmpty));
    });
  });

  describe('surroundIfNotEmpty', () => {
    it('Surrounds a non-empty string with prefix and suffix', () => {
      assert.strictEqual(
        pipe('foo', MString.surroundIfNotEmpty({ prefix: '[', suffix: ']' })),
        '[foo]',
      );
    });

    it('Returns empty string when self is empty', () => {
      assert.isTrue(
        pipe('', MString.surroundIfNotEmpty({ prefix: '[', suffix: ']' }), String.isEmpty),
      );
    });
  });

  describe('isSemVer', () => {
    it('Valid SemVer', () => {
      assert.isTrue(MString.isSemVer('1.2.3'));
    });

    it('Invalid SemVer', () => {
      assert.isFalse(MString.isSemVer('1.2'));
    });
  });

  describe('isEmail', () => {
    it('Valid email', () => {
      assert.isTrue(MString.isEmail('user@example.com'));
    });

    it('Invalid email', () => {
      assert.isFalse(MString.isEmail('not-an-email'));
    });
  });
});
