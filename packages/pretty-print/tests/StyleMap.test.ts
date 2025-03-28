/* eslint-disable functional/no-expression-statements */
import { ASContextStyler, ASText } from '@parischap/ansi-styles';
import { PPStyleMap, PPValue } from '@parischap/pretty-print';
import { TEUtils } from '@parischap/test-utils';
import { Equal, Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('StyleMap', () => {
	const none = PPStyleMap.none;
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPStyleMap.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(none, PPStyleMap.make(none));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(none, PPStyleMap.darkMode));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(none.toString(), `None`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(none.pipe(PPStyleMap.id), 'None');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPStyleMap.has(none));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPStyleMap.has(new Date()));
			});
		});
	});

	describe('get', () => {
		it('Existing partname', () => {
			TEUtils.assertTrue(pipe(PPStyleMap.darkMode, PPStyleMap.get('Message'), ASContextStyler.has));
		});

		it('Missing partname', () => {
			TEUtils.strictEqual(
				pipe(
					none,
					PPStyleMap.get('Message'),
					Function.apply(PPValue.fromTopValue(null)),
					Function.apply('foo'),
					ASText.toAnsiString
				),
				'foo'
			);
		});
	});
});
