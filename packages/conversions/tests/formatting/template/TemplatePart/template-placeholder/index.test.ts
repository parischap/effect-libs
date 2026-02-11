import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVReal from '@parischap/conversions/CVReal';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import { MRegExpString, MStringFillPosition } from '@parischap/effect-lib';
import { Option, Schema, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplatePlaceholder', () => {
  const threeChars = CVTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<CVTemplatePlaceholder.ExtractName<typeof threeChars>, 'foo'>(),
  );
  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<CVTemplatePlaceholder.ExtractType<typeof threeChars>, string>(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplatePlaceholder.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });

  describe('fixedLength', () => {
    it('.toString()', () => {
      TestUtils.strictEqual(threeChars.toString(), '#foo: 3-character string');
    });

    describe('Parsing', () => {
      it('Not enough characters left', () => {
        TestUtils.assertLeftMessage(
          threeChars.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
        TestUtils.assertLeft(threeChars.parser('aa'));
      });

      it('Just enough characters left', () => {
        TestUtils.assertRight(threeChars.parser('foo'), Tuple.make('foo', ''));
      });

      it('More characters than necessary', () => {
        TestUtils.assertRight(threeChars.parser('foo and baz'), Tuple.make('foo', ' and baz'));
      });
    });

    describe('Formatting', () => {
      it('Too few characters', () => {
        TestUtils.assertLeftMessage(
          threeChars.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
        TestUtils.assertLeft(threeChars.formatter('aa'));
      });

      it('Too many characters', () => {
        TestUtils.assertLeft(threeChars.formatter('foo and baz'));
      });

      it('Just the expected number of characters', () => {
        TestUtils.assertRight(threeChars.formatter('foo'), 'foo');
      });
    });
  });

  describe('paddedFixedLength', () => {
    const placeholder = CVTemplatePlaceholder.paddedFixedLength({
      name: 'foo',
      length: 3,
      fillChar: '0',
      fillPosition: MStringFillPosition.Type.Left,
      disallowEmptyString: true,
    });
    it('.toString()', () => {
      TestUtils.strictEqual(
        placeholder.toString(),
        "#foo: 3-character string left-padded with '0'",
      );
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(
          placeholder.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(placeholder.parser('001 and baz'), Tuple.make('1', ' and baz'));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(
          placeholder.formatter('foo and baz'),
          'Expected length of #foo to be: 3. Actual: 11',
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(placeholder.formatter('a'), '00a');
      });
    });
  });

  describe('fixedLengthToReal', () => {
    const placeholder = CVTemplatePlaceholder.fixedLengthToReal({
      name: 'foo',
      length: 3,
      fillChar: ' ',
      numberBase10Format: CVNumberBase10Format.integer,
    });
    it('.toString()', () => {
      TestUtils.strictEqual(
        placeholder.toString(),
        "#foo: 3-character string left-padded with ' ' to potentially signed integer",
      );
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(
          placeholder.parser(''),
          'Expected length of #foo to be: 3. Actual: 0',
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(
          placeholder.parser('  15'),
          Tuple.make(CVReal.unsafeFromNumber(1), '5'),
        );
      });
    });

    describe('Formatting', () => {
      it('Not passing: too long', () => {
        TestUtils.assertLeftMessage(
          placeholder.formatter(CVReal.unsafeFromNumber(1154)),
          'Expected length of #foo to be: 3. Actual: 4',
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(placeholder.formatter(CVReal.unsafeFromNumber(34)), ' 34');
        TestUtils.assertRight(placeholder.formatter(CVReal.unsafeFromNumber(-4)), '- 4');
      });
    });
  });

  describe('real', () => {
    const placeholder = CVTemplatePlaceholder.real({
      name: 'foo',
      numberBase10Format: CVNumberBase10Format.frenchStyleNumber,
    });
    it('.toString()', () => {
      TestUtils.strictEqual(placeholder.toString(), '#foo: potentially signed French-style number');
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(
          placeholder.parser(''),
          "#foo contains '' from the start of which a(n) potentially signed French-style number could not be extracted",
        );
        TestUtils.assertLeft(placeholder.parser('1 014,1254 and foo'));
      });

      it('Passing', () => {
        TestUtils.assertRight(
          placeholder.parser('1 014,125 and foo'),
          Tuple.make(CVReal.unsafeFromNumber(1014.125), ' and foo'),
        );
      });
    });

    it('Formatting', () => {
      TestUtils.assertRight(placeholder.formatter(CVReal.unsafeFromNumber(1014.1256)), '1 014,126');
    });
  });

  describe('mappedLiterals', () => {
    const map = CVTemplatePlaceholder.mappedLiterals({
      name: 'foo',
      keyValuePairs: [
        ['foo', 6],
        ['bazbar', 12],
      ],
      schemaInstance: Schema.Number,
    });

    it('.toString()', () => {
      TestUtils.strictEqual(map.toString(), '#foo: from [foo, bazbar] to [6, 12]');
    });

    describe('Parsing', () => {
      it('Not starting by value', () => {
        TestUtils.assertLeftMessage(
          map.parser(''),
          "Expected remaining text for #foo to start with one of [foo, bazbar]. Actual: ''",
        );
        TestUtils.assertLeft(map.parser('baz is away'));
      });

      it('Passing', () => {
        TestUtils.assertRight(map.parser('bazbar is away'), Tuple.make(12, ' is away'));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(map.formatter(4), '#foo: expected one of [6, 12]. Actual: 4');
      });

      it('Passing', () => {
        TestUtils.assertRight(map.formatter(6), 'foo');
      });
    });
  });

  describe('anythingBut', () => {
    const noSpaceChars = CVTemplatePlaceholder.anythingBut({
      name: 'foo',
      forbiddenChars: [MRegExpString.space],
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        noSpaceChars.toString(),
        String.raw`#foo: a non-empty string containing non of the following characters: ['\s']`,
      );
    });

    describe('Parsing', () => {
      it('Not passing', () => {
        TestUtils.assertLeftMessage(
          noSpaceChars.parser(''),
          String.raw`Expected #foo to be a non-empty string containing non of the following characters: ['\s']. Actual: ''`,
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(noSpaceChars.parser('foo and bar'), Tuple.make('foo', ' and bar'));
        TestUtils.assertRight(noSpaceChars.parser('foo'), Tuple.make('foo', ''));
      });
    });

    describe('Formatting', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(noSpaceChars.formatter(''));
        TestUtils.assertLeftMessage(
          noSpaceChars.formatter('fo o'),
          String.raw`#foo: expected a non-empty string containing non of the following characters: ['\s']. Actual: 'fo o'`,
        );
      });

      it('Passing', () => {
        TestUtils.assertRight(noSpaceChars.formatter('foo'), 'foo');
      });
    });
  });

  describe('toEnd', () => {
    const toEnd = CVTemplatePlaceholder.toEnd('foo');

    it('.toString()', () => {
      TestUtils.strictEqual(toEnd.toString(), '#foo: a string');
    });

    it('Parsing', () => {
      TestUtils.assertRight(toEnd.parser('foo and bar'), Tuple.make('foo and bar', ''));
    });

    it('Formatting', () => {
      TestUtils.assertRight(toEnd.formatter('foo'), 'foo');
    });
  });
});
