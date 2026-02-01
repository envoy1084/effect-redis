// Hash Commands
//
// HDEL - Deletes one or more fields and their values from a hash. Deletes the hash if no fields remain.
// HEXISTS - Determines whether a field exists in a hash.
// HEXPIRE - Set expiry for hash field using relative time to expire (seconds)
// HEXPIREAT - Set expiry for hash field using an absolute Unix timestamp (seconds)
// HEXPIRETIME - Returns the expiration time of a hash field as a Unix timestamp, in seconds.
// HGET - Returns the value of a field in a hash.
// HGETALL - Returns all fields and values in a hash.
// HGETDEL - Returns the value of a field and deletes it from the hash.
// HGETEX - Get the value of one or more fields of a given hash key, and optionally set their expiration.
// HINCRBY - Increments the integer value of a field in a hash by a number. Uses 0 as initial value if the field doesn't exist.
// HINCRBYFLOAT - Increments the floating point value of a field by a number. Uses 0 as initial value if the field doesn't exist.
// HKEYS - Returns all fields in a hash.
// HLEN - Returns the number of fields in a hash.
// HMGET - Returns the values of all fields in a hash.
// HMSET - Sets the values of multiple fields. // TODO: Not Supported
// HPERSIST - Removes the expiration time for each specified field
// HPEXPIRE - Set expiry for hash field using relative time to expire (milliseconds)
// HPEXPIREAT - Set expiry for hash field using an absolute Unix timestamp (milliseconds)
// HPEXPIRETIME - Returns the expiration time of a hash field as a Unix timestamp, in msec.
// HPTTL - Returns the TTL in milliseconds of a hash field.
// HRANDFIELD - Returns one or more random fields from a hash.
// HSCAN - Iterates over fields and values of a hash.
// HSET - Creates or modifies the value of a field in a hash.
// HSETEX - Set the value of one or more fields of a given hash key, and optionally set their expiration.
// HSETNX - Sets the value of a field in a hash only when the field doesn't exist.
// HSTRLEN - Returns the length of the value of a field.
// HTTL - Returns the TTL in seconds of a hash field.
// HVALS - Returns all values in a hash.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisHashKeys = [
  "hDel",
  "hExists",
  "hExpire",
  "hExpireAt",
  "hExpireTime",
  "hGet",
  "hGetAll",
  "hGetDel",
  "hGetEx",
  "hIncrBy",
  "hIncrByFloat",
  "hKeys",
  "hLen",
  "hmGet",
  // hmSet, // TODO: Not Supported
  "hPersist",
  "hpExpire",
  "hpExpireAt",
  "hpExpireTime",
  "hpTTL",
  "hRandField",
  "hScan",
  "hSet",
  "hSetEx",
  "hSetNX",
  "hStrLen",
  "hTTL",
  "hVals",
] as const;

export type RedisHashAsync = CommandGroup<
  RedisClientType,
  typeof redisHashKeys,
  "async"
>;

export type RedisHashQueue = CommandGroup<
  RedisClientType,
  typeof redisHashKeys,
  "queue"
>;

export const makeRedisHash = (client: RedisClientType): RedisHashAsync =>
  makeCommandGroup(client, redisHashKeys, AsyncExec);

export const makeRedisHashQueue = (client: RedisClientType): RedisHashQueue =>
  makeCommandGroup(client, redisHashKeys, QueueExec);
