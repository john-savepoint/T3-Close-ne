/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  ActionBuilder,
  HttpActionBuilder,
  InternalActionBuilder,
  InternalMutationBuilder,
  InternalQueryBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import { GenericDataModel } from "convex/server";

declare const query: QueryBuilder<GenericDataModel, "public">;
declare const mutation: MutationBuilder<GenericDataModel, "public">;
declare const action: ActionBuilder<GenericDataModel, "public">;
declare const internalQuery: InternalQueryBuilder<GenericDataModel>;
declare const internalMutation: InternalMutationBuilder<GenericDataModel>;
declare const internalAction: InternalActionBuilder<GenericDataModel>;
declare const httpAction: HttpActionBuilder<GenericDataModel>;

export { action, httpAction, internalAction, internalMutation, internalQuery, mutation, query };