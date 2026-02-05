import { ASColorRgb, ASColorThreeBit, ASText } from '@parischap/ansi-styles';
import * as ASCode from '@parischap/ansi-styles/ASCode';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Array, flow, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASText', () => {
  const none = ASText.concat;
  const bold = ASText.fromStyleAndElems(ASStyleCharacteristics.bold);
  const dim = ASText.fromStyleAndElems(ASStyleCharacteristics.dim);
  const italic = ASText.fromStyleAndElems(ASStyleCharacteristics.italic);
  const underlined = ASText.fromStyleAndElems(ASStyleCharacteristics.underlined);
  const notBold = ASText.fromStyleAndElems(ASStyleCharacteristics.notBold);
  const notUnderlined = ASText.fromStyleAndElems(ASStyleCharacteristics.notUnderlined);

  const red = pipe(
    ASColorThreeBit.red,
    ASStyleCharacteristics.fromColorAsForegroundColor,
    ASText.fromStyleAndElems,
  );
  const pink = pipe(
    ASColorRgb.pink,
    ASStyleCharacteristics.fromColorAsForegroundColor,
    ASText.fromStyleAndElems,
  );

  const boldRed = flow(bold, red);
  const boldRedFoo = pipe('foo', boldRed);
  const foo = ASText.fromString('foo');
  const bar = ASText.fromString('bar');
  const baz = ASText.fromString('baz');

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), ASText.moduleTag);
    });

    describe('haveSameText', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASText.haveSameText(boldRedFoo, ASText.fromString('foo')));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASText.haveSameText(boldRedFoo, boldRed('bar')));
      });
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(boldRedFoo, pipe('foo', red, bold));
        TestUtils.assertEquals(boldRed(''), none(''));
      });
      it('Non matching', () => {
        TestUtils.assertNotEquals(boldRedFoo, pipe('foo', bold));
      });
    });

    describe('.toString()', () => {
      it('Empty', () => {
        TestUtils.strictEqual(ASText.empty.toString(), '');
      });

      it('Simple string with no style', () => {
        TestUtils.strictEqual(none('foo').toString(), 'foo');
      });

      it('Bold red string', () => {
        TestUtils.strictEqual(
          boldRedFoo.toString(),
          `${ASCode.fromNonEmptySequence([1, 31])}foo${ASCode.reset}`,
        );
      });
    });
  });

  it('length', () => {
    TestUtils.strictEqual(ASText.toLength(dim(pink('foo'), red('bar'))), 6);
  });

  it('concat', () => {
    TestUtils.strictEqual(
      ASText.toUnstyledString(ASText.concat(foo, bar, boldRedFoo)),
      'foobarfoo',
    );
  });

  describe('empty, isEmpty', () => {
    it('Matching', () => {
      TestUtils.assertTrue(ASText.isEmpty(ASText.empty));
    });
    it('Non matching', () => {
      TestUtils.assertFalse(ASText.isEmpty(boldRedFoo));
    });
  });

  it('fromStyleAndElems', () => {
    const weird = bold('foo', 'bar', italic('foo'), italic('bar'), '', 'baz');
    TestUtils.strictEqual(pipe(weird, ASText.uniStyledTexts, Array.length), 3);
    TestUtils.assertEquals(weird, bold('foobar', italic('foobar'), 'baz'));
  });

  it('toAnsiString', () => {
    const text = notUnderlined(
      'foo ',
      boldRed(
        'goes ',
        italic('to '),
        pink('the ', notBold('beach ')),
        dim('to swim '),
        underlined('with bar'),
      ),
    );

    TestUtils.strictEqual(
      ASText.toAnsiString(text),
      `foo ${ASCode.fromNonEmptySequence([1, 31])}goes ${ASCode.fromNonEmptySequence([3])}to \
${ASCode.fromNonEmptySequence([23, 38, 2, 255, 192, 203])}the ${ASCode.fromNonEmptySequence([22])}beach \
${ASCode.fromNonEmptySequence([1, 2, 31])}to swim ${ASCode.fromNonEmptySequence([22, 1, 4])}with bar${ASCode.reset}`,
    );
  });

  it('toUnstyledString', () => {
    TestUtils.strictEqual(ASText.toUnstyledString(dim(pink('foo'), red('bar'))), 'foobar');
  });

  it('append', () => {
    TestUtils.strictEqual(ASText.toUnstyledString(foo.pipe(ASText.append(bar))), 'foobar');
  });

  it('prepend', () => {
    TestUtils.strictEqual(ASText.toUnstyledString(bar.pipe(ASText.prepend(foo))), 'foobar');
  });

  it('surround', () => {
    TestUtils.strictEqual(
      ASText.toUnstyledString(bar.pipe(ASText.surround(foo, foo))),
      'foobarfoo',
    );
  });

  it('join', () => {
    TestUtils.strictEqual(
      pipe(Array.make(foo, bar, foo), ASText.join(baz), ASText.toUnstyledString),
      'foobazbarbazfoo',
    );
  });

  it('repeat', () => {
    TestUtils.strictEqual(ASText.toUnstyledString(bar.pipe(ASText.repeat(3))), 'barbarbar');
  });
});
