# effect-redis

> A experimental, Effect wrapper for Redis, providing type-safe, composable Redis operations with support for transactions, pipelines, and all major Redis command groups.

## What is This?

**effect-redis** is a comprehensive Redis client wrapper built on top of [Effect](https://effect.website/) and the [redis](https://www.npmjs.com/package/redis) npm package. It provides:

- **Effect-based API**: Full integration with Effect's functional error handling, dependency injection, and compositional patterns
- **Type-safe operations**: TypeScript types for all Redis commands with proper argument and return type validation
- **Transaction support**: Built-in support for Redis `MULTI` transactions with automatic queuing
- **Pipeline support**: Batch multiple commands efficiently with automatic execution
- **Comprehensive command coverage**: Support for 11+ Redis command groups including strings, hashes, lists, sets, sorted sets, geospatial, JSON, bitmaps, HyperLogLog, scripting, and generic commands
- **Dependency-driven**: Leverages Effect's Layer system for elegant connection management and resource lifecycle handling
- **Error handling**: Unified error handling through Effect's error channel with custom `RedisError` type

## Quick Start

### Installation
****
```bash
npm install @envoy1084/effect-redis effect @effect/platform-node
# or
yarn add @envoy1084/effect-redis effect @effect/platform-node
# or
pnpm add @envoy1084/effect-redis effect @effect/platform-node
# or
bun add @envoy1084/effect-redis effect @effect/platform-node
```

### Basic Usage

```typescript
import { runMain } from "@effect/platform-node/NodeRuntime";
import {
  layerWithOptions,
  RedisCore,
  RedisCoreLive,
} from "@envoy1084/effect-redis";
import { Effect, Layer } from "effect";

// Create the Redis layer with connection options
const RedisLayer = RedisCoreLive.pipe(
  Layer.provideMerge(
    layerWithOptions({
      url: "redis://localhost:6379",
    }),
  ),
);

// Define your program
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Use redis commands
  yield* redis.set("mykey", "myvalue");
  const value = yield* redis.get("mykey");
  yield* Effect.log(`Got value: ${value}`);
});

// Run the program
program.pipe(Effect.provide(RedisLayer), runMain);
```

## Connection Setup

### Providing Layers to Your Program

effect-redis uses Effect's Layer system for dependency injection and resource management. Here's how to configure connections:

#### 1. **With Custom Connection Options**

```typescript
import { layerWithOptions } from "@envoy1084/effect-redis";
import { Layer } from "effect";

const RedisLayer = RedisCoreLive.pipe(
  Layer.provideMerge(
    layerWithOptions({
      url: "redis://localhost:6379",
      password: "your-password",
      database: 0,
      // ... all RedisClientOptions from the redis package
    }),
  ),
);
```

#### 2. **Multiple Redis Instances**

```typescript
import { RedisCore, RedisCoreLive, layerWithOptions } from "@envoy1084/effect-redis";
import { Context, Layer, Effect } from "effect";

// Define tags for different Redis instances
class PrimaryRedis extends Context.Tag("PrimaryRedis")<
  PrimaryRedis,
  RedisCoreShape
>() {}

class CacheRedis extends Context.Tag("CacheRedis")<
  CacheRedis,
  RedisCoreShape
>() {}

// Create separate layers
const PrimaryRedisLayer = Layer.effect(
  PrimaryRedis,
  Effect.gen(function* () {
    const { client } = yield* RedisConnection;
    return makeRedisCore(client);
  }),
).pipe(
  Layer.provideMerge(
    layerWithOptions({ url: "redis://primary:6379" }),
  ),
);

// Use in your program
const program = Effect.gen(function* () {
  const primary = yield* PrimaryRedis;
  const cache = yield* CacheRedis;
  // Use both instances
});
```

## Usage Guide

### String Commands

String commands operate on text values.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Basic GET/SET
  yield* redis.set("name", "Alice");
  const name = yield* redis.get("name");

  // Multiple keys
  yield* redis.mSet([
    ["key1", "value1"],
    ["key2", "value2"],
  ]);
  const values = yield* redis.mGet(["key1", "key2"]);

  // Increment/Decrement
  yield* redis.set("counter", "10");
  yield* redis.incr("counter");        // 11
  yield* redis.incrBy("counter", 5);   // 16
  yield* redis.decr("counter");        // 15
  yield* redis.decrBy("counter", 3);   // 12

  // Float operations
  yield* redis.set("price", "19.99");
  yield* redis.incrByFloat("price", 0.01); // 20.00

  // Advanced operations
  yield* redis.append("name", " Smith");
  const length = yield* redis.strLen("name");
  const substring = yield* redis.getRange("name", 0, 4);
  const oldValue = yield* redis.getSet("name", "Bob");
  yield* redis.setNX("newkey", "value");  // Only if key doesn't exist
  yield* redis.setEx("tempkey", 60, "value"); // With expiration
});
```

**Supported String Commands:**
- `get`, `set`, `mGet`, `mSet`, `setNX`, `mSetNX`
- `incr`, `incrBy`, `incrByFloat`, `decr`, `decrBy`
- `append`, `strLen`, `getRange`, `setRange`
- `getSet`, `getDel`, `getEx`, `setEx`, `pSetEx`
- `getdel`, `delEx`, `digest`, `lcs`, `mSetEx`

### Hash Commands

Hash commands operate on objects with named fields.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Basic operations
  yield* redis.hSet("user:1", "name", "Alice");
  yield* redis.hSet("user:1", {
    "age": "30",
    "email": "alice@example.com",
  });

  const name = yield* redis.hGet("user:1", "name");
  const allFields = yield* redis.hGetAll("user:1");
  const keys = yield* redis.hKeys("user:1");
  const values = yield* redis.hVals("user:1");

  // Check existence
  const exists = yield* redis.hExists("user:1", "name");

  // Increment
  yield* redis.hSet("user:1", "age", "30");
  yield* redis.hIncrBy("user:1", "age", 1); // 31
  yield* redis.hIncrByFloat("user:1", "score", 2.5);

  // Multiple operations
  const fields = yield* redis.hmGet("user:1", ["name", "email"]);

  // Delete and set operations
  yield* redis.hSetNX("user:1", "name", "Bob"); // Won't update
  yield* redis.hDel("user:1", "email");

  // Expiration (Redis 7.4+)
  yield* redis.hExpire("user:1", 3600, ["name", "email"]);
  const ttl = yield* redis.hTTL("user:1", "name");
});
```

