# 🧠 Elasticsearch Cheat Sheet  

(Search + Mapping – Backend Perspective)

Using: Elasticsearch

---

## 1️⃣ CORE IDEA (Explain Like You're 10)

Imagine a huge book index.

Instead of:

Page → Words  

It stores:

Word → Page Numbers  

This is called an **Inverted Index**.

When you search:

- It does NOT scan documents
- It looks up words instantly
- Then ranks results

Fast because it searches words, not rows.

---

## 2️⃣ INDEX STRUCTURE (Mental Model)

| Concept   | Think Like |
|------------|------------|
| Index      | Database   |
| Document   | Row (JSON) |
| Field      | Column     |
| Mapping    | Schema     |

Example document:

```json
{
  "name": "Arul",
  "role": "backend",
  "experience": 5
}
```

---

## 3️⃣ FIELD TYPES (Most Important)

### 🔹 TEXT

What it does:

- Breaks sentence into words
- Lowercases
- Tokenizes
- Used for search

Example:

```json
"name": { "type": "text" }
```

Use when:

- Search bar
- Descriptions
- Articles
- Bios

❌ Don’t use for:

- Filters
- Sorting
- Aggregations

---

## 🔹 KEYWORD

What it does:

- Stores exact value
- No tokenization
- Case-sensitive (unless normalized)

Example:

```json
"role": { "type": "keyword" }
```

Use when:

- Filters
- Enums
- IDs
- Aggregations
- Sorting

❌ Don’t use for:

- Full-text search

---

## 4️⃣ GOLDEN RULE

| Operation          | Field Type |
|--------------------|------------|
| Full-text search   | text       |
| Exact filter       | keyword    |
| Aggregation        | keyword    |
| Sorting            | keyword    |
| Range query        | integer / float / date |

---

## 5️⃣ BEST PRACTICE: Multi-Field (Production Standard)

```json
"name": {
  "type": "text",
  "fields": {
    "keyword": { "type": "keyword" }
  }
}
```

Why?

Search:

- match → name

Sort / Filter:

- term → name.keyword

This avoids most real-world issues.

---

## 6️⃣ MOST COMMON QUERIES

### 🔎 match (Full-text search)

```json
{
  "query": {
    "match": {
      "name": "backend engineer"
    }
  }
}
```

- Analyzed
- Ranked
- Case-insensitive

Use for search bar.

---

### 🎯 term (Exact match)

```json
{
  "query": {
    "term": {
      "role": "backend"
    }
  }
}
```

- Exact match only
- No scoring

Use for filters.

---

### 🧠 bool (Real Production Query)

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "arul" } }
      ],
      "filter": [
        { "term": { "role": "backend" } },
        { "range": { "experience": { "gte": 3 } } }
      ]
    }
  }
}
```

Remember:

- must → affects ranking
- filter → no ranking (faster)

Backend rule:
Put filters in `filter`, not in `must`.

---

## 7️⃣ SCORING (Why Results Are Ranked)

Elasticsearch uses BM25.

Higher score when:

- Word appears often in document
- Word is rare across system
- Field is short

Rare words = higher weight.

---

## 8️⃣ MAPPING DESIGN CHECKLIST

Before creating mapping, ask:

1. Will I search this field?
2. Will I filter by it?
3. Will I aggregate on it?
4. Will I sort it?
5. Will I range query it?

Mapping must be query-driven.

---

## 9️⃣ COMMON BEGINNER MISTAKES

❌ Let Elasticsearch auto-create mapping  
→ It guesses wrong types

❌ Using text for filtering  
→ term query won’t work correctly

❌ Forgetting keyword sub-field  
→ Sorting fails later

❌ Deep pagination using from: 10000  
→ Performance issue

---

## 🔟 PRODUCTION BACKEND PATTERN

Typical architecture:

Client  
↓  
Node.js API  
↓  
PostgreSQL (source of truth)  
↓  
Elasticsearch (search layer)

Never treat Elasticsearch as primary DB.

---

## 1️⃣1️⃣ BULK INSERT (Performance)

Never index one by one in production.

```js
client.bulk({
  operations: [
    { index: { _index: 'users', _id: '1' }},
    { name: 'Arul', role: 'backend' }
  ]
})
```

---

## 1️⃣2️⃣ REFRESH INTERVAL

Default: 1 second.

Meaning:

- Data not instantly searchable
- That’s normal

---

## 🧠 SIMPLE MEMORY TRIGGER

TEXT → Search  
KEYWORD → Filter  
NUMBER → Range  
DATE → Time queries  

If confused, ask:

Do I need exact match or smart search?

Exact → keyword  
Smart search → text  

---

## 🚀 BACKEND SHORTCUT FORMULA

When designing new index:

1. Define mapping manually
2. Use multi-field for searchable strings
3. Separate search (must) from filters (filter)
4. Use bulk indexing
5. Avoid deep pagination
