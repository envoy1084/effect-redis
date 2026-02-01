import { Context, Effect, Layer } from "effect";
import {
  createClient,
  type RedisClientOptions,
  type RedisClientType,
} from "redis";

export type RedisConnectionShape = {
  readonly client: RedisClientType;
};

export class RedisConnection extends Context.Tag("RedisConnection")<
  RedisConnection,
  RedisConnectionShape
>() {}

export const layerWithOptions = (options: RedisClientOptions) =>
  Layer.scoped(
    RedisConnection,
    Effect.acquireRelease(
      Effect.promise(async () => {
        const client = createClient(options) as RedisClientType;

        await client.connect();
        return { client };
      }),
      ({ client }) => Effect.promise(() => client.quit()),
    ),
  );

export type { RedisClientOptions } from "redis";