**Supported Hash Commands:**
- `hGet`, `hSet`, `hGetAll`, `hmGet`, `hKeys`, `hVals`, `hLen`
- `hExists`, `hSetNX`, `hDel`, `hGetDel`
- `hIncrBy`, `hIncrByFloat`, `hStrLen`
- `hExpire`, `hExpireAt`, `hExpireTime`, `hPersist`
- `hpExpire`, `hpExpireAt`, `hpExpireTime`, `hpTTL`, `hTTL`
- `hRandField`, `hScan`, `hGetEx`, `hSetEx`

### List Commands

List commands operate on ordered collections of strings.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Push operations
  yield* redis.lPush("tasks", "task1");
  yield* redis.lPush("tasks", "task2", "task3");
  yield* redis.rPush("tasks", "task4");

  // Pop operations
  const firstTask = yield* redis.lPop("tasks");
  const lastTask = yield* redis.rPop("tasks");

  // Get range
  const allTasks = yield* redis.lRange("tasks", 0, -1);
  const midTasks = yield* redis.lRange("tasks", 0, 5);

  // Check length
  const count = yield* redis.lLen("tasks");

  // Index operations
  const taskByIndex = yield* redis.lIndex("tasks", 2);
  yield* redis.lSet("tasks", 0, "updated_task");

  // Insert and remove
  yield* redis.lInsert("tasks", "BEFORE", "task2", "new_task");
  yield* redis.lRem("tasks", 1, "old_task");
  yield* redis.lTrim("tasks", 0, 10);

  // Move between lists
  yield* redis.lMove("tasks", "completed", "LEFT", "RIGHT");

  // Blocking operations (waits for element)
  const task = yield* redis.blPop(["tasks"], 30); // 30 second timeout
});
```

**Supported List Commands:**
- `lPush`, `lPushX`, `rPush`, `rPushX`
- `lPop`, `rPop`, `lLen`, `lIndex`, `lSet`
- `lRange`, `lRem`, `lTrim`, `lInsert`, `lPos`
- `lMove`, `lMPop`, `rPopLPush`
- `blPop`, `brPop`, `brPopLPush`, `blMove`, `blmPop`

### Set Commands

Set commands operate on unordered collections of unique strings.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Add and check members
  yield* redis.sAdd("tags", "javascript", "typescript", "nodejs");
  const isMember = yield* redis.sIsMember("tags", "javascript");
  const allMembers = yield* redis.sMembers("tags");
  const count = yield* redis.sCard("tags");

  // Multiple membership check
  const members = yield* redis.smIsMember("tags", [
    "javascript",
    "python",
  ]);

  // Random members
  const randomMember = yield* redis.sRandMember("tags");
  const randomMembers = yield* redis.sRandMember("tags", 2);

  // Pop operations
  const popped = yield* redis.sPop("tags");
  const poppedMany = yield* redis.sPop("tags", 2);

  // Set operations
  const intersection = yield* redis.sInter(["tags", "languages"]);
  const union = yield* redis.sUnion(["tags", "languages"]);
  const difference = yield* redis.sDiff(["tags", "languages"]);

  // Store operations
  yield* redis.sInterStore("common_tags", ["tags", "languages"]);
  yield* redis.sUnionStore("all_tags", ["tags", "languages"]);
  yield* redis.sDiffStore("unique_tags", ["tags", "languages"]);

  // Remove
  yield* redis.sRem("tags", "python");

  // Move
  yield* redis.sMove("tags", "languages", "javascript");

  // Scan
  const scanResult = yield* redis.sScan("tags", 0);
});
```

