import * as Effect from "@effect/io/Effect";
import * as S from "@effect/schema/Schema";
import { formatErrors } from "@effect/schema/TreeFormatter";

import { handler } from "./module";

const server = Bun.serve({
  async fetch(req) {
    if (req.url.includes(handler.url)) {
      const rawInput = {
        body: await req.json<unknown>(),
      };

      const result = Effect.gen(function* (_) {
        const inputParser = S.parse(
          S.struct({
            body: S.struct(handler.schema.body),
          })
        );
        const input = yield* _(inputParser(rawInput));
        const transformed = handler.transform(input);
        return yield* _(handler.handler(transformed));
      });

      return Effect.runSync(
        Effect.match(result, {
          onFailure: (error) =>
            error instanceof Error
              ? new Response(error.message, { status: 500 })
              : new Response(formatErrors(error.errors), { status: 500 }),
          onSuccess: (value) => new Response(value),
        })
      );
    }

    return new Response("Not found", { status: 404 });
  },
  port: 3000,
});

console.log(`Listening on http://localhost:${server.port}...`);
