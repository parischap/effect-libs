/** This module implements an array of Placeholder's (see Placeholder.ts) */
import * as CVPlaceholder from './Placeholder.js';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends ReadonlyArray<CVPlaceholder.Type<string, T>> {}