**Supported Set Commands:**
- `sAdd`, `sRem`, `sCard`, `sMembers`, `sPop`, `sRandMember`
- `sIsMember`, `smIsMember`, `sMove`
- `sInter`, `sInterCard`, `sInterStore`
- `sUnion`, `sUnionStore`
- `sDiff`, `sDiffStore`
- `sScan`

### Sorted Set Commands

Sorted set commands operate on sets with scores that determine order.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Add members with scores
  yield* redis.zAdd("leaderboard", [
    { score: 100, member: "Alice" },
    { score: 90, member: "Bob" },
    { score: 85, member: "Charlie" },
  ]);

  // Get score
  const score = yield* redis.zScore("leaderboard", "Alice");
  const scores = yield* redis.zmScore("leaderboard", [
    "Alice",
    "Bob",
  ]);

  // Rank operations (0-indexed, ascending by default)
  const rank = yield* redis.zRank("leaderboard", "Alice");
  const revRank = yield* redis.zRevRank("leaderboard", "Alice");

  // Count
  const total = yield* redis.zCard("leaderboard");
  const inRange = yield* redis.zCount("leaderboard", 80, 100);

  // Range operations
  const topThree = yield* redis.zRange("leaderboard", 0, 2);
  const topThreeScores = yield* redis.zRange("leaderboard", 0, 2, {
    withScores: true,
  });

  // Range by score
  const highScorers = yield* redis.zRangeByScore("leaderboard", 90, 100);

  // Range by lex
  const lexRange = yield* redis.zRangeByLex("leaderboard", "-", "+");

  // Pop operations
  const highest = yield* redis.zPopMax("leaderboard");
  const lowest = yield* redis.zPopMin("leaderboard");

  // Increment score
  yield* redis.zIncrBy("leaderboard", 10, "Bob");

  // Remove
  yield* redis.zRem("leaderboard", "Charlie");
  yield* redis.zRemRangeByRank("leaderboard", 0, 1);
  yield* redis.zRemRangeByScore("leaderboard", 0, 50);

  // Set operations
  const inter = yield* redis.zInter(["leaderboard", "active_players"]);
  yield* redis.zInterStore("top_active", 2, ["leaderboard", "active_players"]);

  const union = yield* redis.zUnion(["leaderboard", "archive"]);
  yield* redis.zUnionStore("all_time", 2, ["leaderboard", "archive"]);

  // Scan
  const scanResult = yield* redis.zScan("leaderboard", 0);
});
```

**Supported Sorted Set Commands:**
- `zAdd`, `zRem`, `zCard`, `zCount`, `zScore`, `zmScore`
- `zRank`, `zRevRank`, `zRange`, `zRevRange`
- `zRangeByScore`, `zRangeByLex`, `zRangeStore`
- `zPopMax`, `zPopMin`, `zMPop`
- `zIncrBy`, `zRandMember`
- `zRemRangeByRank`, `zRemRangeByScore`, `zRemRangeByLex`
- `zLexCount`, `zInter`, `zInterCard`, `zInterStore`
- `zUnion`, `zUnionStore`, `zDiff`, `zDiffStore`
- `zScan`

### Generic Commands

Generic commands work with all data types.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Check existence
  const exists = yield* redis.exists(["key1", "key2", "key3"]);

  // Get type
  const type = yield* redis.type("mykey");

  // Delete keys
  yield* redis.del(["key1", "key2"]);
  yield* redis.unlink(["key3", "key4"]); // Async delete

  // Expiration
  yield* redis.expire("tempkey", 3600); // 1 hour in seconds
  yield* redis.expireAt("tempkey", Math.floor(Date.now() / 1000) + 3600);
  yield* redis.pExpire("tempkey", 3600000); // milliseconds
  yield* redis.pExpireAt("tempkey", Date.now() + 3600000);

  const ttl = yield* redis.ttl("tempkey"); // seconds
  const pttl = yield* redis.pTTL("tempkey"); // milliseconds
  yield* redis.persist("tempkey"); // Remove expiration

  // Get expiration time
  const expirationTime = yield* redis.expireTime("tempkey"); // Unix timestamp in seconds
  const pExpirationTime = yield* redis.pExpireTime("tempkey"); // Unix timestamp in milliseconds

  // Rename
  yield* redis.rename("oldkey", "newkey");
  yield* redis.renameNX("oldkey", "newkey"); // Only if newkey doesn't exist

  // Copy
  yield* redis.copy("source", "destination");

  // Keys pattern matching
  const allKeys = yield* redis.keys("*");
  const userKeys = yield* redis.keys("user:*");

  // Random key
  const randomKey = yield* redis.randomKey();

  // Scan (cursor-based iteration)
  const scanResult = yield* redis.scan(0, { pattern: "user:*", count: 10 });

  // Sort
  const sorted = yield* redis.sort("mylist", {
    by: "weight_*",
    limit: { offset: 0, count: 10 },
    get: ["object_*", "#"],
    alpha: true,
    direction: "DESC",
  });

  // Touch (update last access time)
  const touched = yield* redis.touch(["key1", "key2"]);

  // Dump and restore
  const serialized = yield* redis.dump("mykey");
  yield* redis.restore("newkey", 0, serialized);

  // Migrate (move to another Redis instance)
  yield* redis.migrate("target-host", 6379, "mykey", 0, 5000);

  // Wait for replication
  yield* redis.wait(1, 1000); // Wait for 1 replica within 1000ms
});
```

