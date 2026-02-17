import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Effect from 'effect/Effect'
import * as FiberId from 'effect/FiberId'
import * as List from 'effect/List'
import * as LogLevel from 'effect/LogLevel'
import * as Logger from 'effect/Logger'
import * as Option from 'effect/Option'
import * as String from 'effect/String'

//const moduleTag = '@parischap/effect-lib/Logger/';

class TitleMessage {
  readonly title: string;

  constructor({ title }: MTypes.Data<TitleMessage>) {
    this.title = title;
  }
}

export const logDebugTitle = (title: string): Effect.Effect<void> =>
  Effect.logDebug(new TitleMessage({ title }));
export const logInfoTitle = (title: string): Effect.Effect<void> =>
  Effect.logInfo(new TitleMessage({ title }));

const colorizeByLogLevel = (logLevel: LogLevel.LogLevel): ((s: string) => string) => {
  switch (logLevel) {
    case LogLevel.Fatal:
    case LogLevel.Error:
      return JsAnsi.red;
    case LogLevel.Warning:
      return JsAnsi.yellow;
    default:
      return JsAnsi.green;
  }
};

const colorizeBySpanLevel = (spanLevel: number): ((s: string) => string) =>
  pipe(
    Array.make(JsAnsi.cyan, JsAnsi.yellow, JsAnsi.magenta),
    Array.get(spanLevel),
    Option.getOrElse(() => JsAnsi.blue),
  );

export const live = ({
  eol,
  startTime,
  stringify,
  tabChar,
}: {
  readonly eol: string;
  readonly startTime: number;
  readonly stringify: (u: unknown) => string;
  readonly tabChar: string;
}) =>
  Logger.replace(
    Logger.defaultLogger,
    Logger.make(({ date, fiberId, logLevel, message, spans }) => {
      try {
        const isString = MTypes.isString(message);
        // Don't show time and threadName if we print an empty message
        if (isString && String.isEmpty(message.trim())) console.log('');
        else {
          const isTitle = message instanceof TitleMessage;

          const spanLevel = List.size(spans);

          const latestSpanCreationTime = pipe(
            spans,
            List.head,
            Option.map((span) => span.startTime),
            Option.getOrElse(() => startTime),
          );

          const strMessage =
            isTitle ? message.title
            : isString ? message
            : stringify(message);

          const isMultiLine = JsString.isMultiLine(strMessage);

          console.log(
            pipe(
              (isMultiLine ? 'Multi-line message' : strMessage)
                + ` (${FiberId.threadName(fiberId)})`,
              isTitle ? colorizeBySpanLevel(spanLevel) : JsAnsi.highContrastBlack,
              MString.prepend(
                colorizeByLogLevel(logLevel)(`${date.getTime() - latestSpanCreationTime}ms `),
              ),
              String.concat(isMultiLine ? eol + JsString.tabify(tabChar)(strMessage) : ''),
              JsString.tabify(tabChar, spanLevel),
            ),
          );
        }
      } catch (e) {
        console.log(
          JsAnsi.red('Logging error' + eol + (MTypes.isErrorish(e) ? e.message : stringify(e))),
        );
      }
    }),
  );
