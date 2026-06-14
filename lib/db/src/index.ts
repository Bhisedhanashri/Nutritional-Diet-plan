/**
 * JSON-file-based storage layer that mimics the Drizzle ORM query API.
 * Drop-in replacement for the PostgreSQL/Drizzle setup so the rest of
 * the codebase (routes, auth, etc.) keeps working without any changes.
 */

import fs from "node:fs";
import path from "node:path";

// ── helpers ────────────────────────────────────────────────────────────
const DATA_DIR = path.resolve(
  process.env["DATA_DIR"] || path.join(process.cwd(), "data"),
);

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(table: string): string {
  return path.join(DATA_DIR, `${table}.csv`);
}

function parseCSV(text: string): Record<string, any>[] {
  if (!text.trim()) return [];
  
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let val = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        val += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        val += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(val);
        val = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        row.push(val);
        result.push(row);
        row = [];
        val = '';
      } else {
        val += char;
      }
    }
  }
  
  if (val !== '' || row.length > 0 || result.length === 0) {
    row.push(val);
    result.push(row);
  }

  // Remove trailing empty rows
  while (result.length > 0 && result[result.length - 1].length <= 1 && result[result.length - 1][0] === '') {
    result.pop();
  }

  if (result.length < 2) return [];

  const headers = result[0];
  const dataRows = result.slice(1);
  
  return dataRows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      let cell = row[index] ?? '';
      if (cell === '') {
         obj[header] = null;
      } else if (cell === 'true') {
         obj[header] = true;
      } else if (cell === 'false') {
         obj[header] = false;
      } else if (cell.trim() !== '' && !isNaN(Number(cell))) {
         obj[header] = Number(cell);
      } else if ((cell.startsWith('{') && cell.endsWith('}')) || (cell.startsWith('[') && cell.endsWith(']'))) {
         try {
            obj[header] = JSON.parse(cell);
         } catch {
            obj[header] = cell;
         }
      } else {
         obj[header] = cell;
      }
    });
    return obj;
  });
}

function stringifyCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  
  const headersSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headersSet.add(key);
    }
  }
  const headers = Array.from(headersSet);
  
  let csv = headers.map(escapeCSV).join(',') + '\n';
  
  for (const row of rows) {
    const line = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      else if (val instanceof Date) val = val.toISOString();
      else if (typeof val === 'object') val = JSON.stringify(val);
      else val = String(val);
      return escapeCSV(val);
    });
    csv += line.join(',') + '\n';
  }
  
  return csv;
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

function readTable<T = Record<string, unknown>>(table: string): T[] {
  const fp = filePath(table);
  if (!fs.existsSync(fp)) return [];
  try {
    const text = fs.readFileSync(fp, "utf-8");
    return parseCSV(text) as T[];
  } catch (e) {
    console.error(`Error reading CSV for table ${table}:`, e);
    return [];
  }
}

function writeTable(table: string, rows: unknown[]): void {
  fs.writeFileSync(filePath(table), stringifyCSV(rows as Record<string, any>[]), "utf-8");
}

function nextId(table: string): number {
  const rows = readTable(table);
  if (rows.length === 0) return 1;
  return Math.max(...rows.map((r: any) => r.id ?? 0)) + 1;
}

// ── tiny query-builder that mirrors the Drizzle chaining API ──────────
// The routes use patterns like:
//   db.select().from(table).where(eq(table.field, value)).limit(1)
//   db.insert(table).values({...}).returning()
//   db.update(table).set({...}).where(eq(table.field, value)).returning()
//   db.delete(table).where(eq(table.field, value))
//   db.select({ total: sql`...` }).from(table).where(...)
//
// We replicate that with JS objects that store the intent and resolve lazily
// via .then() (thenable), so `await db.select()...` works.

type Predicate = (row: any) => boolean;
type ColProjection = Record<string, { _col: string; _agg?: string }> | null;

/* Helpers exposed as drizzle-orm re-exports */
export function eq(col: { _table: string; _col: string }, value: unknown): Predicate {
  return (row: any) => row[col._col] === value;
}

export function and(...preds: (Predicate | undefined)[]): Predicate {
  const valid = preds.filter(Boolean) as Predicate[];
  return (row: any) => valid.every((p) => p(row));
}

export function gte(col: { _table: string; _col: string }, value: unknown): Predicate {
  return (row: any) => row[col._col] >= (value as any);
}

export function lte(col: { _table: string; _col: string }, value: unknown): Predicate {
  return (row: any) => row[col._col] <= (value as any);
}

