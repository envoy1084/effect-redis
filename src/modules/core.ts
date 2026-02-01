// core/index.ts

import { Context, Effect, Layer } from "effect";
import type { RedisClientType } from "redis";

// Commands
import * as bitMap from "../commands/bitmap";
import * as generic from "../commands/generic";
import * as geospatial from "../commands/geospatial";
import * as hash from "../commands/hash";
import * as hyperLogLog from "../commands/hyper-log-log";
import * as json from "../commands/json";
import * as list from "../commands/list";
import * as scripting from "../commands/scripting";
import * as set from "../commands/set";
import * as sortedSet from "../commands/sorted-set";
import * as string from "../commands/string";
// Connection
import { RedisConnection } from "../connection";
// Errors
import { RedisError } from "../errors";

export type RedisTxShape = string.RedisStringQueue &
  hash.RedisHashQueue &
  list.RedisListQueue &
  set.RedisSetQueue &
  sortedSet.RedisSortedSetQueue &
  bitMap.RedisBitmapQueue &
  scripting.RedisScriptingQueue &
  generic.RedisGenericQueue &
  geospatial.RedisGeoSpatialQueue &
  hyperLogLog.RedisHyperLogLogQueue & {
    json: json.RedisJsonQueue;
  };

export type Multi = <A>(
  program: (tx: RedisTxShape) => Effect.Effect<A, RedisError>,
) => Effect.Effect<
  readonly [result: A, exec: ReadonlyArray<unknown> | null],
  RedisError
>;

export type Pipeline = <A>(
  program: (tx: RedisTxShape) => Effect.Effect<A, RedisError>,
) => Effect.Effect<
  readonly [result: A, exec: ReadonlyArray<unknown>],
  RedisError
>;

export type TransactionAsync = {
  multi: Multi;
  pipeline: Pipeline;
};

export type RedisCoreShape = string.RedisStringAsync &
  hash.RedisHashAsync &
  list.RedisListAsync &
  set.RedisSetAsync &
  sortedSet.RedisSortedSetAsync &
  bitMap.RedisBitmapAsync &
  scripting.RedisScriptingAsync &
  generic.RedisGenericAsync &
  hyperLogLog.RedisHyperLogLogAsync &
  geospatial.RedisGeoSpatialAsync &
  TransactionAsync & {
    json: json.RedisJsonAsync;
  };

// biome-ignore lint/suspicious/noExplicitAny: safe
const makeRedisTx = (c: any): RedisTxShape => ({
  ...bitMap.makeRedisBitmapQueue(c),
  ...generic.makeRedisGenericQueue(c),
  ...hash.makeRedisHashQueue(c),
  ...hyperLogLog.makeRedisHyperLogLogQueue(c),
  ...list.makeRedisListQueue(c),
  ...scripting.makeRedisScriptingQueue(c),
  ...set.makeRedisSetQueue(c),
  ...sortedSet.makeRedisSortedSetQueue(c),
  ...string.makeRedisStringQueue(c),
  ...geospatial.makeRedisGeoSpatialQueue(c),
  json: json.makeRedisJsonQueue(c),
});

const makeRedisCore = (c: RedisClientType): RedisCoreShape => ({
  ...bitMap.makeRedisBitmap(c),
  ...generic.makeRedisGeneric(c),
  ...hash.makeRedisHash(c),
  ...hyperLogLog.makeRedisHyperLogLog(c),
  ...list.makeRedisList(c),
  ...scripting.makeRedisScripting(c),
  ...set.makeRedisSet(c),
  ...sortedSet.makeRedisSortedSet(c),
  ...string.makeRedisString(c),
  ...geospatial.makeRedisGeoSpatial(c),
  json: json.makeRedisJson(c),
  multi: <A>(program: (tx: RedisTxShape) => Effect.Effect<A, RedisError>) =>
    Effect.gen(function* () {
      const txClient = c.multi();
      const txApi = makeRedisTx(txClient);

      const programResult = yield* program(txApi);

      const execResult = yield* Effect.tryPromise({
        catch: (e) => new RedisError({ cause: e }),
        try: () => txClient.exec(),
      });

      return [programResult, execResult] as const;
    }),
  pipeline: <A>(program: (tx: RedisTxShape) => Effect.Effect<A, RedisError>) =>
    Effect.gen(function* () {
      const txClient = c.multi();
      const txApi = makeRedisTx(txClient);

      const programResult = yield* program(txApi);

      const execResult = yield* Effect.tryPromise({
        catch: (e) => new RedisError({ cause: e }),
        try: () => txClient.execAsPipeline(),
      });

      return [programResult, execResult] as const;
    }),
});

export class RedisCore extends Context.Tag("RedisCore")<
  RedisCore,
  RedisCoreShape
>() {}

export const RedisCoreLive = Layer.effect(
  RedisCore,
  Effect.gen(function* () {
    const { client } = yield* RedisConnection;

    client.eval("return redis.call('GET',KEYS[1])", {
      arguments: [],
      keys: ["key"],
    });

    return makeRedisCore(client);
  }),
);
