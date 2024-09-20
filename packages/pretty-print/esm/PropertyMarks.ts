/**
 * A PropertyMarks is an interface that lets you specify the marks to print when printing a
 * property. It is used by the PropertyFormatter module (see PropertyFormatter.ts)
 *
 * This module export one PropertyMarks instance. You can define your own if necessary.
 *
 * @since 0.0.1
 */

/**
 * Interface that lets you specify the marks to print when the key of the property is printed
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/** Mark used to seperate the key and the value */
	readonly keyValueSeparator: string;
	/** Mark to prepend to the key as many times as the depth of the property in the prototypal chain */
	readonly prototypePrefix: string;
	/** Mark to append to the key as many times as the depth of the property in the prototypal chain */
	readonly prototypeSuffix: string;
}

/**
 * Default PropertyMarks
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultInstance: Type = {
	keyValueSeparator: ': ',
	prototypePrefix: '',
	prototypeSuffix: '@'
};
