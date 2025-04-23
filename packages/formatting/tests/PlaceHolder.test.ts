/* eslint-disable functional/no-expression-statements */
import { MFunction, MRegExp, MString } from '@parischap/effect-lib';
import { CVPlaceHolder } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceHolder', () => {
	const threeChars = CVPlaceHolder.fixedLength({ name: 'foo', length: 3 });

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPlaceHolder.moduleTag);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(threeChars.pipe(CVPlaceHolder.has));
		});

		it('.toString()', () => {
			TEUtils.strictEqual(threeChars.toString(), 'Placeholder foo');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVPlaceHolder.has(threeChars));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVPlaceHolder.has(new Date()));
			});
		});
	});

	describe('fixedLength', () => {
		describe('Reading', () => {
			it('Not enough characters left', () => {
				TEUtils.assertTrue(pipe('', threeChars.reader, Either.isLeft));
				TEUtils.assertTrue(pipe('aa', threeChars.reader, Either.isLeft));
			});

			it('Just enough characters left', () => {
				TEUtils.assertEquals(threeChars.reader('foo'), Either.right(Tuple.make('foo', '')));
			});

			it('More characters than necessary', () => {
				TEUtils.assertEquals(
					threeChars.reader('foo and baz'),
					Either.right(Tuple.make('foo', ' and baz'))
				);
			});
		});

		describe('Writing', () => {
			it('Too few characters', () => {
				TEUtils.assertTrue(pipe('', threeChars.reader, Either.isLeft));
				TEUtils.assertTrue(pipe('aa', threeChars.writer, Either.isLeft));
			});

			it('Too many characters', () => {
				TEUtils.assertTrue(pipe('foo and baz', threeChars.writer, Either.isLeft));
			});

			it('Just the expected number of characters', () => {
				TEUtils.assertRight(threeChars.writer('foo'), 'foo');
			});
		});
	});

	describe('leftPadded', () => {
		const leftPadded = CVPlaceHolder.leftPadded({ name: 'foo', length: 3, fillString: '0' });

		describe('Reading', () => {
			it('Not enough characters left', () => {
				TEUtils.assertTrue(pipe('', leftPadded.reader, Either.isLeft));
				TEUtils.assertTrue(pipe('11', leftPadded.reader, Either.isLeft));
			});

			it('Just enough characters left', () => {
				TEUtils.assertEquals(leftPadded.reader('010'), Either.right(Tuple.make('10', '')));
			});

			it('Template longer than size to read - placeholder contains only fillString character', () => {
				TEUtils.assertEquals(
					leftPadded.reader('000and baz'),
					Either.right(Tuple.make('0', 'and baz'))
				);
			});
		});

		describe('Writing', () => {
			it('Too many characters', () => {
				TEUtils.assertTrue(pipe('00aa', leftPadded.writer, Either.isLeft));
			});

			it('Too few characters', () => {
				TEUtils.assertRight(pipe('', leftPadded.writer), '000');
				TEUtils.assertRight(pipe('1', leftPadded.writer), '001');
			});

			it('Just the expected number of characters', () => {
				TEUtils.assertRight(pipe('110', leftPadded.writer), '110');
			});
		});
	});

	describe('rightPadded', () => {
		const rightPadded = CVPlaceHolder.rightPadded({ name: 'foo', length: 3, fillString: '0' });

		describe('Reading', () => {
			it('Not enough characters left', () => {
				TEUtils.assertTrue(pipe('', rightPadded.reader, Either.isLeft));
				TEUtils.assertTrue(pipe('11', rightPadded.reader, Either.isLeft));
			});

			it('Just enough characters left', () => {
				TEUtils.assertEquals(rightPadded.reader('010'), Either.right(Tuple.make('01', '')));
			});

			it('Template longer than size to read - placeholder contains only fillString character', () => {
				TEUtils.assertEquals(
					rightPadded.reader('000and baz'),
					Either.right(Tuple.make('0', 'and baz'))
				);
			});
		});

		describe('Writing', () => {
			it('Too many characters', () => {
				TEUtils.assertTrue(pipe('00aa', rightPadded.writer, Either.isLeft));
			});

			it('Too few characters', () => {
				TEUtils.assertRight(pipe('', rightPadded.writer), '000');
				TEUtils.assertRight(pipe('1', rightPadded.writer), '100');
			});

			it('Just the expected number of characters', () => {
				TEUtils.assertRight(pipe('011', rightPadded.writer), '011');
			});
		});
	});

	describe('literals', () => {
		const literals = CVPlaceHolder.literals({ name: 'foo', strings: ['foo', 'barbaz'] });

		describe('Reading', () => {
			it('Not matching', () => {
				TEUtils.assertTrue(pipe('', literals.reader, Either.isLeft));
				TEUtils.assertTrue(pipe('fo1 and bar', literals.reader, Either.isLeft));
			});

			it('Matching first option', () => {
				TEUtils.assertEquals(
					literals.reader('foo and bar'),
					Either.right(Tuple.make('foo', ' and bar'))
				);
			});

			it('Matching second option', () => {
				TEUtils.assertEquals(
					literals.reader('barbaz and foo'),
					Either.right(Tuple.make('barbaz', ' and foo'))
				);
			});
		});

		describe('Writing', () => {
			it('Not matching', () => {
				TEUtils.assertTrue(pipe('', literals.writer, Either.isLeft));
				TEUtils.assertTrue(pipe('foo1', literals.writer, Either.isLeft));
			});

			it('First option', () => {
				TEUtils.assertRight(pipe('foo', literals.writer), 'foo');
			});

			it('Second option', () => {
				TEUtils.assertRight(pipe('barbaz', literals.writer), 'barbaz');
			});
		});
	});

	describe('takeWhile', () => {
		const takeWhileDigit = CVPlaceHolder.takeWhile({
			name: 'foo',
			predicate: MString.fulfillsRegExp(MRegExp.digit)
		});

		describe('Reading', () => {
			it('Empty string', () => {
				TEUtils.assertEquals(takeWhileDigit.reader(''), Either.right(Tuple.make('', '')));
			});

			it('Predicate not matched before the end', () => {
				TEUtils.assertEquals(
					takeWhileDigit.reader('001 and 002'),
					Either.right(Tuple.make('001', ' and 002'))
				);
			});

			it('Predicate matched till the end', () => {
				TEUtils.assertEquals(takeWhileDigit.reader('001'), Either.right(Tuple.make('001', '')));
			});
		});

		describe('Writing', () => {
			it('Containing a non-digit', () => {
				TEUtils.assertTrue(pipe('0f0', takeWhileDigit.writer, Either.isLeft));
			});

			it('Empty string', () => {
				TEUtils.assertRight(pipe('', takeWhileDigit.writer), '');
			});

			it('Matching string', () => {
				TEUtils.assertRight(pipe('001', takeWhileDigit.writer), '001');
			});
		});
	});

	describe('takeWhileNot', () => {
		const takeWhileNotSpace = CVPlaceHolder.takeWhileNot({
			name: 'foo',
			predicate: MFunction.strictEquals(' ')
		});

		it('Reading', () => {
			TEUtils.assertEquals(
				takeWhileNotSpace.reader('001 and 002'),
				Either.right(Tuple.make('001', ' and 002'))
			);
		});

		describe('Writing', () => {
			it('Passing', () => {
				TEUtils.assertEquals(takeWhileNotSpace.writer('001'), Either.right('001'));
			});

			it('Not passing', () => {
				TEUtils.assertTrue(pipe('00 1', takeWhileNotSpace.writer, Either.isLeft));
			});
		});
	});

	describe('final', () => {
		const final = CVPlaceHolder.final({ name: 'foo' });
		it('Reading', () => {
			TEUtils.assertEquals(
				final.reader('001 and 002'),
				Either.right(Tuple.make('001 and 002', ''))
			);
		});

		it('Writing', () => {
			TEUtils.assertRight(final.writer('001 and 002'), '001 and 002');
		});
	});
});
