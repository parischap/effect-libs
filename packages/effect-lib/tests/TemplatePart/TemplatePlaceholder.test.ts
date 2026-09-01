import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';

describe('MTemplatePlaceholder', () => {
  const threeChars = MTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<MTemplatePlaceholder.ExtractName<typeof threeChars>, 'foo'>(),
  );
  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<MTemplatePlaceholder.ExtractType<typeof threeChars>, string>(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTemplatePlaceholder.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });

  describe('fixedLength', () => {
    it('.toString()', () => {
      assert.strictEqual(threeChars.toString(), '#foo: 3-character string');
    });

    describe('Parsing', () => {
      it('Not enough characters left', () => {
        TestUtils.assertFailureMessage(
          threeChars.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
        TestUtils.assertFailure(threeChars.parser('aa'));
      });

      it('Just enough characters left', () => {
        TestUtils.assertSuccess(threeChars.parser('foo'), Tuple.make('foo', ''));
      });

      it('More characters than necessary', () => {
        TestUtils.assertSuccess(threeChars.parser('foo and baz'), Tuple.make('foo', ' and baz'));
      });
    });

    describe('Formatting', () => {
      it('Too few characters', () => {
        TestUtils.assertFailureMessage(
          threeChars.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
        TestUtils.assertFailure(threeChars.formatter('aa'));
      });

      it('Too many characters', () => {
        TestUtils.assertFailure(threeChars.formatter('foo and baz'));
      });

      it('Just the expected number of characters', () => {
        TestUtils.assertSuccess(threeChars.formatter('foo'), 'foo');
      });
    });
  });

  describe('paddedFixedLength', () => {
    const placeholder = MTemplatePlaceholder.paddedFixedLength({
      name: 'foo',
      length: 3,
      fillChar: '0',
      fillPosition: MStringFillPosition.Type.Left,
    });
    it('.toString()', () => {
      assert.strictEqual(placeholder.toString(), "#foo: 3-character string left-padded with '0'");
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          placeholder.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
      });

      it('Passing', () => {
        TestUtils.assertSuccess(placeholder.parser('001 and baz'), Tuple.make('1', ' and baz'));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          placeholder.formatter('foo and baz'),
          'Expected length of #foo to be: 3. Actual: 11',
        );
      });

      it('Passing', () => {
        TestUtils.assertSuccess(placeholder.formatter('a'), '00a');
      });
    });
  });

  describe('number', () => {
    describe('fixed-length format', () => {
      const placeholder = MTemplatePlaceholder.number({
        name: 'foo',
        numberBase10Format: MNumberBase10Format.twoDigitSignedInteger,
      });
      it('.toString()', () => {
        assert.strictEqual(
          placeholder.toString(),
          '#foo: 3-character string to 0-left-padded signed integer',
        );
      });

      describe('Parsing', () => {
        it('Not passing', () => {
          TestUtils.assertFailureMessage(
            placeholder.parser('45'),
            'Expected length of #foo to be: 3. Actual: 2',
          );
        });

        it('Passing', () => {
          TestUtils.assertSuccess(placeholder.parser('+1545'), Tuple.make(15, '45'));
          TestUtils.assertSuccess(placeholder.parser('-1545'), Tuple.make(-15, '45'));
          TestUtils.assertSuccess(placeholder.parser('+0045'), Tuple.make(0, '45'));
        });
      });

      describe('Formatting', () => {
        it('Not passing: too long', () => {
          TestUtils.assertFailureMessage(
            placeholder.formatter(1154),
            'Expected length of #foo to be: 3. Actual: 5',
          );
        });

        it('Not passing: non-finite number', () => {
          TestUtils.assertFailure(placeholder.formatter(Number.NaN));
        });

        it('Passing', () => {
          TestUtils.assertSuccess(placeholder.formatter(34), '+34');
          TestUtils.assertSuccess(placeholder.formatter(-4), '-04');
          TestUtils.assertSuccess(placeholder.formatter(-0), '-00');
        });
      });
    });

    describe('Not a fixed-length format', () => {
      const placeholder = MTemplatePlaceholder.number({
        name: 'foo',
        numberBase10Format: MNumberBase10Format.frenchStyleNumber,
      });
      it('.toString()', () => {
        assert.strictEqual(placeholder.toString(), '#foo: potentially signed French-style number');
      });

      describe('Parsing', () => {
        it('Not passing', () => {
          TestUtils.assertFailureMessage(
            placeholder.parser(''),
            "#foo contains '' from the start of which a(n) potentially signed French-style number could not be extracted",
          );
          TestUtils.assertFailure(placeholder.parser('1 014,1254 and foo'));
        });

        it('Passing', () => {
          TestUtils.assertSuccess(
            placeholder.parser('1 014,125 and foo'),
            Tuple.make(1014.125, ' and foo'),
          );
        });
      });

      describe('Formatting', () => {
        it('Not passing: non-finite number', () => {
          TestUtils.assertFailure(placeholder.formatter(Number.NaN));
        });

        it('Passing', () => {
          TestUtils.assertSuccess(placeholder.formatter(1014.1256), '1 014,126');
        });
      });
    });
  });

  describe('mappedLiterals', () => {
    const map = MTemplatePlaceholder.mappedLiterals({
      name: 'foo',
      keyValuePairs: [
        ['foo', 6],
        ['bazbar', 12],
      ],
      schemaInstance: Schema.Number,
    });

    it('.toString()', () => {
      assert.strictEqual(map.toString(), '#foo: from [foo, bazbar] to [6, 12]');
    });

    describe('Parsing', () => {
      it('Not starting by value', () => {
        TestUtils.assertFailureMessage(
          map.parser(''),
          "Expected remaining text for #foo to start with one of [foo, bazbar]. Actual: ''",
        );
        TestUtils.assertFailure(map.parser('baz is away'));
      });

      it('Passing', () => {
        TestUtils.assertSuccess(map.parser('bazbar is away'), Tuple.make(12, ' is away'));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          map.formatter(4),
          '#foo: expected one of [6, 12]. Actual: 4',
        );
      });

      it('Passing', () => {
        TestUtils.assertSuccess(map.formatter(6), 'foo');
      });
    });
  });

  describe('anythingBut', () => {
    const noSpaceChars = MTemplatePlaceholder.anythingBut({
      name: 'foo',
      forbiddenChars: [MRegExpString.space],
    });

    it('.toString()', () => {
      assert.strictEqual(
        noSpaceChars.toString(),
        String.raw`#foo: a non-empty string containing non of the following characters: ['\s']`,
      );
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          noSpaceChars.parser(''),
          String.raw`Expected #foo to be a non-empty string containing non of the following characters: ['\s']. Actual: ''`,
        );
      });

      it('Passing', () => {
        TestUtils.assertSuccess(noSpaceChars.parser('foo and bar'), Tuple.make('foo', ' and bar'));
        TestUtils.assertSuccess(noSpaceChars.parser('foo'), Tuple.make('foo', ''));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertFailure(noSpaceChars.formatter(''));
        TestUtils.assertFailureMessage(
          noSpaceChars.formatter('fo o'),
          String.raw`#foo: expected a non-empty string containing non of the following characters: ['\s']. Actual: 'fo o'`,
        );
      });

      it('Passing', () => {
        TestUtils.assertSuccess(noSpaceChars.formatter('foo'), 'foo');
      });
    });
  });

  describe('toEnd', () => {
    const toEnd = MTemplatePlaceholder.toEnd('foo');

    it('.toString()', () => {
      assert.strictEqual(toEnd.toString(), '#foo: a string');
    });

    it('Parsing', () => {
      TestUtils.assertSuccess(toEnd.parser('foo and bar'), Tuple.make('foo and bar', ''));
    });

    it('Formatting', () => {
      TestUtils.assertSuccess(toEnd.formatter('foo'), 'foo');
    });
  });
});
