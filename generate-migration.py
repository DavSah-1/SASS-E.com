#!/usr/bin/env python3
"""
Generate SQL migration scripts to convert camelCase columns to snake_case in Supabase.
Analyzes drizzle/schema.ts and generates ALTER TABLE statements.
"""

import re
from typing import List, Tuple, Dict

def camel_to_snake(name: str) -> str:
    """Convert camelCase to snake_case"""
    # Insert underscore before uppercase letters
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    # Handle consecutive uppercase letters
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def extract_columns_from_schema(schema_path: str) -> Dict[str, List[Tuple[str, str]]]:
    """
    Extract table definitions and their columns from schema.ts
    Returns: {table_name: [(column_camel, column_snake), ...]}
    """
    with open(schema_path, 'r') as f:
        content = f.read()
    
    tables_columns = {}
    
    # Find all table definitions
    # Pattern: export const varName = mysqlTable("table_name", {
    table_pattern = r'export const \w+ = mysqlTable\("(\w+)",\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'
    
    for match in re.finditer(table_pattern, content, re.DOTALL):
        table_name = match.group(1)
        columns_block = match.group(2)
        
        # Extract column definitions
        # Pattern: columnName: type("columnDbName", ...)
        column_pattern = r'(\w+):\s*(?:int|varchar|text|timestamp|boolean|decimal|mysqlEnum|json)\('
        
        columns_to_migrate = []
        
        for col_match in re.finditer(column_pattern, columns_block):
            column_var = col_match.group(1)
            
            # Check if this is actually a column definition (not a method like 'on')
            if column_var in ['on', 'set', 'where', 'from', 'to']:
                continue
                
            # Convert to snake_case
            column_snake = camel_to_snake(column_var)
            
            # Only add if conversion actually changes the name (i.e., it was camelCase)
            if column_var != column_snake:
                columns_to_migrate.append((column_var, column_snake))
        
        if columns_to_migrate:
            tables_columns[table_name] = columns_to_migrate
    
    return tables_columns

def generate_migration_sql(tables_columns: Dict[str, List[Tuple[str, str]]]) -> str:
    """Generate ALTER TABLE statements for all camelCase columns"""
    sql_lines = []
    sql_lines.append("-- Supabase Schema Migration: Convert camelCase columns to snake_case")
    sql_lines.append("-- Generated automatically from drizzle/schema.ts")
    sql_lines.append("-- Execute these statements in Supabase SQL Editor")
    sql_lines.append("")
    sql_lines.append("-- WARNING: This will rename columns in your database.")
    sql_lines.append("-- Ensure you have a backup before proceeding.")
    sql_lines.append("")
    
    total_columns = sum(len(cols) for cols in tables_columns.values())
    sql_lines.append(f"-- Total tables affected: {len(tables_columns)}")
    sql_lines.append(f"-- Total columns to rename: {total_columns}")
    sql_lines.append("")
    
    for table_name in sorted(tables_columns.keys()):
        columns = tables_columns[table_name]
        sql_lines.append(f"-- Table: {table_name} ({len(columns)} columns)")
        
        for camel, snake in columns:
            sql_lines.append(f"ALTER TABLE {table_name} RENAME COLUMN {camel} TO {snake};")
        
        sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_rollback_sql(tables_columns: Dict[str, List[Tuple[str, str]]]) -> str:
    """Generate rollback statements (snake_case back to camelCase)"""
    sql_lines = []
    sql_lines.append("-- Supabase Schema Rollback: Revert snake_case columns to camelCase")
    sql_lines.append("-- Use this if you need to undo the migration")
    sql_lines.append("")
    sql_lines.append("-- WARNING: This will rename columns back to their original names.")
    sql_lines.append("")
    
    for table_name in sorted(tables_columns.keys()):
        columns = tables_columns[table_name]
        sql_lines.append(f"-- Table: {table_name}")
        
        for camel, snake in columns:
            sql_lines.append(f"ALTER TABLE {table_name} RENAME COLUMN {snake} TO {camel};")
        
        sql_lines.append("")
    
    return "\n".join(sql_lines)

def main():
    schema_path = 'drizzle/schema.ts'
    
    print("Analyzing schema...")
    tables_columns = extract_columns_from_schema(schema_path)
    
    if not tables_columns:
        print("No camelCase columns found. All columns are already snake_case!")
        return
    
    print(f"Found {len(tables_columns)} tables with camelCase columns")
    print(f"Total columns to migrate: {sum(len(cols) for cols in tables_columns.values())}")
    print()
    
    # Generate migration SQL
    migration_sql = generate_migration_sql(tables_columns)
    with open('supabase-migration.sql', 'w') as f:
        f.write(migration_sql)
    print("✓ Generated: supabase-migration.sql")
    
    # Generate rollback SQL
    rollback_sql = generate_rollback_sql(tables_columns)
    with open('supabase-rollback.sql', 'w') as f:
        f.write(rollback_sql)
    print("✓ Generated: supabase-rollback.sql")
    
    # Generate summary report
    print("\nMigration Summary:")
    print("=" * 60)
    for table_name in sorted(tables_columns.keys()):
        columns = tables_columns[table_name]
        print(f"\n{table_name}:")
        for camel, snake in columns:
            print(f"  {camel:30} → {snake}")

if __name__ == '__main__':
    main()