**Supported Generic Commands:**
- `del`, `exists`, `expire`, `expireAt`, `expireTime`
- `keys`, `migrate`, `move`, `persist`
- `pExpire`, `pExpireAt`, `pExpireTime`, `pTTL`
- `randomKey`, `rename`, `renameNX`, `restore`
- `scan`, `sort`, `sortRo`, `touch`, `ttl`, `type`
- `unlink`, `wait`, `copy`, `dump`

### JSON Commands

JSON commands store and manipulate JSON documents (requires Redis Stack).

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Set JSON value
  yield* redis.json.set("user:1", "$", {
    name: "Alice",
    age: 30,
    tags: ["developer", "typescript"],
    metadata: {
      created: "2024-01-01",
      active: true,
    },
  });

  // Get JSON value
  const user = yield* redis.json.get("user:1");
  const name = yield* redis.json.get("user:1", { path: "$.name" });

  // Update specific path
  yield* redis.json.set("user:1", "$.age", 31);

  // String operations
  yield* redis.json.strAppend("user:1", "$.name", " Smith");
  const nameLength = yield* redis.json.strLen("user:1", "$.name");

  // Numeric operations
  yield* redis.json.numIncrBy("user:1", "$.age", 1);
  yield* redis.json.numMultBy("user:1", "$.age", 2);

  // Array operations
  yield* redis.json.arrAppend("user:1", "$.tags", "nodejs");
  yield* redis.json.arrInsert("user:1", "$.tags", 0, "javascript");
  const tagsLength = yield* redis.json.arrLen("user:1", "$.tags");
  const tag = yield* redis.json.arrPop("user:1", "$.tags");
  yield* redis.json.arrTrim("user:1", "$.tags", 0, 2);
  const tagIndex = yield* redis.json.arrIndex(
    "user:1",
    "$.tags",
    "typescript",
  );

  // Object operations
  const objKeys = yield* redis.json.objKeys("user:1", "$.metadata");
  const objLen = yield* redis.json.objLen("user:1", "$.metadata");

  // Type checking
  const valueType = yield* redis.json.type("user:1", "$");

  // Boolean toggle
  yield* redis.json.toggle("user:1", "$.metadata.active");

  // Delete path
  yield* redis.json.del("user:1", "$.metadata.created");

  // Merge JSON
  yield* redis.json.merge("user:1", "$", { lastLogin: "2024-01-15" });

  // Multiple keys
  const users = yield* redis.json.mGet(["user:1", "user:2", "user:3"], "$");

  // Multiple set
  yield* redis.json.mSet([
    { key: "user:4", path: "$", value: { name: "Bob" } },
    { key: "user:5", path: "$", value: { name: "Charlie" } },
  ]);

  // Clear (sets arrays to [] and objects to {})
  yield* redis.json.clear("user:1");

  // Debug memory (get memory usage)
  const memoryUsage = yield* redis.json.debugMemory("user:1");
});
```

**Supported JSON Commands:**
- `get`, `set`, `del`, `clear`, `merge`, `forget`
- `mGet`, `mSet`
- `type`, `debugMemory`
- `strAppend`, `strLen`
- `numIncrBy`, `numMultBy`
- `arrAppend`, `arrIndex`, `arrInsert`, `arrLen`, `arrPop`, `arrTrim`
- `objKeys`, `objLen`
- `toggle`

### Geospatial Commands

Geospatial commands store and query geographic coordinates.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Add locations
  yield* redis.geoAdd("cities", [
    {
      longitude: -122.419,
      latitude: 37.775,
      member: "San Francisco",
    },
    {
      longitude: -118.243,
      latitude: 34.052,
      member: "Los Angeles",
    },
    { longitude: -87.629, latitude: 41.878, member: "Chicago" },
  ]);

  // Get positions
  const positions = yield* redis.geoPos("cities", [
    "San Francisco",
    "Los Angeles",
  ]);

  // Get distance
  const distance = yield* redis.geoDist(
    "cities",
    "San Francisco",
    "Los Angeles",
    "km",
  );

  // Get geohash
  const hashes = yield* redis.geoHash("cities", [
    "San Francisco",
    "Los Angeles",
  ]);

  // Find nearby locations
  const nearby = yield* redis.geoRadius(
    "cities",
    -122.419,
    37.775,
    100,
    "km",
  );

  // Find nearby from member
  const nearbyFromMember = yield* redis.geoRadiusByMember(
    "cities",
    "San Francisco",
    100,
    "km",
  );

  // Search in box/circle (Redis 6.2+)
  const searchBox = yield* redis.geoSearch("cities", {
    member: "San Francisco",
    byBox: { width: 200, height: 200, unit: "km" },
  });

  const searchCircle = yield* redis.geoSearch("cities", {
    member: "San Francisco",
    byRadius: { radius: 100, unit: "km" },
  });

  // Store search results
  yield* redis.geoSearchStore("nearby", "cities", {
    member: "San Francisco",
    byRadius: { radius: 100, unit: "km" },
  });
});
```

