// Scripting commands enable server-side Lua script execution.

// EVAL - Executes a server-side Lua script.
// EVALSHA - Executes a server-side Lua script by SHA1 digest.
// EVALSHA_RO - Executes a read-only server-side Lua script by SHA1 digest.
// EVAL_RO - Executes a read-only server-side Lua script.
// FCALL - Invokes a function.
// FCALL_RO - Invokes a read-only function.
// FUNCTION DELETE - Deletes a library and its functions.
// FUNCTION DUMP - Dumps all libraries into a serialized binary payload.
// FUNCTION FLUSH - Deletes all libraries and functions.
// FUNCTION KILL - Terminates a function during execution.
// FUNCTION LIST - Returns information about all libraries.
// FUNCTION LOAD - Creates a library.
// FUNCTION RESTORE - Restores all libraries from a payload.
// FUNCTION STATS - Returns information about a function during execution.
// SCRIPT DEBUG - Sets the debug mode of server-side Lua scripts.
// SCRIPT EXISTS - Determines whether server-side Lua scripts exist in the script cache.
// SCRIPT FLUSH - Removes all server-side Lua scripts from the script cache.
// SCRIPT KILL - Terminates a server-side Lua script during execution.
// SCRIPT LOAD - Loads a server-side Lua script to the script cache.

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisScriptingKeys = [
  "eval",
  "evalSha",
  "evalShaRo",
  "evalRo",
  "fCall",
  "fCallRo",
  "functionDelete",
  "functionDump",
  "functionFlush",
  "functionKill",
  "functionList",
  "functionLoad",
  "functionRestore",
  "functionStats",
  "scriptDebug",
  "scriptExists",
  "scriptFlush",
  "scriptKill",
  "scriptLoad",
] as const;

export type RedisScriptingAsync = CommandGroup<
  RedisClientType,
  typeof redisScriptingKeys,
  "async"
>;

export type RedisScriptingQueue = CommandGroup<
  RedisClientType,
  typeof redisScriptingKeys,
  "queue"
>;

export const makeRedisScripting = (
  client: RedisClientType,
): RedisScriptingAsync =>
  makeCommandGroup(client, redisScriptingKeys, AsyncExec);

export const makeRedisScriptingQueue = (
  client: RedisClientType,
): RedisScriptingQueue =>
  makeCommandGroup(client, redisScriptingKeys, QueueExec);
