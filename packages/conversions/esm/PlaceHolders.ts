/** This module implements an array of PlaceHolder's (see PlaceHolder.ts) */
import * as CVPlaceHolder from './PlaceHolder.js';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends ReadonlyArray<CVPlaceHolder.Type<string, T>> {}
