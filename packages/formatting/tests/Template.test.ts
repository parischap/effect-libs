/* eslint-disable functional/no-expression-statements */
import { MTypes } from '@parischap/effect-lib';
import { CVPlaceHolder, CVTemplate } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { Either } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
	const template = CVTemplate.make([
		CVPlaceHolder.fixedLength({ name: 'dd', length: 2 }),
		CVPlaceHolder.literals({ name: 'separator1', strings: ['/'] }),
		CVPlaceHolder.fixedLength({ name: 'MM', length: 2 }),
		CVPlaceHolder.literals({ name: 'separator2', strings: ['/'] }),
		CVPlaceHolder.fixedLength({ name: 'yyyy', length: 4 })
	]);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVTemplate.moduleTag);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(template.pipe(CVTemplate.has));
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				template.toString(),
				`{
  "_id": "@parischap/formatting/Template/",
  "placeHolders": [
    "Placeholder dd",
    "Placeholder separator1",
    "Placeholder MM",
    "Placeholder separator2",
    "Placeholder yyyy"
  ]
}`
			);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVTemplate.has(template));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVTemplate.has(new Date()));
			});
		});
	});

	describe('toReader', () => {
		const reader = CVTemplate.toReader(template);

		MTypes.areEqualTypes<
			typeof reader,
			MTypes.OneArgFunction<
				string,
				Either.Either<
					{
						readonly dd: string;
						readonly separator1: string;
						readonly MM: string;
						readonly separator2: string;
						readonly yyyy: string;
					},
					never
				>
			>
		>() satisfies true;

		it('Empty text', () => {
			TEUtils.assertLeft(reader(''), "Reading placeholder 'dd': expected 2 characters. Actual: 0");
		});

		it('Text too short', () => {
			TEUtils.assertLeft(
				reader('25/12'),
				"Reading placeholder 'separator2': expected '/' at the start of ''"
			);
		});

		it('Text too long', () => {
			TEUtils.assertLeft(
				reader('25/12/2025 is XMas'),
				"' is XMas' was not consumed by template. Consider adding the 'final' placeHolder at the end of your template"
			);
		});

		it('Matching text', () => {
			TEUtils.assertEquals(
				reader('25/12/2025'),
				Either.right({ dd: '25', separator1: '/', MM: '12', separator2: '/', yyyy: '2025' })
			);
		});
	});

	describe('toWriter', () => {
		describe('StrictMode = false', () => {
			const writer = CVTemplate.toWriter(template);

			MTypes.areEqualTypes<
				typeof writer,
				MTypes.OneArgFunction<
					{
						readonly dd: string;
						readonly separator1: string;
						readonly MM: string;
						readonly separator2: string;
						readonly yyyy: string;
					},
					string
				>
			>() satisfies true;

			it('With correct values', () => {
				TEUtils.strictEqual(
					writer({ dd: '25', separator1: '/', MM: '12', separator2: '/', yyyy: '2025' }),
					'25/12/2025'
				);
			});

			it('With incorrect values', () => {
				TEUtils.strictEqual(
					writer({ dd: '25', separator1: '\\', MM: '12', separator2: '\\', yyyy: '2025' }),
					'25\\12\\2025'
				);
			});
		});

		describe('StrictMode = true', () => {
			const writer = CVTemplate.toWriter(template, true);

			MTypes.areEqualTypes<
				typeof writer,
				MTypes.OneArgFunction<
					{
						readonly dd: string;
						readonly separator1: string;
						readonly MM: string;
						readonly separator2: string;
						readonly yyyy: string;
					},
					Either.Either<string, string>
				>
			>() satisfies true;

			it('With correct values', () => {
				TEUtils.assertRight(
					writer({ dd: '25', separator1: '/', MM: '12', separator2: '/', yyyy: '2025' }),
					'25/12/2025'
				);
			});

			it('With incorrect values', () => {
				TEUtils.assertLeft(
					writer({ dd: '25', separator1: '\\', MM: '12', separator2: '\\', yyyy: '2025' }),
					"Writing placeholder 'separator1': expected '/'. Received: '\\'"
				);
			});
		});
	});
});
