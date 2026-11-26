import { NodeFileSystem } from '@effect/platform-node';
import {
  Array,
  Context,
  Effect,
  type Exit,
  Layer,
  Logger,
  type LogLevel,
  Option,
  Predicate,
  Queue,
  References,
  Tracer,
  pipe,
} from 'effect';

import * as Constants from './Constants.js';
import * as ProgConfig from './ProgConfig.js';

/**
 * Message sent by the `Tracer` to the fiber in charge of logging
 *
 * @category Models
 */
interface Entry {
  /** Level at which the message must be logged */
  readonly level: LogLevel.Severity;
  /** Message to log */
  readonly message: string;
  /** Annotations to attach to the log line */
  readonly annotations: Record<string, unknown>;
}

type Offer = (entry: Entry) => void;

type LoggingMode = 'ConsoleLogging' | 'TxtLogging' | 'JsonLogging';

const severities: Record<string, LogLevel.Severity> = {
  FATAL: 'Fatal',
  ERROR: 'Error',
  WARN: 'Warn',
  INFO: 'Info',
  DEBUG: 'Debug',
  TRACE: 'Trace',
};

/**
 * Converts the level name stored by `Logger.tracerLogger` in the events of a span (e.g. `DEBUG`) to
 * a `LogLevel.Severity` (defaults to `Info`)
 *
 * @category Constructors
 */
const toSeverity = (name: unknown): LogLevel.Severity =>
  Predicate.isString(name)
    ? pipe(
        Option.fromNullishOr(severities[name]),
        Option.getOrElse((): LogLevel.Severity => 'Info'),
      )
    : 'Info';

/**
 * `Tracer.NativeSpan` that sends a message when it starts and, when it ends, the events it has
 * recorded (i.e. the messages logged while it was active) followed by an end message
 *
 * @category Models
 */
class LoggedSpan extends Tracer.NativeSpan {
  /** Sends an `Entry` to the fiber in charge of logging */
  readonly #offer: Offer;

  constructor({
    options,
    offer,
  }: {
    readonly options: ConstructorParameters<typeof Tracer.NativeSpan>[0];
    readonly offer: Offer;
  }) {
    super(options);
    this.#offer = offer;
    if (options.sampled)
      offer({ level: 'Debug', message: `${options.name}/Start`, annotations: {} });
  }

  override end(endTime: bigint, exit: Exit.Exit<unknown, unknown>): void {
    if (this.status._tag === 'Ended') return;
    super.end(endTime, exit);
    if (this.sampled) {
      Array.forEach(this.events, ([message, , attributes]) =>
        this.#offer({
          level: toSeverity(attributes['effect.logLevel']),
          message,
          annotations: attributes,
        }),
      );
      this.#offer({ level: 'Debug', message: `${this.name}/End`, annotations: {} });
    }
  }
}

/**
 * Builds a `Tracer` that creates `LoggedSpan`'s
 *
 * @category Constructors
 */
const makeTracer = (offer: Offer): Tracer.Tracer =>
  Tracer.make({ span: (options) => new LoggedSpan({ options, offer }) });

/**
 * Builds the `Logger` that the fiber in charge of logging uses, depending on `loggingMode`
 *
 * @category Constructors
 */
const makeLogger = (loggingMode: LoggingMode) =>
  loggingMode === 'ConsoleLogging'
    ? Effect.succeed(Logger.defaultLogger)
    : Effect.gen(function* () {
        const { txtLogFilePath, jsonLogFilePath } = yield* Constants.Service;
        return yield* loggingMode === 'TxtLogging'
          ? pipe(Logger.formatSimple, Logger.toFile(txtLogFilePath))
          : pipe(Logger.formatJson, Logger.toFile(jsonLogFilePath));
      });

/**
 * Builds the `Layer` that replaces the default `Tracer` by one that sends messages to a queue. It
 * also forks a child `Fiber` that logs them. That `Fiber` is interrupted when the program ends.
 * Then, it logs the messages it has not had time to log
 *
 * @category Constructors
 */
const traceQueueingLayer = (loggingMode: LoggingMode) =>
  Layer.effect(
    Tracer.Tracer,
    Effect.gen(function* () {
      const queue = yield* Queue.unbounded<Entry>();
      // logger is flushed when traceQueueingLayer is disposed of
      const logger = yield* makeLogger(loggingMode);

      const log = ({ level, message, annotations }: Entry) =>
        pipe(message, Effect.logWithLevel(level), Effect.annotateLogs(annotations));

      yield* pipe(
        Queue.take(queue),
        Effect.flatMap(log),
        Effect.forever,
        // When the `Fiber` is interrupted, log the messages it has not had time to log
        Effect.ensuring(
          pipe(queue, Queue.clear, Effect.flatMap(Effect.forEach(log, { discard: true }))),
        ),
        Effect.provide(Logger.layer([logger])),
        Effect.provideService(References.MinimumLogLevel, 'All'),
        Effect.provideService(References.TracerEnabled, false),
        Effect.forkChild(),
      );

      // A `Tracer` is synchronous: it cannot use the `Effect`-based `Queue.offer`
      return makeTracer((entry) => Queue.offerUnsafe(queue, entry));
    }),
  );

/**
 * Layer that sets up logging and tracing depending on `ProgConfig` parameters
 *
 * @category Layers
 */
export const layer = Layer.unwrap(
  Effect.gen(function* () {
    const { loggingMode } = yield* ProgConfig.Service;

    if (loggingMode === 'None')
      return Layer.mergeAll(
        Layer.succeedContext(
          pipe(
            Context.make(References.MinimumLogLevel, 'None'),
            Context.add(Tracer.MinimumTraceLevel, 'None'),
            Context.add(References.TracerEnabled, false),
          ),
        ),
        Logger.layer([]),
      );

    const { minLogLevel } = yield* ProgConfig.Service;

    const base = Layer.mergeAll(
      Layer.succeedContext(
        pipe(
          Context.make(References.MinimumLogLevel, minLogLevel),
          Context.add(Tracer.MinimumTraceLevel, minLogLevel),
          Context.add(References.CurrentLogLevel, 'Debug'),
          Context.add(Tracer.CurrentTraceLevel, 'Debug'),
          Context.add(References.TracerEnabled, true),
        ),
      ),
      Logger.layer([Logger.tracerLogger]),
    );

    return loggingMode === 'DefaultTracing'
      ? base
      : Layer.mergeAll(base, traceQueueingLayer(loggingMode));
  }),
);

/**
 * Runnable layer
 *
 * @category Layers
 */
export const live = Layer.provide(layer, [NodeFileSystem.layer, Constants.Service.live]);