**Supported Geospatial Commands:**
- `geoAdd`, `geoDist`, `geoHash`, `geoPos`
- `geoRadius`, `geoRadiusByMember`
- `geoRadiusRo`, `geoRadiusByMemberRo`
- `geoSearch`, `geoSearchStore`

### Bitmap Commands

Bitmap commands perform bitwise operations on strings.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Set and get bits
  yield* redis.setBit("bitmap", 7, 1);
  const bit = yield* redis.getBit("bitmap", 7);

  // Count set bits
  const count = yield* redis.bitCount("bitmap");
  const countRange = yield* redis.bitCount("bitmap", { start: 0, end: 10 });

  // Find first set/clear bit
  const firstSet = yield* redis.bitPos("bitmap", 1);
  const firstClear = yield* redis.bitPos("bitmap", 0);
  const firstSetAfter = yield* redis.bitPos("bitmap", 1, { start: 5 });

  // Bitwise operations
  yield* redis.bitOp("AND", "dest", ["bitmap1", "bitmap2"]);
  yield* redis.bitOp("OR", "dest", ["bitmap1", "bitmap2"]);
  yield* redis.bitOp("XOR", "dest", ["bitmap1", "bitmap2"]);
  yield* redis.bitOp("NOT", "dest", ["bitmap1"]);

  // Bitfield operations
  const fieldResult = yield* redis.bitField("mykey", {
    operations: [
      { type: "u4", offset: 0, operation: "GET" },
      { type: "u4", offset: 4, operation: "SET", value: 15 },
    ],
  });
});
```

**Supported Bitmap Commands:**
- `getBit`, `setBit`, `bitCount`, `bitPos`
- `bitOp`, `bitField`, `bitFieldRo`

### HyperLogLog Commands

HyperLogLog commands provide probabilistic cardinality estimation (count unique elements).

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Add elements
  yield* redis.pfAdd("hll", "a", "b", "c", "d", "e");
  yield* redis.pfAdd("hll", "f", "g");

  // Get cardinality (approximate count of unique elements)
  const count = yield* redis.pfCount(["hll"]);

  // Count across multiple HyperLogLogs
  const multiCount = yield* redis.pfCount(["hll1", "hll2", "hll3"]);

  // Merge HyperLogLogs
  yield* redis.pfMerge("combined", ["hll1", "hll2", "hll3"]);

  const mergedCount = yield* redis.pfCount(["combined"]);
});
```

