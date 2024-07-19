import { MTypes } from '@parischap/effect-lib';
import { Number } from 'effect';

/**
 * An alignment
 * @category models
 */
export abstract class Type {
	protected constructor() {}
}

class None extends Type {
	constructor() {
		super();
	}
}
export { type None };
/**
 * @category constructors
 */
export const makeNone = () => new None();

/**
 * Parameters of a fixed-length alignment
 * @category models
 */
export abstract class FixedLength extends Type {
	/**
	 * The length of the string representing the value. Available space will be padded to the right or to the left. Taken as 0 if negative. The string representing the value will not be truncated if it is longer than this length
	 */
	readonly length: number;
	/**
	 * The padding character
	 * Default: '0' for numbers, ' ' for strings
	 */
	readonly padChar: string;

	protected constructor({ length, padChar }: MTypes.Data<FixedLength>) {
		super();
		this.length = Number.max(0, length);
		this.padChar = padChar;
	}
}

class Left extends FixedLength {
	constructor({ length, padChar }: MTypes.Data<Left>) {
		super({ length, padChar });
	}
}
export { type Left };
/**
 * @category constructors
 */
export const makeLeft = (params: MTypes.Data<Left>): Left => new Left(params);

class Right extends FixedLength {
	constructor({ length, padChar }: MTypes.Data<Right>) {
		super({ length, padChar });
	}
}
export { type Right };
/**
 * @category constructors
 */
export const makeRight = (params: MTypes.Data<Right>): Right => new Right(params);
