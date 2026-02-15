#!/bin/bash

# Fix MySQLMathScienceAdapter
sed -i 's/constructor(private db: MySql2Database<typeof schema>) {}/private async getDatabase() {\n    const db = await getDb();\n    if (!db) throw new Error("Database not available");\n    return db;\n  }/g' MySQLMathScienceAdapter.ts
sed -i 's/import type { MySql2Database } from "drizzle-orm\/mysql2";/import { getDb } from "..\/db";/g' MySQLMathScienceAdapter.ts
sed -i 's/this\.db\./db\./g' MySQLMathScienceAdapter.ts
sed -i 's/async \(get\|submit\|update\)\([^(]*\)(\([^)]*\)): Promise<\([^>]*\)> {/async \1\2(\3): Promise<\4> {\n    const db = await this.getDatabase();/g' MySQLMathScienceAdapter.ts
sed -i 's/export function createMySQLMathScienceAdapter(db: MySql2Database<typeof schema>): MathScienceAdapter {/export function createMySQLMathScienceAdapter(): MathScienceAdapter {/g' MySQLMathScienceAdapter.ts
sed -i 's/return new MySQLMathScienceAdapter(db);/return new MySQLMathScienceAdapter();/g' MySQLMathScienceAdapter.ts

echo "Script created. Run manually to fix adapters."