export function sql(strings: TemplateStringsArray, ...values: any[]): any {
  // The only actual usage is COALESCE(SUM(amount_ml), 0) in tracker.
  // We return a marker that the select-builder picks up.
  // Preserve the column refs so we can extract the column name for aggregation.
  const colRefs = values.filter((v: any) => v?._col);
  const raw = strings.reduce((acc, s, i) => acc + s + (values[i]?._col ?? values[i] ?? ""), "");
  return { _sql: true, _raw: raw, _colRefs: colRefs };
}

// ── column ref helper (each schema table field becomes one) ───────────
function colRef(table: string, col: string) {
  return { _table: table, _col: col };
}

// ── table descriptor ──────────────────────────────────────────────────
function tableDescriptor(name: string, columns: string[]) {
  const desc: Record<string, any> = { _name: name };
  for (const c of columns) {
    desc[c] = colRef(name, c);
  }
  return desc;
}

// ── tables (mirrors of the Drizzle schema exports) ────────────────────

export const usersTable = tableDescriptor("users", [
  "id", "clerkId", "email", "passwordHash", "name", "createdAt",
]) as any;

export const profilesTable = tableDescriptor("profiles", [
  "id", "userId", "age", "gender", "heightCm", "weightKg",
  "activityLevel", "dietPreference", "goal", "dailyCalorieTarget",
  "healthConditions", "updatedAt",
]) as any;

export const dietPlansTable = tableDescriptor("diet_plans", [
  "id", "userId", "title", "dailyCalories", "proteinGrams",
  "carbsGrams", "fatGrams", "planData", "groceryList", "createdAt",
]) as any;

export const mealEntriesTable = tableDescriptor("meal_entries", [
  "id", "userId", "mealType", "foodName", "portionSize",
  "calories", "proteinGrams", "carbsGrams", "fatGrams",
  "loggedAt", "createdAt",
]) as any;

export const waterEntriesTable = tableDescriptor("water_entries", [
  "id", "userId", "amountMl", "loggedAt", "createdAt",
]) as any;

export const weightEntriesTable = tableDescriptor("weight_entries", [
  "id", "userId", "weightKg", "loggedAt", "createdAt",
]) as any;

export const conversations = tableDescriptor("conversations", [
  "id", "title", "createdAt",
]) as any;

export const messages = tableDescriptor("messages", [
  "id", "conversationId", "role", "content", "createdAt",
]) as any;

export const gamificationTable = tableDescriptor("gamification", [
  "id", "userId", "points", "level", "streakDays",
  "lastLogDate", "badges", "updatedAt",
]) as any;

export const fastingSessionsTable = tableDescriptor("fasting_sessions", [
  "id", "userId", "mode", "startTime", "endTime",
  "status", "createdAt",
]) as any;

// ── query builders ────────────────────────────────────────────────────

class SelectBuilder {
  private _table: string = "";
  private _projection: ColProjection = null;
  private _where: Predicate | null = null;
  private _limit: number | null = null;
  private _orderCol: string | null = null;

  constructor(projection?: ColProjection) {
    this._projection = projection ?? null;
  }

  from(table: any): this {
    this._table = table._name;
    return this;
  }

