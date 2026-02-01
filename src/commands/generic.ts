// COPY - Copies the value of a key to a new key.
// DEL - Deletes one or more keys.
// DUMP - Returns a serialized representation of the value stored at a key.
// EXISTS - Determines whether one or more keys exist.
// EXPIRE - Sets the expiration time of a key in seconds.
// EXPIREAT - Sets the expiration time of a key to a Unix timestamp.
// EXPIRETIME - Returns the expiration time of a key as a Unix timestamp.
// KEYS - Returns all key names that match a pattern.
// MIGRATE - Atomically transfers a key from one Redis instance to another.
// MOVE - Moves a key to another database.
// OBJECT ENCODING - Returns the internal encoding of a Redis object.
// OBJECT FREQ - Returns the logarithmic access frequency counter of a Redis object.
// OBJECT IDLETIME - Returns the time since the last access to a Redis object.
// OBJECT REFCOUNT - Returns the reference count of a value of a key.
// PERSIST - Removes the expiration time of a key.
// PEXPIRE - Sets the expiration time of a key in milliseconds.
// PEXPIREAT - Sets the expiration time of a key to a Unix milliseconds timestamp.
// PEXPIRETIME - Returns the expiration time of a key as a Unix milliseconds timestamp.
// PTTL - Returns the expiration time in milliseconds of a key.
// RANDOMKEY - Returns a random key name from the database.
// RENAME - Renames a key and overwrites the destination.
// RENAMENX - Renames a key only when the target key name doesn't exist.
// RESTORE - Creates a key from the serialized representation of a value.
// Redis 6.2 Commands Reference - Complete list of all Redis commands available in version 6.2, organized by functional group
// Redis 7.2 Commands Reference - Complete list of all Redis commands available in version 7.2, organized by functional group
// Redis 7.4 Commands Reference - Complete list of all Redis commands available in version 7.4, organized by functional group
// Redis 8.0 Commands Reference - Complete list of all Redis commands available in version 8.0, organized by functional group
// Redis 8.2 Commands Reference - Complete list of all Redis commands available in version 8.2, organized by functional group
// Redis 8.4 Commands Reference - Complete list of all Redis commands available in version 8.4, organized by functional group
// SCAN - Iterates over the key names in the database.
// SORT - Sorts the elements in a list, a set, or a sorted set, optionally storing the result.
// SORT_RO - Returns the sorted elements of a list, a set, or a sorted set.
// TOUCH - Returns the number of existing keys out of those specified after updating the time they were last accessed.
// TTL - Returns the expiration time in seconds of a key.
// TYPE - Determines the type of value stored at a key.
// UNLINK - Asynchronously deletes one or more keys.
// WAIT - Blocks until the asynchronous replication of all preceding write commands sent by the connection is completed.
// WAITAOF - Blocks until all of the preceding write commands sent by the connection are written to the append-only file of the master and/or replicas.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisGenericKeys = [
  "copy",
  "del",
  "dump",
  "exists",
  "expire",
  "expireAt",
  "expireTime",
  "keys",
  "migrate",
  "move",
  // "object", // TODO: Not Supported
  "persist",
  "pExpire",
  "pExpireAt",
  "pExpireTime",
  "pTTL",
  "randomKey",
  "rename",
  "renameNX",
  "restore",
  "scan",
  "sort",
  "sortRo",
  "touch",
  "ttl",
  "type",
  "unlink",
  "wait",
  // "waitAof", // TODO: Not Supported
] as const;

export type RedisGenericAsync = CommandGroup<
  RedisClientType,
  typeof redisGenericKeys,
  "async"
>;

export type RedisGenericQueue = CommandGroup<
  RedisClientType,
  typeof redisGenericKeys,
  "queue"
>;

export const makeRedisGeneric = (client: RedisClientType): RedisGenericAsync =>
  makeCommandGroup(client, redisGenericKeys, AsyncExec);

export const makeRedisGenericQueue = (
  client: RedisClientType,
): RedisGenericQueue => makeCommandGroup(client, redisGenericKeys, QueueExec);
