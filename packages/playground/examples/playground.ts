import * as HttpApi from '@effect/platform/HttpApi'
import * as HttpApiBuilder from '@effect/platform/HttpApiBuilder'
import * as HttpApiEndpoint from '@effect/platform/HttpApiEndpoint'
import * as HttpApiGroup from '@effect/platform/HttpApiGroup'
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer'
import * as NodeRuntime from '@effect/platform-node/NodeRuntime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'
import { createServer } from 'node:http';

// Define our API with one group named "Greetings" and one endpoint called "hello-world"
const MyApi = HttpApi.make('MyApi').add(
  HttpApiGroup.make('Greetings').add(
    HttpApiEndpoint.get('hello-world')`/`.addSuccess(Schema.String),
  ),
);

// Implement the "Greetings" group
const GreetingsLive = HttpApiBuilder.group(MyApi, 'Greetings', (handlers) =>
  handlers.handle('hello-world', () => Effect.succeed('Hello, World!')),
);

// Provide the implementation for the API
const MyApiLive = HttpApiBuilder.api(MyApi).pipe(Layer.provide(GreetingsLive));

// Set up the server using NodeHttpServer on port 3000
const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(MyApiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);

// Launch the server
Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
