/* eslint-disable functional/no-expression-statements */
import { CVDateTimeTemplate } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVDateTimeTemplate', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVDateTimeTemplate.moduleTag
			);
		});

		/*it('.toString()', () => {
			TEUtils.strictEqual(origin.toString(), `1970-01-01 00:00:00:000 GMT+0000`);
			TEUtils.strictEqual(
				CVDateTime.unsafeFromTimestamp(1_749_823_231_774, -3.75).toString(),
				'2025-06-13 10:15:31:774 GMT-0345'
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(now.pipe(CVDateTime.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVDateTime.has(now));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVDateTime.has(new Date()));
			});
		});*/
	});

	it('make', () => {
		const a = CVDateTimeTemplate.make('fr-FR');
	});
});
