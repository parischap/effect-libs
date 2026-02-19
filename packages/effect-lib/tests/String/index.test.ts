import * as TestUtils from '@parischap/configs/TestUtils';
import * as MString from '@parischap/effect-lib/MString';
import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';
import * as MStringSearchResult from '@parischap/effect-lib/MStringSearchResult';
import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Option from 'effect/Option';
import * as String from 'effect/String';
import { describe, it } from 'vitest';

describe('MString', () => {
  describe('fromPrimitive', () => {
    it('null', () => {
      TestUtils.strictEqual(MString.fromPrimitive(null), 'null');
    });

    it('undefined', () => {
      TestUtils.strictEqual(MString.fromPrimitive(undefined), 'undefined');
    });

    it('Finite integer', () => {
      TestUtils.strictEqual(MString.fromPrimitive(5), '5');
    });

    it('Infinity', () => {
      TestUtils.strictEqual(MString.fromPrimitive(Infinity), 'Infinity');
    });

    it('+Infinity', () => {
      TestUtils.strictEqual(MString.fromPrimitive(Infinity), 'Infinity');
    });

    it('-Infinity', () => {
      TestUtils.strictEqual(MString.fromPrimitive(-Infinity), '-Infinity');
    });

    it('NaN', () => {
      TestUtils.strictEqual(MString.fromPrimitive(Number.NaN), 'NaN');
    });

    it('Irrational number', () => {
      TestUtils.strictEqual(MString.fromPrimitive(16 / 3), '5.333333333333333');
    });

    it('Very small number', () => {
      TestUtils.strictEqual(MString.fromPrimitive(1e-8), '0.00000001');
    });

    it('Very large integer', () => {
      TestUtils.strictEqual(MString.fromPrimitive(1e22), '10000000000000000000000');
    });
  });

  describe('fromUnknown', () => {
    it('Primitive value', () => {
      TestUtils.strictEqual(MString.fromUnknown(null), 'null');
    });

    it('Non-primitive value', () => {
      TestUtils.strictEqual(
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
      TestUtils.assertTrue(pipe('', MString.searchAll('foo'), Array.isEmptyArray));
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
      TestUtils.assertTrue(pipe('', MString.searchAll(/f.o/), Array.isEmptyArray));
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
      TestUtils.assertTrue(pipe('', MString.takeTo('foo'), String.isEmpty));
    });

    it('RegExp in non-empty string', () => {
      TestUtils.strictEqual(MString.takeTo(/bar/)('the bar is foo'), 'the ');
    });

    it('string with regexp special characters in non-empty string', () => {
      TestUtils.strictEqual(MString.takeTo('.')('foo.bar.baz'), 'foo');
    });
  });

  describe('takeRightFrom', () => {
    it('string in empty string', () => {
      TestUtils.assertTrue(pipe('', MString.takeRightFrom('is'), String.isEmpty));
    });

    it('RegExp in non-empty string', () => {
      TestUtils.strictEqual(MString.takeRightFrom(/is/)('the bar is foo'), ' foo');
    });
  });

  describe('takeBut', () => {
    it('Empty string', () => {
      TestUtils.assertTrue(pipe('', MString.takeBut(2), String.isEmpty));
    });

    it('Non-empty string', () => {
      TestUtils.strictEqual(MString.takeBut(3)('foo is'), 'foo');
    });
  });

  describe('takeRightBut', () => {
    it('Empty string', () => {
      TestUtils.assertTrue(pipe('', MString.takeRightBut(2), String.isEmpty));
    });

    it('Non-empty string', () => {
      TestUtils.strictEqual(MString.takeRightBut(4)('foo is'), 'is');
    });
  });

  describe('trimStart', () => {
    it('Empty string', () => {
      TestUtils.assertTrue(pipe('', MString.trimStart('0'), String.isEmpty));
    });

    it('Non-empty string with the character to remove not at the start', () => {
      TestUtils.strictEqual(MString.trimStart('0')('12034000'), '12034000');
    });

    it('Non-empty string with the character to remove at the start', () => {
      TestUtils.strictEqual(MString.trimStart('0')('0012034000'), '12034000');
    });
  });

  describe('trimEnd', () => {
    it('Empty string', () => {
      TestUtils.assertTrue(pipe('', MString.trimEnd('0'), String.isEmpty));
    });

    it('Non-empty string with the character to remove not at the end', () => {
      TestUtils.strictEqual(MString.trimEnd('0')('00012034'), '00012034');
    });

    it('Non-empty string with the character to remove at the end', () => {
      TestUtils.strictEqual(MString.trimEnd('0')('0001203400'), '00012034');
    });
  });

  describe('pad', () => {
    it('Left padding', () => {
      TestUtils.strictEqual(
        pipe(
          'a',
          MString.pad({ length: 3, fillChar: 'b', fillPosition: MStringFillPosition.Type.Left }),
        ),
        'bba',
      );
    });

    it('Right padding less than length characters', () => {
      TestUtils.strictEqual(
        pipe(
          'aa',
          MString.pad({ length: 3, fillChar: 'b', fillPosition: MStringFillPosition.Type.Right }),
        ),
        'aab',
      );
    });

    it('Right padding strictly more than length characters', () => {
      TestUtils.strictEqual(
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
      TestUtils.strictEqual(
        pipe(
          'bba',
          MString.trim({
            fillChar: 'b',
            fillPosition: MStringFillPosition.Type.Left,
            allowEmptyString: true,
          }),
        ),
        'a',
      );
    });

    it('Right trimming', () => {
      TestUtils.strictEqual(
        pipe(
          'aab',
          MString.trim({
            fillChar: 'b',
            fillPosition: MStringFillPosition.Type.Right,
            allowEmptyString: true,
          }),
        ),
        'aa',
      );
    });

    it('Trimming string containing only fillChars with allowEmptyString = false', () => {
      TestUtils.strictEqual(
        pipe(
          '000',
          MString.trim({
            fillChar: '0',
            fillPosition: MStringFillPosition.Type.Right,
            allowEmptyString: true,
          }),
        ),
        '',
      );
    });

    it('Trimming string containing only fillChars with allowEmptyString = true', () => {
      TestUtils.strictEqual(
        pipe(
          '000',
          MString.trim({
            fillChar: '0',
            fillPosition: MStringFillPosition.Type.Left,
            allowEmptyString: false,
          }),
        ),
        '0',
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
      TestUtils.assertTrue(pipe('', MString.stripLeft('foo'), String.isEmpty));
    });

    it('Non-empty string with matching start', () => {
      TestUtils.strictEqual(MString.stripLeft('foo ')('foo is'), 'is');
    });

    it('Non-empty string with non matching start', () => {
      TestUtils.strictEqual(MString.stripLeft('foo ')('bar is'), 'bar is');
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
      TestUtils.assertTrue(pipe('', MString.stripRight('foo'), String.isEmpty));
    });

    it('Non-empty string with matching end', () => {
      TestUtils.strictEqual(MString.stripRight(' foo')('foo is foo'), 'foo is');
    });

    it('Non-empty string with non matching end', () => {
      TestUtils.strictEqual(MString.stripRight(' foo')('foo is bar'), 'foo is bar');
    });
  });

  describe('count', () => {
    it('string in empty string', () => {
      TestUtils.strictEqual(MString.count('foo')(''), 0);
    });

    it('RegExp in non-empty string', () => {
      TestUtils.strictEqual(MString.count(/f.o/)('foo is fuo'), 2);
    });
  });

  describe('replaceBetween', () => {
    it('Empty string', () => {
      TestUtils.strictEqual(MString.replaceBetween('foo', 5, 2)(''), 'foo');
    });

    it('Replacement in non-empty string', () => {
      TestUtils.strictEqual(
        MString.replaceBetween('himself', 8, 11)('foo saw bar and baz'),
        'foo saw himself and baz',
      );
    });

    it('Insertion in non-empty string', () => {
      TestUtils.strictEqual(
        MString.replaceBetween('bar and ', 8, 8)('foo saw baz'),
        'foo saw bar and baz',
      );
    });

    it('Replacement in non-empty string with unorthodox arguments', () => {
      TestUtils.strictEqual(
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

    it('With global flag', () => {
      TestUtils.assertSome(numberGlobalMatcher('Numbers between 1 and 9'), '1');
      TestUtils.assertSome(numberGlobalMatcher('Numbers between 1 and 9'), '1');
    });

    it('Matching', () => {
      TestUtils.assertSome(pipe('afooa', stringMatcher), 'afooa');
      TestUtils.assertSome(pipe('afoobara', stringMatcher), 'afoobara');
    });

    it('Non matching', () => {
      TestUtils.assertNone(pipe('afoob', stringMatcher));
    });
  });

  describe('matches', () => {
    const containsDigit = MString.matches(/\d/);
    it('Matching', () => {
      TestUtils.assertTrue(containsDigit('a9b'));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(containsDigit('a'));
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
    it('Empty string', () => {
      TestUtils.deepStrictEqual(MString.splitAt(2)(''), ['', '']);
    });

    it('Non-empty string', () => {
      TestUtils.deepStrictEqual(MString.splitAt(6)('beforeafter'), ['before', 'after']);
    });
  });

  describe('splitAtFromRight', () => {
    it('Empty string', () => {
      TestUtils.deepStrictEqual(MString.splitAtFromRight(2)(''), ['', '']);
    });

    it('Non-empty string', () => {
      TestUtils.deepStrictEqual(MString.splitAtFromRight(5)('beforeafter'), ['before', 'after']);
    });
  });

  describe('splitEquallyRestAtStart', () => {
    it('Empty string', () =>
      TestUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)(''), ['']));

    it('Non-empty string without rest', () =>
      TestUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)('foobarbaz'), [
        'foo',
        'bar',
        'baz',
      ]));

    it('Non-empty string with rest', () =>
      TestUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)('afoobarbaz'), [
        'a',
        'foo',
        'bar',
        'baz',
      ]));
  });

  describe('splitEquallyRestAtEnd', () => {
    it('Empty string', () => TestUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)(''), ['']));

    it('Non-empty string without rest', () =>
      TestUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaz'), [
        'foo',
        'bar',
        'baz',
      ]));

    it('Non-empty string with rest', () =>
      TestUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaza'), [
        'foo',
        'bar',
        'baz',
        'a',
      ]));
  });

  describe('tabify', () => {
    const simpleTabify = MString.tabify('aa', 3);
    it('Empty string', () => {
      TestUtils.strictEqual(simpleTabify(''), 'aaaaaa');
    });
    it('One-line string', () => {
      TestUtils.strictEqual(simpleTabify('foo'), 'aaaaaafoo');
    });
    it('Two-line string', () => {
      TestUtils.strictEqual(simpleTabify('foo\r\nfoo1'), 'aaaaaafoo\r\naaaaaafoo1');
    });
  });

  describe('isMultiLine', () => {
    it('Matching - Windows', () => {
      TestUtils.assertTrue(MString.isMultiLine('foo\r\nbar'));
    });
    it('Matching - Mac Os before X', () => {
      TestUtils.assertTrue(MString.isMultiLine('foo\rbar'));
    });
    it('Matching - UNIX, Mac Os X', () => {
      TestUtils.assertTrue(MString.isMultiLine('foo\nbar'));
    });
    it('Not matching - foo', () => {
      TestUtils.assertFalse(MString.isMultiLine('foo'));
    });
  });

  describe('hasLength', () => {
    it('Simple string', () => {
      TestUtils.assertTrue(MString.hasLength(3)('foo'));
    });
  });

  it('removeNCharsEveryMCharsFromRight', () => {
    TestUtils.strictEqual(
      MString.removeNCharsEveryMCharsFromRight({ n: 2, m: 3 })('1aafooaabaraabaz'),
      '1foobarbaz',
    );
  });

  describe('isDigit', () => {
    it('Non matching', () => {
      TestUtils.assertFalse(MString.isDigit(''));
      TestUtils.assertFalse(MString.isDigit('1A'));
      TestUtils.assertFalse(MString.isDigit('A'));
    });
    it('Matching', () => {
      TestUtils.assertTrue(MString.isDigit('1'));
      TestUtils.assertTrue(MString.isDigit('5'));
      TestUtils.assertTrue(MString.isDigit('9'));
    });
  });
});
