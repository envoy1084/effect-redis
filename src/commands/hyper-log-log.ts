// HyperLogLog commands provide probabilistic cardinality estimation.

// PFADD - Adds elements to a HyperLogLog key. Creates the key if it doesn't exist.
// PFCOUNT - Returns the approximated cardinality of the set(s) observed by the HyperLogLog key(s).
// PFDEBUG - Internal commands for debugging HyperLogLog values.
// PFMERGE - Merges one or more HyperLogLog values into a single key.
// PFSELFTEST - An internal command for testing HyperLogLog values.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisHyperLogLogKeys = [
  "pfAdd",
  "pfCount",
  // "pfDebug", // TODO: Not Supported
  "pfMerge",
  // "pfSelfTest", // TODO: Not Supported
] as const;

export type RedisHyperLogLogAsync = CommandGroup<
  RedisClientType,
  typeof redisHyperLogLogKeys,
  "async"
>;

export type RedisHyperLogLogQueue = CommandGroup<
  RedisClientType,
  typeof redisHyperLogLogKeys,
  "queue"
>;

export const makeRedisHyperLogLog = (
  client: RedisClientType,
): RedisHyperLogLogAsync =>
  makeCommandGroup(client, redisHyperLogLogKeys, AsyncExec);

export const makeRedisHyperLogLogQueue = (
  client: RedisClientType,
): RedisHyperLogLogQueue =>
  makeCommandGroup(client, redisHyperLogLogKeys, QueueExec);