**Supported HyperLogLog Commands:**
- `pfAdd`, `pfCount`, `pfMerge`

### Scripting Commands

Scripting commands allow server-side Lua script execution.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Execute Lua script
  const result = yield* redis.eval(
    "return redis.call('GET',KEYS[1])",
    {
      keys: ["mykey"],
      arguments: [],
    },
  );

  // Script with arguments
  const sum = yield* redis.eval(
    `
    local val1 = redis.call('GET', KEYS[1])
    local val2 = tonumber(ARGV[1])
    return val1 + val2
    `,
    {
      keys: ["counter"],
      arguments: ["10"],
    },
  );

  // Load script (returns SHA1)
  const sha = yield* redis.scriptLoad("return 'Hello Redis'");

  // Execute by SHA
  const cachedResult = yield* redis.evalSha(sha, {
    keys: [],
    arguments: [],
  });

  // Check if scripts exist
  const exists = yield* redis.scriptExists([sha]);

  // Flush script cache
  yield* redis.scriptFlush();

  // Function operations (Redis 7.0+)
  yield* redis.functionLoad("#!lua name=mylib\n return 'hello'");
  const functions = yield* redis.functionList();
  yield* redis.functionFlush();
});
```

**Supported Scripting Commands:**
- `eval`, `evalSha`, `evalRo`, `evalShaRo`
- `scriptDebug`, `scriptExists`, `scriptFlush`, `scriptKill`, `scriptLoad`
- `fCall`, `fCallRo`
- `functionDelete`, `functionDump`, `functionFlush`, `functionKill`
- `functionList`, `functionLoad`, `functionRestore`, `functionStats`

### Transactions (MULTI/EXEC)

Transactions allow you to batch multiple commands and execute them atomically.

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Start a transaction
  const [result, execResult] = yield* redis.multi((tx) =>
    Effect.gen(function* () {
      yield* tx.set("key1", "value1");
      yield* tx.set("key2", "value2");
      const val = yield* tx.get("key1");
      yield* tx.incr("counter");

      return val; // This is the "result" returned
    }),
  );

  // result contains the return value from the transaction block
  yield* Effect.log(`Transaction result: ${result}`);

  // execResult is an array of responses from each command
  // null if transaction was aborted
  yield* Effect.log(`Exec responses: ${execResult}`);

  // Transaction with condition
  const [txResult, execOK] = yield* redis.multi((tx) =>
    Effect.gen(function* () {
      const currentValue = yield* tx.get("balance");

      if (currentValue && Number(currentValue) >= 100) {
        yield* tx.decrBy("balance", 100);
        yield* tx.incrBy("savings", 100);
        return true;
      }

      return false;
    }),
  );
});
```

