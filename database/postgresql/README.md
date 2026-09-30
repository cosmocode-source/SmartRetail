# PostgreSQL execution order
1. `001_schema.sql`
2. `002_indexes.sql`
3. `003_triggers_functions_views.sql`
4. `004_seed.sql` in development only
5. Use `demo_queries.sql` for required DBMS demonstrations.

Run through a migration tool in real deployments; do not manually alter production without versioning and rollback planning.
