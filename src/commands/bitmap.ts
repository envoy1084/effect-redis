// Bitmap Commands
//
// BITCOUNT - Counts the number of set bits (population counting) in a string.
// BITFIELD - Performs arbitrary bitfield integer operations on strings.
// BITFIELD_RO - Performs arbitrary read-only bitfield integer operations on strings.
// BITOP - Performs bitwise operations on multiple strings, and stores the result.
// BITPOS - Finds the first set (1) or clear (0) bit in a string.
// GETBIT - Returns a bit value by offset.
// SETBIT - Sets or clears the bit at offset of the string value. Creates the key if it doesn't exist.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisBitmapKeys = [
  "bitCount",
  "bitField",
  "bitFieldRo",
  "bitOp",
  "bitPos",
  "getBit",
  "setBit",
] as const;

export type RedisBitmapAsync = CommandGroup<
  RedisClientType,
  typeof redisBitmapKeys,
  "async"
>;

export type RedisBitmapQueue = CommandGroup<
  RedisClientType,
  typeof redisBitmapKeys,
  "queue"
>;

export const makeRedisBitmap = (client: RedisClientType): RedisBitmapAsync =>
  makeCommandGroup(client, redisBitmapKeys, AsyncExec);

export const makeRedisBitmapQueue = (
  client: RedisClientType,
): RedisBitmapQueue => makeCommandGroup(client, redisBitmapKeys, QueueExec);
