import { Data } from "effect";

export class RedisError extends Data.TaggedError("RedisError")<{
  cause: unknown;
  message?: string;
}> {}
