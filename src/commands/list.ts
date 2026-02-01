// List commands operate on lists of strings, ordered by insertion order.

// BLMOVE - Pops an element from a list, pushes it to another list and returns it. Blocks until an element is available otherwise. Deletes the list if the last element was moved.
// BLMPOP - Pops the first element from one of multiple lists. Blocks until an element is available otherwise. Deletes the list if the last element was popped.
// BLPOP - Removes and returns the first element in a list. Blocks until an element is available otherwise. Deletes the list if the last element was popped.
// BRPOP - Removes and returns the last element in a list. Blocks until an element is available otherwise. Deletes the list if the last element was popped.
// BRPOPLPUSH - Pops an element from a list, pushes it to another list and returns it. Block until an element is available otherwise. Deletes the list if the last element was popped.
// LINDEX - Returns an element from a list by its index.
// LINSERT - Inserts an element before or after another element in a list.
// LLEN - Returns the length of a list.
// LMOVE - Returns an element after popping it from one list and pushing it to another. Deletes the list if the last element was moved.
// LMPOP - Returns multiple elements from a list after removing them. Deletes the list if the last element was popped.
// LPOP - Returns the first elements in a list after removing it. Deletes the list if the last element was popped.
// LPOS - Returns the index of matching elements in a list.
// LPUSH - Prepends one or more elements to a list. Creates the key if it doesn't exist.
// LPUSHX - Prepends one or more elements to a list only when the list exists.
// LRANGE - Returns a range of elements from a list.
// LREM - Removes elements from a list. Deletes the list if the last element was removed.
// LSET - Sets the value of an element in a list by its index.
// LTRIM - Removes elements from both ends a list. Deletes the list if all elements were trimmed.
// RPOP - Returns and removes the last elements of a list. Deletes the list if the last element was popped.
// RPOPLPUSH - Returns the last element of a list after removing and pushing it to another list. Deletes the list if the last element was popped.
// RPUSH - Appends one or more elements to a list. Creates the key if it doesn't exist.
// RPUSHX - Appends an element to a list only when the list exists.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisListKeys = [
  "blMove",
  "blmPop",
  "blPop",
  "brPop",
  "brPopLPush",
  "lIndex",
  "lInsert",
  "lLen",
  "lMove",
  "lPop",
  "lPos",
  "lPush",
  "lPushX",
  "lRange",
  "lRem",
  "lSet",
  "lTrim",
  "rPop",
  "rPopLPush",
  "rPush",
  "rPushX",
] as const;

export type RedisListAsync = CommandGroup<
  RedisClientType,
  typeof redisListKeys,
  "async"
>;

export type RedisListQueue = CommandGroup<
  RedisClientType,
  typeof redisListKeys,
  "queue"
>;

export const makeRedisList = (client: RedisClientType): RedisListAsync =>
  makeCommandGroup(client, redisListKeys, AsyncExec);

export const makeRedisListQueue = (client: RedisClientType): RedisListQueue =>
  makeCommandGroup(client, redisListKeys, QueueExec);
