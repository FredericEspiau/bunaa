import * as S from "@effect/schema/Schema";
import { Effect } from "effect";

type ContentType =
  | "application/json"
  | "application/octet-stream"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "text/plain";

type HTTPMethod =
  | "ACL"
  | "ALL"
  | "BIND"
  | "CHECKOUT"
  | "CONNECT"
  | "COPY"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "LINK"
  | "LOCK"
  | "M-SEARCH"
  | "MERGE"
  | "MKACTIVITY"
  | "MKCALENDAR"
  | "MKCOL"
  | "MOVE"
  | "NOTIFY"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PROPFIND"
  | "PROPPATCH"
  | "PURGE"
  | "PUT"
  | "REBIND"
  | "REPORT"
  | "SEARCH"
  | "SOURCE"
  | "SUBSCRIBE"
  | "TRACE"
  | "UNBIND"
  | "UNLINK"
  | "UNLOCK"
  | "UNSUBSCRIBE";

export type Module = {
  handlers: Array<Handler<any, any, any, any, any>>;
};

type HandlerBase<Body extends HTTPSchema, HandlerInput, R, E, A> = {
  handler: (_: HandlerInput) => Effect.Effect<R, E, A>;
  method: Exclude<HTTPMethod, "POST">;
  schema: Body;
  transform: (_: { body: S.ToStruct<Body["body"]> }) => HandlerInput;
  url: string;
};

export type HandlerPost = {
  method: "POST";
  type: ContentType;
};

export type Handler<Body extends HTTPSchema, HandlerInput, R, E, A> =
  | HandlerBase<Body, HandlerInput, R, E, A>
  | (Omit<HandlerBase<Body, HandlerInput, R, E, A>, "method"> & HandlerPost);

type HTTPSchema = {
  body: S.StructFields;
};

export const handler: Handler<
  { body: { name: S.Schema<string> } },
  { name: string },
  never,
  Error,
  string
> = {
  handler: (input) => Effect.succeed(`Hello ${input.name}`),
  method: "POST",
  schema: {
    body: {
      name: S.string,
    },
  },
  transform: (x) => x.body,
  type: "application/json",
  url: "/hello",
};
