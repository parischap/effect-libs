/* eslint-disable functional/no-expression-statements */
import { MTypes } from '@parischap/effect-lib';
import { CVPlaceHolder } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVPlaceHolder', () => {
	const threeChars = CVPlaceHolder.fixedLength({ name: 'foo', length: 3 });
	MTypes.areEqualTypes<typeof threeChars, CVPlaceHolder.Type<'foo'>>() satisfies true;

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

	describe('literals', () => {
		const literals = CVPlaceHolder.literals({ name: 'foo', strings: ['foo', 'barbaz'] });

		MTypes.areEqualTypes<typeof literals, CVPlaceHolder.Type<'foo'>>() satisfies true;

		describe('Reading', () => {
			it('Not starting by one of the literals', () => {
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
			it('Not starting by one of the literals', () => {
				TEUtils.assertTrue(pipe('', literals.writer, Either.isLeft));
				TEUtils.assertTrue(pipe('foo1', literals.writer, Either.isLeft));
			});

			it('First option', () => {
				TEUtils.assertRight(literals.writer('foo'), 'foo');
			});

			it('Second option', () => {
				TEUtils.assertRight(literals.writer('barbaz'), 'barbaz');
			});
		});
	});

	describe('digits', () => {
		const digits = CVPlaceHolder.digits({
			name: 'foo'
		});

		MTypes.areEqualTypes<typeof digits, CVPlaceHolder.Type<'foo'>>() satisfies true;

		describe('Reading', () => {
			it('Empty string', () => {
				TEUtils.assertEquals(digits.reader(''), Either.right(Tuple.make('', '')));
			});

			it('Predicate not matched before the end', () => {
				TEUtils.assertEquals(
					digits.reader('001 and 002'),
					Either.right(Tuple.make('001', ' and 002'))
				);
			});

			it('Predicate matched till the end', () => {
				TEUtils.assertEquals(digits.reader('001'), Either.right(Tuple.make('001', '')));
			});
		});

		describe('Writing', () => {
			it('Containing a non-digit', () => {
				TEUtils.assertTrue(pipe('0f0', digits.writer, Either.isLeft));
			});

			it('Empty string', () => {
				TEUtils.assertRight(digits.writer(''), '');
			});

			it('Matching string', () => {
				TEUtils.assertRight(digits.writer('001'), '001');
			});
		});
	});

	describe('noSpace', () => {
		const noSpace = CVPlaceHolder.noSpace({
			name: 'foo'
		});

		MTypes.areEqualTypes<typeof noSpace, CVPlaceHolder.Type<'foo'>>() satisfies true;

		it('Reading', () => {
			TEUtils.assertEquals(
				noSpace.reader('001 and 002'),
				Either.right(Tuple.make('001', ' and 002'))
			);
		});

		describe('Writing', () => {
			it('Not containing a non-digit', () => {
				TEUtils.assertEquals(noSpace.writer('001'), Either.right('001'));
			});

			it('Containing a non-digit', () => {
				TEUtils.assertTrue(pipe('00 1', noSpace.writer, Either.isLeft));
			});
		});
	});

	describe('allBut', () => {
		const allButSlash = CVPlaceHolder.allBut({
			name: 'foo',
			separator: '/'
		});

		MTypes.areEqualTypes<typeof allButSlash, CVPlaceHolder.Type<'foo'>>() satisfies true;

		it('Reading', () => {
			TEUtils.assertEquals(allButSlash.reader('11/12'), Either.right(Tuple.make('11', '/12')));
		});

		describe('Writing', () => {
			it('Not containing a slash', () => {
				TEUtils.assertEquals(allButSlash.writer('001'), Either.right('001'));
			});

			it('Containing a slash', () => {
				TEUtils.assertTrue(pipe('11/12', allButSlash.writer, Either.isLeft));
			});
		});
	});

	describe('final', () => {
		const final = CVPlaceHolder.final({ name: 'foo' });

		MTypes.areEqualTypes<typeof final, CVPlaceHolder.Type<'foo'>>() satisfies true;

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
