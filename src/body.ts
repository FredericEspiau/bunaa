import { pipe } from "@effect/data/Function";
import * as Match from "@effect/match";
import querystring from "node:querystring";

import type { HandlerPost } from "./module.ts";

type Input = {
  handler: HandlerPost;
  req: Request;
};

type Output = Promise<unknown>;

type Fn = (input: Input) => Output;

export const getBody: Fn = async ({ handler, req }) =>
  await pipe(
    Match.value({ type: handler.type }),
    Match.when(
      { type: "application/json" },
      async () => await req.json<unknown>(),
    ),
    Match.when(
      { type: "application/octet-stream" },
      async () => await req.arrayBuffer(),
    ),
    Match.when({ type: "application/x-www-form-urlencoded" }, async () =>
      querystring.parse(await req.text()),
    ),
    Match.when(
      { type: "multipart/form-data" },
      async () => await req.arrayBuffer(),
    ),
    Match.when({ type: "text/plain" }, async () => await req.text()),
    Match.exhaustive,
  );

const multipartFormData = async (req: Request) => {
  const body = {};

  const form = await req.formData().then((_) => _.keys());
  for (const key of form.keys()) {
    if (body[key]) {
      continue;
    }

    const value = form.getAll(key);
    if (value.length === 1) {
      body[key] = value[0];
    } else {
      body[key] = value;
    }
  }
};
