// Set commands operate on unordered collections of unique strings.

// SADD - Adds one or more members to a set. Creates the key if it doesn't exist.
// SCARD - Returns the number of members in a set.
// SDIFF - Returns the difference of multiple sets.
// SDIFFSTORE - Stores the difference of multiple sets in a key.
// SINTER - Returns the intersect of multiple sets.
// SINTERCARD - Returns the number of members of the intersect of multiple sets.
// SINTERSTORE - Stores the intersect of multiple sets in a key.
// SISMEMBER - Determines whether a member belongs to a set.
// SMEMBERS - Returns all members of a set.
// SMISMEMBER - Determines whether multiple members belong to a set.
// SMOVE - Moves a member from one set to another.
// SPOP - Returns one or more random members from a set after removing them. Deletes the set if the last member was popped.
// SRANDMEMBER - Get one or multiple random members from a set
// SREM - Removes one or more members from a set. Deletes the set if the last member was removed.
// SSCAN - Iterates over members of a set.
// SUNION - Returns the union of multiple sets.
// SUNIONSTORE - Stores the union of multiple sets in a key.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisSetKeys = [
  "sAdd",
  "sCard",
  "sDiff",
  "sDiffStore",
  "sInter",
  "sInterCard",
  "sInterStore",
  "sIsMember",
  "sMembers",
  "smIsMember",
  "sMove",
  "sPop",
  "sRandMember",
  "sRem",
  "sScan",
  "sUnion",
  "sUnionStore",
] as const;

export type RedisSetAsync = CommandGroup<
  RedisClientType,
  typeof redisSetKeys,
  "async"
>;

export type RedisSetQueue = CommandGroup<
  RedisClientType,
  typeof redisSetKeys,
  "queue"
>;

export const makeRedisSet = (client: RedisClientType): RedisSetAsync =>
  makeCommandGroup(client, redisSetKeys, AsyncExec);

export const makeRedisSetQueue = (client: RedisClientType): RedisSetQueue =>
  makeCommandGroup(client, redisSetKeys, QueueExec);
