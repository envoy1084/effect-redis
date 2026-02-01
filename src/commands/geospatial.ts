// Geospatial commands
// Geospatial commands operate on geographic coordinates.

// GEOADD - Adds one or more members to a geospatial index. The key is created if it doesn't exist.
// GEODIST - Returns the distance between two members of a geospatial index.
// GEOHASH - Returns members from a geospatial index as geohash strings.
// GEOPOS - Returns the longitude and latitude of members from a geospatial index.
// GEORADIUS - Queries a geospatial index for members within a distance from a coordinate, optionally stores the result.
// GEORADIUSBYMEMBER - Queries a geospatial index for members within a distance from a member, optionally stores the result.
// GEORADIUSBYMEMBER_RO - Returns members from a geospatial index that are within a distance from a member.
// GEORADIUS_RO - Returns members from a geospatial index that are within a distance from a coordinate.
// GEOSEARCH - Queries a geospatial index for members inside an area of a box or a circle. ⭐ New in 6.2
// GEOSEARCHSTORE - Queries a geospatial index for members inside an area of a box or a circle, optionally stores the result. ⭐ New in 6.2

import type { RedisClientType } from "redis";

import {
  AsyncExec,
  type CommandGroup,
  makeCommandGroup,
  QueueExec,
} from "@/helpers";

const redisGeoSpatialKeys = [
  "geoAdd",
  "geoDist",
  "geoHash",
  "geoPos",
  "geoRadius",
  "geoRadiusByMember",
  "geoRadiusByMemberRo",
  "geoRadiusRo",
  "geoSearch",
  "geoSearchStore",
] as const;

export type RedisGeoSpatialAsync = CommandGroup<
  RedisClientType,
  typeof redisGeoSpatialKeys,
  "async"
>;

export type RedisGeoSpatialQueue = CommandGroup<
  RedisClientType,
  typeof redisGeoSpatialKeys,
  "queue"
>;

export const makeRedisGeoSpatial = (
  client: RedisClientType,
): RedisGeoSpatialAsync =>
  makeCommandGroup(client, redisGeoSpatialKeys, AsyncExec);

export const makeRedisGeoSpatialQueue = (
  client: RedisClientType,
): RedisGeoSpatialQueue =>
  makeCommandGroup(client, redisGeoSpatialKeys, QueueExec);
