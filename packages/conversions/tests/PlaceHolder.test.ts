/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVPlaceHolder, CVReal } from '@parischap/conversions';
import { MString, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceHolder', () => {
	const separator = CVPlaceHolder.Separator.make({ pos: 1, value: 'foo' });
	const threeChars = CVPlaceHolder.Tag.fixedLength({ name: 'foo', length: 3 });

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPlaceHolder.moduleTag);
		});

		describe('isTag', () => {
			it('Not passing', () => {
				TEUtils.assertFalse(CVPlaceHolder.isTag(separator));
			});

			it('Passing', () => {
				TEUtils.assertTrue(CVPlaceHolder.isTag(threeChars));
			});
		});

		describe('isSeparator', () => {
			it('Not passing', () => {
				TEUtils.assertFalse(CVPlaceHolder.isSeparator(threeChars));
			});

			it('Passing', () => {
				TEUtils.assertTrue(CVPlaceHolder.isSeparator(separator));
			});
		});
	});

	describe('Separator', () => {
		describe('Tag, prototype and guards', () => {
			it('.pipe()', () => {
				TEUtils.assertTrue(separator.pipe(CVPlaceHolder.Separator.has));
			});

			it('.toString()', () => {
				TEUtils.strictEqual(separator.toString(), "'foo' separator at position 1");
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVPlaceHolder.Separator.has(separator));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVPlaceHolder.Separator.has(new Date()));
				});
			});
		});

		describe('Parsing', () => {
			it('Not starting by value', () => {
				TEUtils.assertLeftMessage(
					separator.parser(''),
					"Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''"
				);
				TEUtils.assertLeft(separator.parser('fo1 and bar'));
			});

			it('Passing', () => {
				TEUtils.assertRight(separator.parser('foo and bar'), Tuple.make('foo', ' and bar'));
			});
		});

		it('Formatting', () => {
			TEUtils.strictEqual(separator.formatter(), 'foo');
		});
	});

	describe('Tag', () => {
		MTypes.areEqualTypes<CVPlaceHolder.Tag.ExtractName<typeof threeChars>, 'foo'>() satisfies true;
		MTypes.areEqualTypes<CVPlaceHolder.Tag.ExtractType<typeof threeChars>, string>() satisfies true;

		describe('Tag, prototype and guards', () => {
			it('.pipe()', () => {
				TEUtils.assertTrue(threeChars.pipe(CVPlaceHolder.Tag.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVPlaceHolder.Tag.has(threeChars));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVPlaceHolder.Tag.has(new Date()));
				});
			});
		});

		describe('fixedLength', () => {
			it('.toString()', () => {
				TEUtils.strictEqual(threeChars.toString(), "'foo' placeholder: 3-character string");
			});

			describe('Parsing', () => {
				it('Not enough characters left', () => {
					TEUtils.assertLeftMessage(
						threeChars.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
					TEUtils.assertLeft(threeChars.parser('aa'));
				});

				it('Just enough characters left', () => {
					TEUtils.assertRight(threeChars.parser('foo'), Tuple.make('foo', ''));
				});

				it('More characters than necessary', () => {
					TEUtils.assertRight(threeChars.parser('foo and baz'), Tuple.make('foo', ' and baz'));
				});
			});

			describe('Formatting', () => {
				it('Too few characters', () => {
					TEUtils.assertLeftMessage(
						threeChars.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
					TEUtils.assertLeft(threeChars.formatter('aa'));
				});

				it('Too many characters', () => {
					TEUtils.assertLeft(threeChars.formatter('foo and baz'));
				});

				it('Just the expected number of characters', () => {
					TEUtils.assertRight(threeChars.formatter('foo'), 'foo');
				});
			});
		});

		describe('paddedFixedLength', () => {
			const placeHolder = CVPlaceHolder.Tag.paddedFixedLength({
				name: 'foo',
				length: 3,
				fillChar: '0',
				padPosition: MString.PadPosition.Left,
				disallowEmptyString: true
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeHolder.toString(),
					"'foo' placeholder: 3-character string left-padded with '0'"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeHolder.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeHolder.parser('001 and baz'), Tuple.make('1', ' and baz'));
				});
			});

			describe('Formatting', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeHolder.formatter('foo and baz'),
						"Expected length of 'foo' placeholder to be: 3. Actual: 11"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeHolder.formatter('a'), '00a');
				});
			});
		});

		describe('fixedLengthToReal', () => {
			const placeHolder = CVPlaceHolder.Tag.fixedLengthToReal({
				name: 'foo',
				length: 3,
				fillChar: '0',
				padPosition: MString.PadPosition.Left,
				disallowEmptyString: true,
				numberBase10Format: CVNumberBase10Format.integer
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeHolder.toString(),
					"'foo' placeholder: 3-character string left-padded with '0' to integer"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeHolder.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(
						placeHolder.parser('0015'),
						Tuple.make(CVReal.unsafeFromNumber(1), '5')
					);
				});
			});

			describe('Formatting', () => {
				it('Not passing: too long', () => {
					TEUtils.assertLeftMessage(
						placeHolder.formatter(CVReal.unsafeFromNumber(1154)),
						"Expected length of 'foo' placeholder to be: 3. Actual: 4"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeHolder.formatter(CVReal.unsafeFromNumber(34)), '034');
				});
			});
		});

		describe('real', () => {
			const placeHolder = CVPlaceHolder.Tag.real({
				name: 'foo',
				numberBase10Format: CVNumberBase10Format.frenchStyleThreeDecimalNumber
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeHolder.toString(),
					"'foo' placeholder: French-style three-decimal number"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeHolder.parser(''),
						"'foo' placeholder contains '' from the start of which a French-style three-decimal number could not be extracted"
					);
					TEUtils.assertLeft(placeHolder.parser('1 014,1254 and foo'));
				});

				it('Passing', () => {
					TEUtils.assertRight(
						placeHolder.parser('1 014,125 and foo'),
						Tuple.make(CVReal.unsafeFromNumber(1014.125), ' and foo')
					);
				});
			});

			it('Formatting', () => {
				TEUtils.assertRight(placeHolder.formatter(CVReal.unsafeFromNumber(1014.1256)), '1 014,126');
			});
		});

		describe('mappedLiterals', () => {
			const map = CVPlaceHolder.Tag.mappedLiterals({
				name: 'foo',
				keyValuePairs: [
					['foo', 6],
					['bazbar', 12]
				]
			});

			it('.toString()', () => {
				TEUtils.strictEqual(map.toString(), "'foo' placeholder: from [foo, bazbar] to [6, 12]");
			});

			describe('Parsing', () => {
				it('Not starting by value', () => {
					TEUtils.assertLeftMessage(
						map.parser(''),
						"Expected remaining text for 'foo' placeholder to start with one of [foo, bazbar]. Actual: ''"
					);
					TEUtils.assertLeft(map.parser('baz is away'));
				});

				it('Passing', () => {
					TEUtils.assertRight(map.parser('bazbar is away'), Tuple.make(12, ' is away'));
				});
			});

			describe('Formatting', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						map.formatter(4),
						"'foo' placeholder: expected one of [6, 12]. Actual: 4"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(map.formatter(6), 'foo');
				});
			});
		});

		describe('noSpaceChars', () => {
			const noSpaceChars = CVPlaceHolder.Tag.noSpaceChars('foo');

			it('.toString()', () => {
				TEUtils.strictEqual(
					noSpaceChars.toString(),
					"'foo' placeholder: a non-empty string containing non-space characters"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						noSpaceChars.parser(''),
						"Expected 'foo' placeholder to be a non-empty string containing non-space characters. Actual: ''"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(noSpaceChars.parser('foo and bar'), Tuple.make('foo', ' and bar'));
					TEUtils.assertRight(noSpaceChars.parser('foo'), Tuple.make('foo', ''));
				});
			});

			describe('Formatting', () => {
				it('Not passing', () => {
					TEUtils.assertLeft(noSpaceChars.formatter(''));
					TEUtils.assertLeftMessage(
						noSpaceChars.formatter('fo o'),
						"'foo' placeholder: expected a non-empty string containing non-space characters. Actual: 'fo o'"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(noSpaceChars.formatter('foo'), 'foo');
				});
			});
		});
	});
});
