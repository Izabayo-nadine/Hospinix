# Database Column Type Fix

## Issue

There's an issue with PostgreSQL column types where some text fields are being treated as `bytea` (binary data) instead of text. This causes errors when using string functions like `LOWER()` in queries:

```
ERROR: function lower(bytea) does not exist
```

## Fix Options

### Option 1: Run the Provided SQL Script (Recommended)

1. Connect to your PostgreSQL database using psql or any PostgreSQL client
2. Run the SQL script provided in `fix_db_columns.sql`:

```bash
# Method 1: Using psql
psql -U your_username -d your_database_name -f fix_db_columns.sql

# Method 2: Manually copy and paste the contents of fix_db_columns.sql
# into your PostgreSQL client and execute
```

### Option 2: Use the Fallback Query in the Code

The application now includes a fallback to a native SQL query if the JPQL query fails. This approach:

- First tries the regular JPA query
- If that fails, falls back to using a native SQL query without the problematic LOWER() function

## Preventing Future Issues

1. **Column Types**: When creating database schemas, always specify explicit column types to avoid automatic type inference.
2. **Entity Annotations**: Use `@Column` annotations with detailed type information in your JPA entity classes.
3. **Database Migrations**: Consider using a dedicated migration tool like Flyway or Liquibase for managing database schema changes.

## Troubleshooting

If you're still experiencing issues after applying these fixes:

1. Check the PostgreSQL server logs for more detailed error messages
2. Use `\d patients` in psql to view the actual column types of the patients table
3. Try a database dump and restore if the column types cannot be altered
4. Contact the development team with the full error stack trace from your application logs

## Changes Made to the Application

1. Removed all `LOWER()` functions from the repository JPQL queries
2. Added a native SQL fallback query
3. Added error handling in the controller to use the fallback query
4. Created SQL script to fix column types
