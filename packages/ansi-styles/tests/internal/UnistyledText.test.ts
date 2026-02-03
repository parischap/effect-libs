import { ASCode, ASStyleCharacteristics, ASUnistyledText } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('UnistyledText', () => {
  const simpleText = 'Hello';
  const boldStyle = ASStyleCharacteristics.bold;
  const italicStyle = ASStyleCharacteristics.italic;
  const boldItalicStyle = pipe(
    ASStyleCharacteristics.bold,
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
  );

  const simpleBoldText = ASUnistyledText.make({ text: simpleText, style: boldStyle });
  const simpleBoldItalicText = ASUnistyledText.make({ text: simpleText, style: boldItalicStyle });

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASUnistyledText.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('concat', () => {
    it('concatenates single element', () => {
      const result = ASUnistyledText.concat([simpleBoldText]);
      TestUtils.strictEqual(ASUnistyledText.text(result), simpleText);
      TestUtils.deepStrictEqual(ASUnistyledText.style(result), boldStyle);
    });

    it('concatenates multiple elements and takes first style', () => {
      const text1 = ASUnistyledText.make({ text: 'Hello', style: boldStyle });
      const text2 = ASUnistyledText.make({ text: ' World', style: italicStyle });

      const result = ASUnistyledText.concat([text1, text2]);
      TestUtils.strictEqual(ASUnistyledText.text(result), 'Hello World');
      TestUtils.deepStrictEqual(ASUnistyledText.style(result), boldStyle);
    });

    it('concatenates multiple elements with empty strings', () => {
      const text1 = ASUnistyledText.make({ text: '', style: boldStyle });
      const text2 = ASUnistyledText.make({ text: 'Hello', style: italicStyle });
      const text3 = ASUnistyledText.make({ text: 'World', style: boldStyle });

      const result = ASUnistyledText.concat([text1, text2, text3]);
      TestUtils.strictEqual(ASUnistyledText.text(result), 'HelloWorld');
    });
  });

  describe('toLength', () => {
    it('returns correct length for simple text', () => {
      TestUtils.strictEqual(ASUnistyledText.toLength(simpleBoldText), 5);
    });

    it('returns 0 for empty text', () => {
      const text = ASUnistyledText.make({ text: '', style: boldStyle });
      TestUtils.strictEqual(ASUnistyledText.toLength(text), 0);
    });
  });

  describe('toAnsiString', () => {
    it('wraps text with bold ANSI codes', () => {
      TestUtils.assertEquals(
        ASUnistyledText.toAnsiString(simpleBoldText),
        `${ASCode.bold}Hello${ASCode.reset}`,
      );
    });

    it('returns plain text when style is none', () => {
      const text = ASUnistyledText.make({ text: 'Hello', style: ASStyleCharacteristics.none });
      TestUtils.strictEqual(ASUnistyledText.toAnsiString(text), 'Hello');
    });

    it('does not wraps empty text with ANSI codes when style is present', () => {
      const text = ASUnistyledText.make({ text: '', style: boldStyle });
      TestUtils.strictEqual(ASUnistyledText.toAnsiString(text), '');
    });

    it('applies multiple styles together', () => {
      TestUtils.strictEqual(
        ASUnistyledText.toAnsiString(simpleBoldItalicText),
        `${ASCode.fromNonEmptySequence([1, 3])}Hello${ASCode.reset}`,
      );
    });
  });

  describe('applyStyleUnder', () => {
    it('applies style under existing style', () => {
      const result = pipe(
        simpleBoldText,
        ASUnistyledText.applyStyleUnder(ASStyleCharacteristics.notBold),
      );
      TestUtils.strictEqual(ASUnistyledText.text(result), simpleText);
      // Bold should take precedence as it's already in the text
      TestUtils.deepStrictEqual(ASUnistyledText.style(result), boldStyle);
    });

    it('applies empty style under existing style', () => {
      TestUtils.deepStrictEqual(
        pipe(
          simpleBoldText,
          ASUnistyledText.applyStyleUnder(ASStyleCharacteristics.none),
          ASUnistyledText.style,
        ),
        boldStyle,
      );
    });

    it('applies style under none style', () => {
      const text = ASUnistyledText.make({ text: simpleText, style: ASStyleCharacteristics.none });
      const result = pipe(text, ASUnistyledText.applyStyleUnder(boldStyle));
      TestUtils.deepStrictEqual(ASUnistyledText.style(result), boldStyle);
    });
  });
});
