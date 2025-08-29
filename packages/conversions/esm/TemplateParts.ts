/** This module implements an array of TemplatePart's (see TemplatePart.ts) */
import * as CVTemplatePart from './TemplatePart.js';

/**
 * Type of a TemplateParts
 *
 * @category Models
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends ReadonlyArray<CVTemplatePart.Type<string, T>> {}
