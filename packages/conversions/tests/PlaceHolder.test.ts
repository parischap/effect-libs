/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVPlaceholder, CVReal } from '@parischap/conversions';
import { MString, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceholder', () => {
	const separator = CVPlaceholder.Separator.make({ pos: 1, value: 'foo' });
	const threeChars = CVPlaceholder.Tag.fixedLength({ name: 'foo', length: 3 });

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPlaceholder.moduleTag);
		});

		describe('isTag', () => {
			it('Not passing', () => {
				TEUtils.assertFalse(CVPlaceholder.isTag(separator));
			});

			it('Passing', () => {
				TEUtils.assertTrue(CVPlaceholder.isTag(threeChars));
			});
		});

		describe('isSeparator', () => {
			it('Not passing', () => {
				TEUtils.assertFalse(CVPlaceholder.isSeparator(threeChars));
			});

			it('Passing', () => {
				TEUtils.assertTrue(CVPlaceholder.isSeparator(separator));
			});
		});
	});

	describe('Separator', () => {
		describe('Tag, prototype and guards', () => {
			it('.pipe()', () => {
				TEUtils.assertTrue(separator.pipe(CVPlaceholder.Separator.has));
			});

			it('.toString()', () => {
				TEUtils.strictEqual(separator.toString(), "'foo' separator at position 1");
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVPlaceholder.Separator.has(separator));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVPlaceholder.Separator.has(new Date()));
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
		MTypes.areEqualTypes<CVPlaceholder.Tag.ExtractName<typeof threeChars>, 'foo'>() satisfies true;
		MTypes.areEqualTypes<CVPlaceholder.Tag.ExtractType<typeof threeChars>, string>() satisfies true;

		describe('Tag, prototype and guards', () => {
			it('.pipe()', () => {
				TEUtils.assertTrue(threeChars.pipe(CVPlaceholder.Tag.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVPlaceholder.Tag.has(threeChars));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVPlaceholder.Tag.has(new Date()));
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
			const placeholder = CVPlaceholder.Tag.paddedFixedLength({
				name: 'foo',
				length: 3,
				fillChar: '0',
				padPosition: MString.PadPosition.Left,
				disallowEmptyString: true
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeholder.toString(),
					"'foo' placeholder: 3-character string left-padded with '0'"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeholder.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeholder.parser('001 and baz'), Tuple.make('1', ' and baz'));
				});
			});

			describe('Formatting', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeholder.formatter('foo and baz'),
						"Expected length of 'foo' placeholder to be: 3. Actual: 11"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeholder.formatter('a'), '00a');
				});
			});
		});

		describe('fixedLengthToReal', () => {
			const placeholder = CVPlaceholder.Tag.fixedLengthToReal({
				name: 'foo',
				length: 3,
				fillChar: '0',
				padPosition: MString.PadPosition.Left,
				disallowEmptyString: true,
				numberBase10Format: CVNumberBase10Format.integer
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeholder.toString(),
					"'foo' placeholder: 3-character string left-padded with '0' to integer"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeholder.parser(''),
						"Expected length of 'foo' placeholder to be: 3. Actual: 0"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(
						placeholder.parser('0015'),
						Tuple.make(CVReal.unsafeFromNumber(1), '5')
					);
				});
			});

			describe('Formatting', () => {
				it('Not passing: too long', () => {
					TEUtils.assertLeftMessage(
						placeholder.formatter(CVReal.unsafeFromNumber(1154)),
						"Expected length of 'foo' placeholder to be: 3. Actual: 4"
					);
				});

				it('Passing', () => {
					TEUtils.assertRight(placeholder.formatter(CVReal.unsafeFromNumber(34)), '034');
				});
			});
		});

		describe('real', () => {
			const placeholder = CVPlaceholder.Tag.real({
				name: 'foo',
				numberBase10Format: CVNumberBase10Format.frenchStyleThreeDecimalNumber
			});
			it('.toString()', () => {
				TEUtils.strictEqual(
					placeholder.toString(),
					"'foo' placeholder: French-style three-decimal number"
				);
			});

			describe('Parsing', () => {
				it('Not passing', () => {
					TEUtils.assertLeftMessage(
						placeholder.parser(''),
						"'foo' placeholder contains '' from the start of which a French-style three-decimal number could not be extracted"
					);
					TEUtils.assertLeft(placeholder.parser('1 014,1254 and foo'));
				});

				it('Passing', () => {
					TEUtils.assertRight(
						placeholder.parser('1 014,125 and foo'),
						Tuple.make(CVReal.unsafeFromNumber(1014.125), ' and foo')
					);
				});
			});

			it('Formatting', () => {
				TEUtils.assertRight(placeholder.formatter(CVReal.unsafeFromNumber(1014.1256)), '1 014,126');
			});
		});

		describe('mappedLiterals', () => {
			const map = CVPlaceholder.Tag.mappedLiterals({
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
			const noSpaceChars = CVPlaceholder.Tag.noSpaceChars('foo');

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
