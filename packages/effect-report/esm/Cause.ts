import * as JsAnsi from '@parischap/ansi-styles/JsAnsi'
import * as MArray from '@parischap/effect-lib/MArray'
import * as MFs from '@parischap/effect-lib/MFs'
import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Cause from 'effect/Cause'
import * as FiberId from 'effect/FiberId'
import * as Function from 'effect/Function'
import * as String from 'effect/String'
import * as RErrors from "./Errors.js";
import { formatError } from "./utils.js";

export const toString =
  ({
    eol,
    pathSep,
    stringify,
    tabChar,
    thisProgramPath,
  }: {
    readonly eol: string;
    readonly pathSep: string;
    readonly stringify: (u: unknown) => string;
    readonly tabChar: string;
    readonly thisProgramPath: MFs.Folderpath;
  }) =>
  (self: Cause.Cause<unknown>): string => {
    const formatUnknownError = (title: string) => (error: unknown) =>
      Array.of(
        error instanceof RErrors.WithOriginalCause
          ? pipe(
              error.originalCause,
              toString({ eol, pathSep, stringify, tabChar, thisProgramPath }),
            ) +
              eol +
              JsAnsi.yellow(`Rethrown in:${error.message}`)
          : JsAnsi.red(title) +
              eol +
              JsString.tabify(tabChar)(
                MTypes.isErrorish(error)
                  ? formatError(error, {
                      eol,
                      pathSep,
                      stringify,
                      tabChar,
                    })
                  : stringify(error),
              ),
      );
    return pipe(
      Cause.match(self, {
        onEmpty: Array.of(""),
        onFail: formatUnknownError("SCRIPT ERRORED WITH:"),
        onDie: formatUnknownError("SCRIPT DIED WITH FOLLOWING DEFECT:"),
        onInterrupt: (fiberId) =>
          Array.of(JsAnsi.red(`FIBER ${FiberId.threadName(fiberId)} WAS INTERRUPTED`)),
        onSequential: (left, right) => Array.appendAll(left, right),
        onParallel: (left, right) => Array.appendAll(left, right),
      }),
      Array.filter(String.isNonEmpty),
      MArray.match012({
        onEmpty: () => "",
        onSingleton: Function.identity,
        onOverTwo: flow(
          Array.map(flow(MString.prepend("- "), JsString.tabify(tabChar))),
          Array.join(eol),
        ),
      }),
    );
  };