### Pipelines

Pipelines batch multiple commands for more efficient execution (like transactions but without atomicity guarantees).

```typescript
const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Execute multiple commands in a pipeline
  const [result, execResult] = yield* redis.pipeline((pipe) =>
    Effect.gen(function* () {
      yield* pipe.set("key1", "value1");
      yield* pipe.set("key2", "value2");
      yield* pipe.set("key3", "value3");
      const val = yield* pipe.get("key1");
      yield* pipe.mGet(["key1", "key2", "key3"]);

      return val;
    }),
  );

  // result contains the return value from the pipeline block
  yield* Effect.log(`Pipeline result: ${result}`);

  // execResult is an array of responses from each command
  yield* Effect.log(`Pipeline responses:`, execResult);

  // Pipeline with many operations
  const [bulkResult, responses] = yield* redis.pipeline((pipe) =>
    Effect.gen(function* () {
      // Simulate bulk data operations
      for (let i = 0; i < 1000; i++) {
        yield* pipe.set(`key:${i}`, `value:${i}`);
      }
      return "bulk operation complete";
    }),
  );
});
```

## Complete Command Reference

### String Commands (24)

```
append, decr, decrBy, delEx, digest, get, getDel, getEx, getRange
getSet, incr, incrBy, incrByFloat, lcs, mGet, mSet, mSetEx, mSetNX
pSetEx, set, setEx, setNX, setRange, strLen
```

### Hash Commands (25)

```
hDel, hExists, hExpire, hExpireAt, hExpireTime, hGet, hGetAll, hGetDel
hGetEx, hIncrBy, hIncrByFloat, hKeys, hLen, hmGet, hPersist, hpExpire
hpExpireAt, hpExpireTime, hpTTL, hRandField, hScan, hSet, hSetEx
hSetNX, hStrLen, hTTL, hVals
```

### List Commands (21)

```
blMove, blmPop, blPop, brPop, brPopLPush, lIndex, lInsert, lLen, lMove
lPop, lPos, lPush, lPushX, lRange, lRem, lSet, lTrim, rPop
rPopLPush, rPush, rPushX
```

### Set Commands (17)

```
sAdd, sCard, sDiff, sDiffStore, sInter, sInterCard, sInterStore, sIsMember
sMembers, smIsMember, sMove, sPop, sRandMember, sRem, sScan, sUnion
sUnionStore
```

### Sorted Set Commands (34)

```
bzMPop, bzPopMax, bzPopMin, zAdd, zCard, zCount, zDiff, zDiffStore
zIncrBy, zInter, zInterCard, zInterStore, zLexCount, zmPop, zmScore
zPopMax, zPopMin, zRandMember, zRange, zRangeByLex, zRangeByScore
zRangeStore, zRank, zRem, zRemRangeByLex, zRemRangeByRank
zRemRangeByScore, zRevRank, zScan, zScore, zUnion, zUnionStore
```