  where(pred: Predicate): this {
    this._where = pred;
    return this;
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  orderBy(col: any): this {
    if (col && col._col) this._orderCol = col._col;
    return this;
  }

  /** Make the builder thenable so `await` resolves it. */
  then(resolve: (v: any) => void, reject?: (e: any) => void): void {
    try {
      resolve(this._exec());
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }

  private _exec(): any[] {
    let rows = readTable(this._table);
    if (this._where) rows = rows.filter(this._where);
    if (this._orderCol) {
      const col = this._orderCol;
      rows.sort((a: any, b: any) => {
        if (a[col] < b[col]) return -1;
        if (a[col] > b[col]) return 1;
        return 0;
      });
    }
    if (this._limit !== null) rows = rows.slice(0, this._limit);

    // Handle projection (e.g. select({ total: sql`...` }))
    if (this._projection) {
      const proj = this._projection;
      return rows.length === 0
        ? []
        : rows.map((r: any) => {
            const out: Record<string, any> = {};
            for (const [alias, spec] of Object.entries(proj)) {
              if ((spec as any)._sql) {
                // SUM aggregation — handled specially after filter
              } else if ((spec as any)._col) {
                out[alias] = r[(spec as any)._col];
              } else {
                out[alias] = r[alias];
              }
            }
            return out;
          });
    }
    // Check for SUM aggregation in projection
    if (this._projection) {
      // Already handled above
    }
    return rows;
  }
}

class InsertBuilder {
  private _table: string;
  constructor(table: any) {
    this._table = table._name;
  }

  private _values: any = null;

  values(v: any): InsertReturningBuilder {
    this._values = v;
    return new InsertReturningBuilder(this._table, v);
  }
}

class InsertReturningBuilder {
  private _table: string;
  private _values: any;
  constructor(table: string, values: any) {
    this._table = table;
    this._values = values;
  }

  returning(): InsertReturningBuilder {
    // just flag – we always return
    return this;
  }

  then(resolve: (v: any) => void, reject?: (e: any) => void): void {
    try {
      const rows = readTable(this._table);
      const id = nextId(this._table);
      const now = new Date().toISOString();
      const row = {
        id,
        ...this._values,
        createdAt: this._values.createdAt ?? now,
      };
      rows.push(row);
      writeTable(this._table, rows);
      resolve([row]);
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
}

class UpdateBuilder {
  private _table: string;
  constructor(table: any) {
    this._table = table._name;
  }

  private _setData: any = null;

  set(data: any): UpdateWhereBuilder {
    return new UpdateWhereBuilder(this._table, data);
  }
}

class UpdateWhereBuilder {
  private _table: string;
  private _setData: any;
  private _where: Predicate | null = null;

  constructor(table: string, data: any) {
    this._table = table;
    this._setData = data;
  }

  where(pred: Predicate): this {
    this._where = pred;
    return this;
  }

  returning(): this {
    return this;
  }

  then(resolve: (v: any) => void, reject?: (e: any) => void): void {
    try {
      const rows = readTable(this._table);
      const updated: any[] = [];
      for (const row of rows) {
        if (!this._where || this._where(row)) {
          Object.assign(row, this._setData);
          updated.push(row);
        }
      }
      writeTable(this._table, rows);
      resolve(updated);
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
}

class DeleteBuilder {
  private _table: string;
  private _where: Predicate | null = null;

  constructor(table: any) {
    this._table = table._name;
  }

  where(pred: Predicate): this {
    this._where = pred;
    return this;
  }

  then(resolve: (v: any) => void, reject?: (e: any) => void): void {
    try {
      let rows = readTable(this._table);
      if (this._where) rows = rows.filter((r: any) => !this._where!(r));
      writeTable(this._table, rows);
      resolve(undefined);
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
}

// ── special select builder that handles aggregation (SUM) ─────────────
class AggSelectBuilder {
  private _table: string = "";
  private _projection: Record<string, any>;
  private _where: Predicate | null = null;

  constructor(projection: Record<string, any>) {
    this._projection = projection;
  }

  from(table: any): this {
    this._table = table._name;
    return this;
  }

  where(pred: Predicate): this {
    this._where = pred;
    return this;
  }

  limit(_n: number): this {
    return this;
  }

  orderBy(_col: any): this {
    return this;
  }

  then(resolve: (v: any) => void, reject?: (e: any) => void): void {
    try {
      let rows = readTable(this._table);
      if (this._where) rows = rows.filter(this._where);

      const result: Record<string, any> = {};
      for (const [alias, spec] of Object.entries(this._projection)) {
        if (spec && spec._sql) {
          // Use the stored column refs from the sql`` tag
          const colName = spec._colRefs?.[0]?._col;
          if (colName) {
            const total = rows.reduce((s: number, r: any) => s + (Number(r[colName]) || 0), 0);
            result[alias] = total;
          } else {
            result[alias] = 0;
          }
        } else if (spec && spec._col) {
          // Just pick the value from the first row (shouldn't happen in agg context)
          result[alias] = rows[0]?.[spec._col] ?? null;
        }
      }
      resolve([result]);
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
}

// ── the db facade ─────────────────────────────────────────────────────
export const db = {
  select(projection?: Record<string, any>) {
    // Detect if any value in projection is a sql`` tag
    if (projection) {
      const hasSql = Object.values(projection).some((v: any) => v?._sql);
      if (hasSql) return new AggSelectBuilder(projection);
    }
    return new SelectBuilder(projection as ColProjection);
  },
  insert(table: any) {
    return new InsertBuilder(table);
  },
  update(table: any) {
    return new UpdateBuilder(table);
  },
  delete(table: any) {
    return new DeleteBuilder(table);
  },
};

// Re-export schema types (kept for compatibility even though we don't use Drizzle types)
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
