/* eslint-disable functional/no-expression-statements */
import { ASColor, ASStyleCharacteristics } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristics', () => {
	const boldItalic = pipe(
		ASStyleCharacteristics.bold,
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic)
	);
	const boldItalicBrightGreenInBlue = pipe(
		boldItalic,
		ASStyleCharacteristics.mergeUnder(
			ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitBrightGreen)
		),
		ASStyleCharacteristics.mergeUnder(
			ASStyleCharacteristics.fromColorAsBackgroundColor(ASColor.eightBitBlue)
		)
	);
	const bold1 = pipe(boldItalic, ASStyleCharacteristics.difference(ASStyleCharacteristics.italic));
	const notBoldNotDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim)
	);
	const boldNotDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.bold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim)
	);
	const notBoldDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.dim)
	);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				ASStyleCharacteristics.moduleTag
			);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(ASStyleCharacteristics.bold, bold1);
				TEUtils.assertEquals(ASStyleCharacteristics.none, ASStyleCharacteristics.none);
			});
			it('Non matching', () => {
				TEUtils.assertNotEquals(ASStyleCharacteristics.bold, boldItalic);
				TEUtils.assertNotEquals(ASStyleCharacteristics.bold, new Date());
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(ASStyleCharacteristics.none.toString(), 'NoStyle');
			TEUtils.strictEqual(
				boldItalicBrightGreenInBlue.toString(),
				'BoldItalicBrightGreenInEightBitBlue'
			);
			TEUtils.strictEqual(ASStyleCharacteristics.fgDefaultColor.toString(), 'DefaultColor');
			TEUtils.strictEqual(ASStyleCharacteristics.bgDefaultColor.toString(), 'InDefaultColor');
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(bold1.pipe(ASStyleCharacteristics.toId), 'Bold');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASStyleCharacteristics.has(boldItalic));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASStyleCharacteristics.has(new Date()));
			});
		});
	});

	it('italicState', () => {
		TEUtils.assertSome(ASStyleCharacteristics.italicState(boldItalic), true);
		TEUtils.assertNone(ASStyleCharacteristics.italicState(bold1));
	});

	it('hasBold', () => {
		TEUtils.assertTrue(ASStyleCharacteristics.hasBold(boldItalic));
		TEUtils.assertFalse(ASStyleCharacteristics.hasBold(ASStyleCharacteristics.none));
		TEUtils.assertFalse(ASStyleCharacteristics.hasBold(notBoldNotDimRed));
	});

	it('hasNotBold', () => {
		TEUtils.assertTrue(ASStyleCharacteristics.hasNotBold(notBoldNotDimRed));
		TEUtils.assertFalse(ASStyleCharacteristics.hasNotBold(boldItalic));
		TEUtils.assertFalse(ASStyleCharacteristics.hasNotBold(ASStyleCharacteristics.none));
	});

	it('hasDim', () => {
		TEUtils.assertTrue(ASStyleCharacteristics.hasDim(notBoldDimRed));
		TEUtils.assertFalse(ASStyleCharacteristics.hasDim(ASStyleCharacteristics.none));
		TEUtils.assertFalse(ASStyleCharacteristics.hasDim(notBoldNotDimRed));
	});

	it('hasNotDim', () => {
		TEUtils.assertTrue(ASStyleCharacteristics.hasNotDim(notBoldNotDimRed));
		TEUtils.assertFalse(ASStyleCharacteristics.hasNotDim(boldItalic));
		TEUtils.assertFalse(ASStyleCharacteristics.hasNotDim(ASStyleCharacteristics.none));
	});

	describe('toSequence', () => {
		it('none', () => {
			TEUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(ASStyleCharacteristics.none), []);
		});

		it('bold italic', () => {
			TEUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(boldItalic), [1, 3]);
		});

		it('Not bold not dim red', () => {
			TEUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldNotDimRed), [22, 31]);
		});

		it('Bold not dim red', () => {
			TEUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(boldNotDimRed), [22, 1, 31]);
		});

		it('Not bold dim red', () => {
			TEUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldDimRed), [22, 2, 31]);
		});

		it('Bold default background color', () => {
			TEUtils.deepStrictEqual(
				pipe(
					ASStyleCharacteristics.bold,
					ASStyleCharacteristics.mergeOver(ASStyleCharacteristics.bgDefaultColor),
					ASStyleCharacteristics.toSequence
				),
				[1, 49]
			);
		});
	});

	it('mergeUnder', () => {
		TEUtils.strictEqual(
			pipe(
				notBoldDimRed,
				ASStyleCharacteristics.mergeUnder(boldItalic),
				ASStyleCharacteristics.toId
			),
			'NotBoldDimItalicRed'
		);
	});

	it('mergeOver', () => {
		TEUtils.strictEqual(
			pipe(
				notBoldDimRed,
				ASStyleCharacteristics.mergeOver(boldItalic),
				ASStyleCharacteristics.toId
			),
			'BoldDimItalicRed'
		);
	});

	describe('difference', () => {
		it('None with none', () => {
			TEUtils.strictEqual(
				pipe(
					ASStyleCharacteristics.none,
					ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
					ASStyleCharacteristics.toId
				),
				'NoStyle'
			);
		});

		it('Complex case 1', () => {
			TEUtils.strictEqual(
				pipe(
					boldItalicBrightGreenInBlue,
					ASStyleCharacteristics.difference(boldNotDimRed),
					ASStyleCharacteristics.toId
				),
				'ItalicBrightGreenInEightBitBlue'
			);
		});

		it('Complex case 2', () => {
			TEUtils.strictEqual(
				pipe(
					notBoldNotDimRed,
					ASStyleCharacteristics.difference(boldNotDimRed),
					ASStyleCharacteristics.toId
				),
				'NotBold'
			);
		});
	});

	it('substractContext', () => {
		TEUtils.strictEqual(
			pipe(
				ASStyleCharacteristics.bold,
				ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
				ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
				ASStyleCharacteristics.substractContext(ASStyleCharacteristics.bold),
				ASStyleCharacteristics.toId
			),
			'BoldNotDimItalic'
		);
	});
});
