/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chats from "../chats.js";
import type * as clerk from "../clerk.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as gifts from "../gifts.js";
import type * as http from "../http.js";
import type * as memories from "../memories.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as projects from "../projects.js";
import type * as sharing from "../sharing.js";
import type * as teams from "../teams.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chats: typeof chats;
  clerk: typeof clerk;
  crons: typeof crons;
  files: typeof files;
  gifts: typeof gifts;
  http: typeof http;
  memories: typeof memories;
  messages: typeof messages;
  migrations: typeof migrations;
  projects: typeof projects;
  sharing: typeof sharing;
  teams: typeof teams;
  userPreferences: typeof userPreferences;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
