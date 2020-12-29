import { HashedValue } from "./hash.model";

export type UserID = string & { __userIDBrand: unknown };
export type HashedUserID = UserID & HashedValue;