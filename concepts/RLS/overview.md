# 🧠 PostgreSQL RLS (Row-Level Security) Overview

## Core Idea

RLS = Postgres automatically adds a hidden WHERE clause to every query.

---

## 🔐 Enable / Disable

    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

Force even table owners to obey RLS:

    ALTER TABLE documents FORCE ROW LEVEL SECURITY;

---

## 🧩 Policy Structure

    CREATE POLICY policy_name
    ON table_name
    FOR { SELECT | INSERT | UPDATE | DELETE }
    USING (condition)        -- for reading
    WITH CHECK (condition);  -- for writing

---

## 👀 SELECT (Read Access)

    CREATE POLICY select_docs
    ON documents
    FOR SELECT
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

---

## ✍️ INSERT (Write Access)

    CREATE POLICY insert_docs
    ON documents
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

---

## 🔄 UPDATE

    CREATE POLICY update_docs
    ON documents
    FOR UPDATE
    USING (created_by = current_setting('app.user_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

---

## ❌ DELETE

    CREATE POLICY delete_docs
    ON documents
    FOR DELETE
    USING (created_by = current_setting('app.user_id')::uuid);

---

## 🧠 USING vs WITH CHECK

- USING → SELECT, UPDATE, DELETE → Which rows you can access
- WITH CHECK → INSERT, UPDATE → Which rows you can create/modify

---

## 🏢 Multi-Tenant Pattern (Required)

    USING (tenant_id = current_setting('app.tenant_id')::uuid)

Always include this in every policy.

---

## 👥 Organization / Membership Pattern

    USING (
      organization_id IN (
        SELECT organization_id
        FROM memberships
        WHERE user_id = current_setting('app.user_id')::uuid
      )
    )

---

## ⚙️ Setting Request Context

Inside a transaction:

    SET LOCAL app.user_id = '...';
    SET LOCAL app.tenant_id = '...';
    SET LOCAL app.organization_id = '...';

Safer alternative:

    SELECT
      set_config('app.user_id', '...', true),
      set_config('app.tenant_id', '...', true);

---

## 🧩 Helper Functions

    CREATE FUNCTION current_user_id()
    RETURNS uuid AS $$
      SELECT current_setting('app.user_id')::uuid;
    $$ LANGUAGE sql STABLE;

Usage:

    USING (created_by = current_user_id())

---

## 🔗 Combining Policies

Policies are ORed by default.

To enforce strict rules:

- Put conditions in a single policy
- Or ensure all policies safely overlap

---

## 🔍 Debugging RLS

Check policies:

    SELECT * FROM pg_policies WHERE tablename = 'documents';

Test manually:

    SET app.user_id = 'user-123';
    SET app.tenant_id = 'tenant-abc';

    SELECT * FROM documents;

---

## 🚨 Common Pitfalls

- Forgot to enable RLS → policies do nothing
- Missing tenant filter → data leaks
- Using SET instead of SET LOCAL → leaks in pooled connections
- Missing WITH CHECK → unsafe writes
- Relying only on app logic → bypassable

---

## 🚀 Performance Tips

    CREATE INDEX ON documents (tenant_id);
    CREATE INDEX ON documents (organization_id);

- Avoid heavy subqueries in policies
- Prefer EXISTS over IN when possible

---

## 🧠 Mental Model

    SELECT * FROM documents
    WHERE <RLS policies are injected automatically>

---

## 🔥 Golden Rules

1. Always enforce tenant isolation
2. Always use transactions + SET LOCAL
3. Always secure INSERT/UPDATE with WITH CHECK
4. Keep policies simple and indexed
5. Always test with real user context
