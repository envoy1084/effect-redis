// JSON Commands
//
// JSON.ARRAPPEND - Append one or more JSON values into the array at path after the last element in it.
// JSON.ARRINDEX - Returns the index of the first occurrence of a JSON scalar value in the array at path
// JSON.ARRINSERT - Inserts the JSON scalar(s) value at the specified index in the array at path
// JSON.ARRLEN - Returns the length of the array at path
// JSON.ARRPOP - Removes and returns the element at the specified index in the array at path
// JSON.ARRTRIM - Trims the array at path to contain only the specified inclusive range of indices from start to stop
// JSON.CLEAR - Clears all values from an array or an object and sets numeric values to `0`
// JSON.DEBUG - Debugging container command // TODO: Not Supported
// JSON.DEBUG MEMORY - Reports the size in bytes of a key
// JSON.DEL - Deletes a value
// JSON.FORGET - Deletes a value
// JSON.GET - Gets the value at one or more paths in JSON serialized form
// JSON.MERGE - Merges a given JSON value into matching paths. Consequently, JSON values at matching paths are updated, deleted, or expanded with new children
// JSON.MGET - Returns the values at a path from one or more keys
// JSON.MSET - Sets or updates the JSON value of one or more keys
// JSON.NUMINCRBY - Increments the numeric value at path by a value
// JSON.NUMMULTBY - Multiplies the numeric value at path by a value
// JSON.OBJKEYS - Returns the JSON keys of the object at path
// JSON.OBJLEN - Returns the number of keys of the object at path
// JSON.RESP - Returns the JSON value at path in Redis Serialization Protocol (RESP) // TODO: Not Supported
// JSON.SET - Sets or updates the JSON value at a path
// JSON.STRAPPEND - Appends a string to a JSON string value at path
// JSON.STRLEN - Returns the length of the JSON String at path in key
// JSON.TOGGLE - Toggles a boolean value
// JSON.TYPE - Returns the type of the JSON value at path

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisJsonKeys = [
  "arrAppend",
  "arrIndex",
  "arrInsert",
  "arrLen",
  "arrPop",
  "arrTrim",
  "clear",
  // debug, // TODO: Not Supported
  "debugMemory",
  "del",
  "forget",
  "get",
  "merge",
  "mGet",
  "mSet",
  "numIncrBy",
  "numMultBy",
  "objKeys",
  "objLen",
  // resp, // TODO: Not Supported
  "set",
  "strAppend",
  "strLen",
  "toggle",
  "type",
] as const;

export type RedisJsonAsync = CommandGroup<
  RedisClientType["json"],
  typeof redisJsonKeys,
  "async"
>;

export type RedisJsonQueue = CommandGroup<
  RedisClientType["json"],
  typeof redisJsonKeys,
  "queue"
>;

export const makeRedisJson = (client: RedisClientType): RedisJsonAsync =>
  makeCommandGroup(client.json, redisJsonKeys, AsyncExec);

export const makeRedisJsonQueue = (client: RedisClientType): RedisJsonQueue =>
  makeCommandGroup(client.json, redisJsonKeys, QueueExec);
