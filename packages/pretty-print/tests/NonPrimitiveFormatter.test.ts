/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import {
	PPMarkShowerConstructor,
	PPNonPrimitiveFormatter,
	PPOption,
	PPStringifiedValue,
	PPValue,
	PPValueBasedStylerConstructor
} from '@parischap/pretty-print';
import { Array, Equal, Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('NonPrimitiveFormatter', () => {
	const singleLine = PPNonPrimitiveFormatter.singleLine;
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const nonPrimitiveOption = PPOption.NonPrimitive.maps('Foo');
	const constructors = {
		valueBasedStylerConstructor,
		markShowerConstructor
	};
	const valueAndHeader = {
		value: PPValue.fromTopValue({ a: 1, b: 21 }),
		header: ASText.fromString('Foo(2) ')
	};
	const children = Array.make(
		pipe('a : 1', ASText.fromString, PPStringifiedValue.fromText),
		pipe('b : 21', ASText.fromString, PPStringifiedValue.fromText)
	);
	const singleLineResult = pipe(
		ASStyle.none(
			'Foo(2) ',
			ASStyle.red('{ '),
			'a : 1',
			ASStyle.white(', '),
			'b : 21',
			ASStyle.red(' }')
		),
		PPStringifiedValue.fromText,
		PPStringifiedValue.toAnsiString()
	);

	const tabifyResult = pipe(
		Array.make(
			ASStyle.none('Foo(2) ', ASStyle.red('{')),
			ASStyle.none(ASStyle.green('  '), 'a : 1', ASStyle.white(',')),
			ASStyle.none(ASStyle.green('  '), 'b : 21'),
			ASStyle.red('}')
		),
		PPStringifiedValue.toAnsiString()
	);

	const treeifyResult = pipe(
		Array.make(
			ASStyle.none(ASStyle.green('├─ '), 'a : 1'),
			ASStyle.none(ASStyle.green('└─ '), 'b : 21')
		),
		PPStringifiedValue.toAnsiString()
	);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.strictEqual(
				PPNonPrimitiveFormatter.moduleTag,
				TEUtils.moduleTagFromTestFilePath(__filename)
			);
		});

		describe('Equal.equals', () => {
			const dummy = PPNonPrimitiveFormatter.make({
				id: 'SingleLine',
				action: () => () => () => PPStringifiedValue.empty
			});
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(singleLine, dummy));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(singleLine, PPNonPrimitiveFormatter.tabify));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(singleLine.toString(), `SingleLine`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(singleLine.pipe(PPNonPrimitiveFormatter.id), 'SingleLine');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPNonPrimitiveFormatter.has(singleLine));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPNonPrimitiveFormatter.has(new Date()));
			});
		});
	});

	describe('singleLine', () => {
		it('With strictly more than 0 children', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					singleLine.call(nonPrimitiveOption, constructors),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				singleLineResult
			);
		});

		it('With 0 children', () => {
			TEUtils.deepStrictEqual(
				pipe(
					valueAndHeader,
					singleLine.call(nonPrimitiveOption, constructors),
					Function.apply(Array.empty()),
					PPStringifiedValue.toUnstyledStrings
				),
				['Foo(2) {}']
			);
		});
	});

	describe('tabify', () => {
		it('With strictly more than 0 children', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.tabify.call(nonPrimitiveOption, constructors),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				tabifyResult
			);
		});

		it('With 0 children', () => {
			TEUtils.deepStrictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.tabify.call(nonPrimitiveOption, constructors),
					Function.apply(Array.empty()),
					PPStringifiedValue.toUnstyledStrings
				),
				['Foo(2) {', '}']
			);
		});
	});

	describe('treeify', () => {
		it('With strictly more than 0 children', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.treeify.call(nonPrimitiveOption, constructors),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				treeifyResult
			);
		});
		it('With 0 children', () => {
			TEUtils.assertTrue(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.treeify.call(nonPrimitiveOption, constructors),
					Function.apply(Array.empty()),
					PPStringifiedValue.isEmpty
				)
			);
		});
	});

	describe('splitOnConstituentNumberMaker', () => {
		it('Under limit', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.splitOnConstituentNumberMaker(2).call(
						nonPrimitiveOption,
						constructors
					),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				singleLineResult
			);
		});

		it('Above limit', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.splitOnConstituentNumberMaker(1).call(
						nonPrimitiveOption,
						constructors
					),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				tabifyResult
			);
		});
	});

	describe('splitOnTotalLengthMaker', () => {
		describe('With strictly more than 0 children', () => {
			it('Under limit', () => {
				TEUtils.strictEqual(
					pipe(
						valueAndHeader,
						PPNonPrimitiveFormatter.splitOnTotalLengthMaker(24).call(
							nonPrimitiveOption,
							constructors
						),
						Function.apply(children),
						PPStringifiedValue.toAnsiString()
					),
					singleLineResult
				);
			});

			it('Above limit', () => {
				TEUtils.strictEqual(
					pipe(
						valueAndHeader,
						PPNonPrimitiveFormatter.splitOnTotalLengthMaker(23).call(
							nonPrimitiveOption,
							constructors
						),
						Function.apply(children),
						PPStringifiedValue.toAnsiString()
					),
					tabifyResult
				);
			});
		});

		describe('With 0 children', () => {
			it('Under limit', () => {
				TEUtils.deepStrictEqual(
					pipe(
						valueAndHeader,
						PPNonPrimitiveFormatter.splitOnTotalLengthMaker(9).call(
							nonPrimitiveOption,
							constructors
						),
						Function.apply(Array.empty()),
						PPStringifiedValue.toUnstyledStrings
					),
					['Foo(2) {}']
				);
			});

			it('Above limit', () => {
				TEUtils.deepStrictEqual(
					pipe(
						valueAndHeader,
						PPNonPrimitiveFormatter.splitOnTotalLengthMaker(8).call(
							nonPrimitiveOption,
							constructors
						),
						Function.apply(Array.empty()),
						PPStringifiedValue.toUnstyledStrings
					),
					['Foo(2) {', '}']
				);
			});
		});
	});

	describe('splitOnLongestPropLengthMaker', () => {
		it('Under limit', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.splitOnLongestPropLengthMaker(6).call(
						nonPrimitiveOption,
						constructors
					),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				singleLineResult
			);
		});

		it('Above limit', () => {
			TEUtils.strictEqual(
				pipe(
					valueAndHeader,
					PPNonPrimitiveFormatter.splitOnLongestPropLengthMaker(5).call(
						nonPrimitiveOption,
						constructors
					),
					Function.apply(children),
					PPStringifiedValue.toAnsiString()
				),
				tabifyResult
			);
		});
	});
});
