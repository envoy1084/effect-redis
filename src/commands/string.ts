// String Commands
//
// APPEND - Appends a string to the value of a key. Creates the key if it doesn't exist.
// DECR - Decrements the integer value of a key by one. Uses 0 as initial value if the key doesn't exist.
// DECRBY - Decrements a number from the integer value of a key. Uses 0 as initial value if the key doesn't exist.
// DELEX - Conditionally removes the specified key based on value or hash digest comparison. ⭐ New in 8.4
// DIGEST - Returns the hash digest of a string value as a hexadecimal string. ⭐ New in 8.4
// GET - Returns the string value of a key.
// GETDEL - Returns the string value of a key after deleting the key.
// GETEX - Returns the string value of a key after setting its expiration time.
// GETRANGE - Returns a substring of the string stored at a key.
// GETSET - Returns the previous string value of a key after setting it to a new value.
// INCR - Increments the integer value of a key by one. Uses 0 as initial value if the key doesn't exist.
// INCRBY - Increments the integer value of a key by a number. Uses 0 as initial value if the key doesn't exist.
// INCRBYFLOAT - Increment the floating point value of a key by a number. Uses 0 as initial value if the key doesn't exist.
// LCS - Finds the longest common substring.
// MGET - Atomically returns the string values of one or more keys.
// MSET - Atomically creates or modifies the string values of one or more keys.
// MSETEX - Atomically sets multiple string keys with a shared expiration in a single operation. ⭐ New in 8.4
// MSETNX - Atomically modifies the string values of one or more keys only when all keys don't exist.
// PSETEX - Sets both string value and expiration time in milliseconds of a key. The key is created if it doesn't exist.
// SET - Sets the string value of a key, ignoring its type. The key is created if it doesn't exist.
// SETEX - Sets the string value and expiration time of a key. Creates the key if it doesn't exist.
// SETNX - Set the string value of a key only when the key doesn't exist.
// SETRANGE - Overwrites a part of a string value with another by an offset. Creates the key if it doesn't exist.
// STRLEN - Returns the length of a string value.
// SUBSTR - Returns a substring from a string value.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisStringKeys = [
  "append",
  "decr",
  "decrBy",
  "delEx",
  "digest",
  "get",
  "getDel",
  "getEx",
  "getRange",
  "getSet",
  "incr",
  "incrBy",
  "incrByFloat",
  "lcs",
  "mGet",
  "mSet",
  "mSetEx",
  "mSetNX",
  "pSetEx",
  "set",
  "setEx",
  "setNX",
  "setRange",
  "strLen",
  // "substr", // TODO: Not Supported
] as const;

export type RedisStringAsync = CommandGroup<
  RedisClientType,
  typeof redisStringKeys,
  "async"
>;

export type RedisStringQueue = CommandGroup<
  RedisClientType,
  typeof redisStringKeys,
  "queue"
>;

export const makeRedisString = (client: RedisClientType): RedisStringAsync =>
  makeCommandGroup(client, redisStringKeys, AsyncExec);

export const makeRedisStringQueue = (
  client: RedisClientType,
): RedisStringQueue => makeCommandGroup(client, redisStringKeys, QueueExec);
