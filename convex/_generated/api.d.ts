/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as attempts from "../attempts.js";
import type * as banks from "../banks.js";
import type * as crons from "../crons.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_names from "../lib/names.js";
import type * as lib_playerStore from "../lib/playerStore.js";
import type * as lib_util from "../lib/util.js";
import type * as link from "../link.js";
import type * as maintenance from "../maintenance.js";
import type * as players from "../players.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  attempts: typeof attempts;
  banks: typeof banks;
  crons: typeof crons;
  leaderboard: typeof leaderboard;
  "lib/names": typeof lib_names;
  "lib/playerStore": typeof lib_playerStore;
  "lib/util": typeof lib_util;
  link: typeof link;
  maintenance: typeof maintenance;
  players: typeof players;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
