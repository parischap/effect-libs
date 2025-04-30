/* eslint-disable functional/no-expression-statements */
import { CVPlaceHolder, CVTemplate } from '@parischap/conversions';
import { MInputError, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Either } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
	const template = CVTemplate.make([
		CVPlaceHolder.fixedLength({ name: 'dd', length: 2 }),
		CVPlaceHolder.literal({ name: 'separator1', value: '/' }),
		CVPlaceHolder.fixedLength({ name: 'MM', length: 2 }),
		CVPlaceHolder.literal({ name: 'separator2', value: '/' }),
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
  "_id": "@parischap/conversions/Template/",
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
					MInputError.Type
				>
			>
		>() satisfies true;

		it('Empty text', () => {
			TEUtils.assertLeftMessage(reader(''), "Expected length of 'dd' to be: 2. Actual: 0");
		});

		it('Text too short', () => {
			TEUtils.assertLeftMessage(
				reader('25/12'),
				"Expected 'separator2' to start with '/'. Actual: ''"
			);
		});

		it('Wrong separator', () => {
			TEUtils.assertLeftMessage(
				reader('25|12'),
				"Expected 'separator1' to start with '/'. Actual: '|12'"
			);
		});

		it('Text too long', () => {
			TEUtils.assertLeftMessage(
				reader('25/12/2025 is XMas'),
				"Expected text not consumed by template to be empty. Actual: ' is XMas'"
			);
		});

		it('Matching text', () => {
			TEUtils.assertRight(reader('25/12/2025'), {
				dd: '25',
				separator1: '/',
				MM: '12',
				separator2: '/',
				yyyy: '2025'
			});
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
					Either.Either<string, MInputError.Type>
				>
			>() satisfies true;

			it('With correct values', () => {
				TEUtils.assertRight(
					writer({ dd: '25', separator1: '/', MM: '12', separator2: '/', yyyy: '2025' }),
					'25/12/2025'
				);
			});

			it('With incorrect values', () => {
				TEUtils.assertLeftMessage(
					writer({ dd: '25', separator1: '|', MM: '12', separator2: '|', yyyy: '2025' }),
					"Expected 'separator1' to be: '/'. Actual: '|'"
				);
			});
		});
	});
});
