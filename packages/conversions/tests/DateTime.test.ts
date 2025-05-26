/* eslint-disable functional/no-expression-statements */
import { CVDateTime } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTime.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(
					CVDateTime.unsafeFromTimestamp(0),
					CVDateTime.unsafeFromTimestamp(0, 1)
				);
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(
					utilInspectLike,
					PPMarkMap.make({ ...utilInspectLike, id: 'Dummy' })
				);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(utilInspectLike.pipe(PPMarkMap.id), 'UtilInspectLike');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPMarkMap.has(utilInspectLike));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPMarkMap.has(new Date()));
			});
		});
	});
});