### Generic Commands (30)

```
copy, del, dump, exists, expire, expireAt, expireTime, keys, migrate
move, persist, pExpire, pExpireAt, pExpireTime, pTTL, randomKey
rename, renameNX, restore, scan, sort, sortRo, touch, ttl, type
unlink, wait
```

### JSON Commands (24)

```
arrAppend, arrIndex, arrInsert, arrLen, arrPop, arrTrim, clear, debugMemory
del, forget, get, merge, mGet, mSet, numIncrBy, numMultBy, objKeys
objLen, set, strAppend, strLen, toggle, type
```

### Geospatial Commands (10)

```
geoAdd, geoDist, geoHash, geoPos, geoRadius, geoRadiusByMember
geoRadiusByMemberRo, geoRadiusRo, geoSearch, geoSearchStore
```

### Bitmap Commands (7)

```
bitCount, bitField, bitFieldRo, bitOp, bitPos, getBit, setBit
```

### HyperLogLog Commands (3)

```
pfAdd, pfCount, pfMerge
```

### Scripting Commands (19)

```
eval, evalRo, evalSha, evalShaRo, fCall, fCallRo, functionDelete
functionDump, functionFlush, functionKill, functionList, functionLoad
functionRestore, functionStats, scriptDebug, scriptExists, scriptFlush
scriptKill, scriptLoad
```

## Error Handling

effect-redis uses Effect's error handling system with a custom `RedisError` type:

```typescript
import { Effect } from "effect";
import { RedisError } from "@envoy1084/effect-redis";

const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Errors are automatically caught and wrapped in RedisError
  const result = yield* redis.get("mykey").pipe(
    Effect.catchTag("RedisError", (error) => {
      yield* Effect.log(`Redis error: ${error.message}`);
      return Effect.succeed("default_value");
    }),
  );
});
```

## Advanced Usage

### Combining Commands with Effect

```typescript
import { Effect, Array as EffectArray } from "effect";

const program = Effect.gen(function* () {
  const redis = yield* RedisCore;

  // Process multiple keys in parallel
  const keys = ["user:1", "user:2", "user:3"];
  const users = yield* Effect.all(
    keys.map((key) => redis.get(key)),
    { concurrency: 3 },
  );

  // Conditional operations
  const exists = yield* redis.exists(["mykey"]);
  if (exists > 0) {
    const value = yield* redis.get("mykey");
    yield* Effect.log(value);
  }

  // Error recovery
  const value = yield* redis
    .get("mayNotExist")
    .pipe(
      Effect.orElse(() => Effect.succeed("default")),
    );
});
```

### Custom Context for Dependency Injection

```typescript
import { Context, Effect, Layer } from "effect";

class MyService extends Context.Tag("MyService")<
  MyService,
  { doSomething: () => Effect.Effect<string> }
>() {}

const myServiceLive = Layer.succeed(MyService, {
  doSomething: () => Effect.succeed("done"),
});

const program = Effect.gen(function* () {
  const redis = yield* RedisCore;
  const service = yield* MyService;

  const result = yield* service.doSomething();
  yield* redis.set("result", result);
});

// Compose layers
const AppLayer = Layer.mergeAll(RedisLayer, myServiceLive);
program.pipe(Effect.provide(AppLayer), runMain);
```
## Future Work

Following command groups are supported:

- [x] String commands
- [x] Hash commands
- [x] List commands
- [x] Set commands
- [x] Sorted set commands
- [ ] Stream commands
- [x] Bitmap commands
- [x] HyperLogLog commands
- [x] Geospatial commands
- [x] JSON commands
- [ ] Search commands
- [ ] Time series commands
- [ ] Vector set commands
- [ ] Pub/Sub commands
- [x] Transaction commands (Pipeline and Multi)
- [x] Scripting commands
- [ ] Connection commands
- [ ] Server commands
- [ ] Cluster commands
- [x] Generic commands
  
We are working on adding support for other Redis command groups. If you have any suggestions or requests, please feel free to open an issue or submit a pull request.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT