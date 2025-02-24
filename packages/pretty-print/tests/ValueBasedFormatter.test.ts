/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { PPValue, PPValueBasedFormatter } from '@parischap/pretty-print';
import { describe, expect, it } from 'vitest';

describe('ValueBasedFormatter', () => {
	const palette = ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.blue);

	const symbolicKey: unique symbol = Symbol.for('symbolicKey');
	const context = PPValue.fromNonPrimitiveValueAndKey({
		nonPrimitiveContent: { [symbolicKey]: 3, b: 'foo' },
		key: symbolicKey,
		depth: 2,
		protoDepth: 0
	});

	it('makeDepthIndexed', () => {
		expect(
			ASText.equivalence(
				PPValueBasedFormatter.makeDepthIndexed(palette)(context)('foo'),
				ASStyle.green('foo')
			)
		).toBe(true);
	});

	it('makeTypeIndexed', () => {
		expect(
			ASText.equivalence(
				PPValueBasedFormatter.makeTypeIndexed(palette)(context)('foo'),
				ASStyle.red('foo')
			)
		).toBe(true);
	});

	it('makeKeyTypeIndexed', () => {
		expect(
			ASText.equivalence(
				PPValueBasedFormatter.makeKeyTypeIndexed(palette)(context)('foo'),
				ASStyle.red('foo')
			)
		).toBe(true);
	});
});
