import { Effect } from 'effect';
import { SqlClient } from 'effect/sql';

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE INDEX users_email ON users (email)`;
});
