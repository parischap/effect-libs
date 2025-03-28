/* eslint-disable functional/no-expression-statements */
import { ASAnsiString, ASColor, ASStyleCharacteristics, ASText } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { Array, Equal, flow, pipe } from 'effect';
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
		ASColor.threeBitRed,
		ASStyleCharacteristics.fromColorAsForegroundColor,
		ASText.fromStyleAndElems
	);
	const pink = pipe(
		ASColor.rgbPink,
		ASStyleCharacteristics.fromColorAsForegroundColor,
		ASText.fromStyleAndElems
	);

	const boldRed = flow(bold, red);
	const boldRedFoo = pipe('foo', boldRed);
	const foo = ASText.fromString('foo');
	const bar = ASText.fromString('bar');
	const baz = ASText.fromString('baz');

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), ASText.moduleTag);
		});

		describe('haveSameText', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASText.haveSameText(boldRedFoo, ASText.fromString('foo')));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASText.haveSameText(boldRedFoo, boldRed('bar')));
			});
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(boldRedFoo, pipe('foo', red, bold));
				TEUtils.assertEquals(boldRed(''), none(''));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(Equal.equals(boldRedFoo, pipe('foo', bold)));
			});
		});

		describe('.toString()', () => {
			it('Empty', () => {
				TEUtils.strictEqual(ASText.empty.toString(), '');
			});

			it('Simple string with no style', () => {
				TEUtils.strictEqual(none('foo').toString(), 'foo');
			});

			it('Bold red string', () => {
				TEUtils.strictEqual(boldRedFoo.toString(), `\x1b[1;31mfoo${ASAnsiString.reset}`);
			});
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(boldRedFoo.pipe(ASText.toLength), 3);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASText.has(boldRedFoo));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASText.has(new Date()));
			});
		});
	});

	it('length', () => {
		TEUtils.strictEqual(ASText.toLength(dim(pink('foo'), red('bar'))), 6);
	});

	it('concat', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(ASText.concat(foo, bar, boldRedFoo)), 'foobarfoo');
	});

	describe('empty, isEmpty', () => {
		it('Matching', () => {
			TEUtils.assertTrue(ASText.isEmpty(ASText.empty));
		});
		it('Non matching', () => {
			TEUtils.assertFalse(ASText.isEmpty(boldRedFoo));
		});
	});

	it('fromStyleAndElems', () => {
		const weird = bold('foo', 'bar', italic('foo'), italic('bar'), '', 'baz');
		TEUtils.strictEqual(pipe(weird, ASText.uniStyledTexts, Array.length), 3);
		TEUtils.assertEquals(weird, bold('foobar', italic('foobar'), 'baz'));
	});

	it('toAnsiString', () => {
		const text = notUnderlined(
			'foo ',
			boldRed(
				'goes ',
				italic('to '),
				pink('the ', notBold('beach ')),
				dim('to swim '),
				underlined('with bar')
			)
		);

		TEUtils.strictEqual(
			ASText.toAnsiString(text),
			'foo \x1b[1;31mgoes \x1b[3mto \x1b[23;38;2;255;192;203mthe \x1b[22mbeach \x1b[1;2;31mto swim \x1b[22;1;4mwith bar\x1b[0m'
		);
	});

	it('toUnstyledString', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(dim(pink('foo'), red('bar'))), 'foobar');
	});

	it('append', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(foo.pipe(ASText.append(bar))), 'foobar');
	});

	it('prepend', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(bar.pipe(ASText.prepend(foo))), 'foobar');
	});

	it('surround', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(bar.pipe(ASText.surround(foo, foo))), 'foobarfoo');
	});

	it('join', () => {
		TEUtils.strictEqual(
			pipe(Array.make(foo, bar, foo), ASText.join(baz), ASText.toUnstyledString),
			'foobazbarbazfoo'
		);
	});

	it('repeat', () => {
		TEUtils.strictEqual(ASText.toUnstyledString(bar.pipe(ASText.repeat(3))), 'barbarbar');
	});
});
