/**
 * JSON-file-based storage layer that mimics the Drizzle ORM query API.
 * Drop-in replacement for the PostgreSQL/Drizzle setup so the rest of
 * the codebase (routes, auth, etc.) keeps working without any changes.
 */
type Predicate = (row: any) => boolean;
type ColProjection = Record<string, {
    _col: string;
    _agg?: string;
}> | null;
export declare function eq(col: {
    _table: string;
    _col: string;
}, value: unknown): Predicate;
export declare function and(...preds: (Predicate | undefined)[]): Predicate;
export declare function gte(col: {
    _table: string;
    _col: string;
}, value: unknown): Predicate;
export declare function lte(col: {
    _table: string;
    _col: string;
}, value: unknown): Predicate;
export declare function sql(strings: TemplateStringsArray, ...values: any[]): any;
export declare const usersTable: any;
export declare const profilesTable: any;
export declare const dietPlansTable: any;
export declare const mealEntriesTable: any;
export declare const waterEntriesTable: any;
export declare const weightEntriesTable: any;
export declare const conversations: any;
export declare const messages: any;
export declare const gamificationTable: any;
export declare const fastingSessionsTable: any;
declare class SelectBuilder {
    private _table;
    private _projection;
    private _where;
    private _limit;
    private _orderCol;
    constructor(projection?: ColProjection);
    from(table: any): this;
    where(pred: Predicate): this;
    limit(n: number): this;
    orderBy(col: any): this;
    /** Make the builder thenable so `await` resolves it. */
    then(resolve: (v: any) => void, reject?: (e: any) => void): void;
    private _exec;
}
declare class InsertBuilder {
    private _table;
    constructor(table: any);
    private _values;
    values(v: any): InsertReturningBuilder;
}
declare class InsertReturningBuilder {
    private _table;
    private _values;
    constructor(table: string, values: any);
    returning(): InsertReturningBuilder;
    then(resolve: (v: any) => void, reject?: (e: any) => void): void;
}
declare class UpdateBuilder {
    private _table;
    constructor(table: any);
    private _setData;
    set(data: any): UpdateWhereBuilder;
}
declare class UpdateWhereBuilder {
    private _table;
    private _setData;
    private _where;
    constructor(table: string, data: any);
    where(pred: Predicate): this;
    returning(): this;
    then(resolve: (v: any) => void, reject?: (e: any) => void): void;
}
declare class DeleteBuilder {
    private _table;
    private _where;
    constructor(table: any);
    where(pred: Predicate): this;
    then(resolve: (v: any) => void, reject?: (e: any) => void): void;
}
declare class AggSelectBuilder {
    private _table;
    private _projection;
    private _where;
    constructor(projection: Record<string, any>);
    from(table: any): this;
    where(pred: Predicate): this;
    limit(_n: number): this;
    orderBy(_col: any): this;
    then(resolve: (v: any) => void, reject?: (e: any) => void): void;
}
export declare const db: {
    select(projection?: Record<string, any>): SelectBuilder | AggSelectBuilder;
    insert(table: any): InsertBuilder;
    update(table: any): UpdateBuilder;
    delete(table: any): DeleteBuilder;
};
export type User = any;
export type Profile = any;
export type DietPlan = any;
export type MealEntry = any;
export type WaterEntry = any;
export type WeightEntry = any;
export type Conversation = any;
export type Message = any;
export type Gamification = any;
export type FastingSession = any;
export {};
//# sourceMappingURL=index.d.ts.map